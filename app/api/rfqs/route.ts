import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// RFQ 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const role = searchParams.get('role') // 'buyer' or 'supplier'

  const session = await getServerSession(authOptions)

  try {
    let whereClause: any = {}

    // 구매자: 자신의 RFQ만
    if (role === 'buyer' && session?.user?.id) {
      whereClause.buyerId = session.user.id
    }

    // 공급자: 열린 RFQ만 (단, 타겟팅된 RFQ는 해당 공급자에게만 표시)
    if (role === 'supplier' && session?.user?.id) {
      whereClause.status = 'open'
      // 타겟팅되지 않은 발주 OR 자신에게 타겟팅된 발주만 표시
      whereClause.OR = [
        { isTargeted: false },
        { targetSupplierId: session.user.id }
      ]
    } else if (role === 'supplier') {
      whereClause.status = 'open'
      whereClause.isTargeted = false
    }

    if (status && status !== 'all') {
      whereClause.status = status
    }

    if (category && category !== '전체') {
      whereClause.category = category
    }

    const rfqs = await prisma.rFQ.findMany({
      where: whereClause,
      include: {
        buyer: {
          select: {
            companyName: true,
            contactName: true,
          },
        },
        _count: {
          select: {
            // 대기중 또는 수락된 제안만 카운트 (거절/만료 제외)
            quotes: {
              where: {
                status: {
                  in: ['pending', 'accepted'],
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(rfqs)
  } catch (error) {
    console.error('RFQ 조회 오류:', error)
    return NextResponse.json({ error: 'RFQ 조회에 실패했습니다' }, { status: 500 })
  }
}

// RFQ 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  // 구매자만 발주 등록 가능
  if (session.user.role !== 'buyer') {
    return NextResponse.json({ error: '구매자만 발주를 등록할 수 있습니다' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // 필수 필드 검증
    if (!body.title || !body.description || body.quantity === undefined || !body.delivery_date || !body.delivery_address) {
      return NextResponse.json({
        error: '필수 항목을 모두 입력해주세요',
        missing: {
          title: !body.title,
          description: !body.description,
          quantity: body.quantity === undefined,
          delivery_date: !body.delivery_date,
          delivery_address: !body.delivery_address,
        }
      }, { status: 400 })
    }

    // 타겟 공급자 정보 확인 (재발주인 경우)
    const targetSupplierId = body.target_supplier_id || null
    const isTargeted = !!targetSupplierId

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: session.user.id,
        title: body.title,
        category: body.category || '육류',
        description: body.description,
        quantity: body.quantity,
        unit: body.unit || '박스',
        desiredPrice: body.desired_price || null,
        budgetMin: body.budget_min || null,
        budgetMax: body.budget_max || null,
        items: body.items || null,
        // 간소화된 폼 신규 필드
        orderSizeRange: body.order_size_range || null,
        orderFrequency: body.order_frequency || null,
        referenceImages: body.reference_images || [],
        deliveryDate: new Date(body.delivery_date),
        deliveryAddress: body.delivery_address,
        status: 'open',
        // 타겟 공급자 (재발주용)
        targetSupplierId: targetSupplierId,
        isTargeted: isTargeted,
      },
    })

    // 알림 생성 - 구매자에게 (발주 등록 확인)
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'system',
        title: isTargeted ? '재발주 등록 완료' : '발주 등록 완료',
        message: isTargeted
          ? `"${body.title}" 재발주가 등록되었습니다. 해당 공급자의 제안을 기다려주세요.`
          : `"${body.title}" 발주가 등록되었습니다. 공급자의 제안을 기다려주세요.`,
        link: `/buyer/rfqs/${rfq.id}`,
      },
    })

    // 알림 생성 - 공급자들에게 (새 발주 알림)
    if (isTargeted && targetSupplierId) {
      // 타겟팅된 재발주: 특정 공급자에게만 알림
      const budgetText = body.budget_min && body.budget_max
        ? `${Math.floor(body.budget_min / 10000)}만원 ~ ${Math.floor(body.budget_max / 10000)}만원`
        : '협의'

      await prisma.notification.create({
        data: {
          userId: targetSupplierId,
          type: 'system',
          title: '🔔 재발주 요청이 도착했습니다',
          message: `이전 거래처에서 "${body.title}" 재발주를 요청했습니다. 예산: ${budgetText}`,
          link: `/supplier/rfqs/${rfq.id}`,
        },
      })
    } else {
      // 일반 발주: 모든 승인된 공급자에게 알림
      const suppliers = await prisma.user.findMany({
        where: {
          role: 'supplier',
          approvalStatus: 'approved',
        },
        select: { id: true },
      })

      if (suppliers.length > 0) {
        const budgetText = body.budget_min && body.budget_max
          ? `${Math.floor(body.budget_min / 10000)}만원 ~ ${Math.floor(body.budget_max / 10000)}만원`
          : '협의'

        await prisma.notification.createMany({
          data: suppliers.map((supplier) => ({
            userId: supplier.id,
            type: 'system' as const,
            title: '새로운 발주가 등록되었습니다',
            message: `"${body.title}" (${body.category || '육류'}) - 예산: ${budgetText}`,
            link: `/supplier/rfqs/${rfq.id}`,
          })),
        })
      }
    }

    return NextResponse.json(rfq)
  } catch (error) {
    console.error('RFQ 생성 오류:', error)
    return NextResponse.json({ error: 'RFQ 생성에 실패했습니다' }, { status: 500 })
  }
}
