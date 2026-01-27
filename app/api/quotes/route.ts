import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 제안 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rfqId = searchParams.get('rfq_id')
  const role = searchParams.get('role') // 'buyer' or 'supplier'

  try {
    let whereClause: any = {}

    // 특정 RFQ의 제안만
    if (rfqId) {
      whereClause.rfqId = rfqId
    }

    // 공급자: 자신이 보낸 제안
    if (role === 'supplier') {
      whereClause.supplierId = session.user.id
    }

    // 구매자: 자신의 RFQ에 대한 제안만
    if (role === 'buyer') {
      whereClause.rfq = {
        buyerId: session.user.id,
      }
    }

    const quotes = await prisma.quote.findMany({
      where: whereClause,
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            quantity: true,
            unit: true,
            buyerId: true,
          },
        },
        supplier: {
          select: {
            companyName: true,
            contactName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('제안 조회 오류:', error)
    return NextResponse.json({ error: '제안 조회에 실패했습니다' }, { status: 500 })
  }
}

// 제안 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  // 공급자만 제안 가능
  if (session.user.role !== 'supplier') {
    return NextResponse.json({ error: '공급자만 제안할 수 있습니다' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // RFQ 정보 가져오기
    const rfq = await prisma.rFQ.findUnique({
      where: { id: body.rfq_id },
    })

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ를 찾을 수 없습니다' }, { status: 404 })
    }

    if (rfq.status !== 'open') {
      return NextResponse.json({ error: '이미 마감된 발주입니다' }, { status: 400 })
    }

    // 이미 제안했는지 확인
    const existingQuote = await prisma.quote.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId: body.rfq_id,
          supplierId: session.user.id,
        },
      },
    })

    if (existingQuote) {
      return NextResponse.json({ error: '이미 이 발주에 제안하셨습니다' }, { status: 400 })
    }

    const totalPrice = body.unit_price * rfq.quantity

    // 크레딧 선차감 금액 계산 (구매 희망가 최소금액의 3% 또는 총 금액의 3%)
    const baseAmount = rfq.budgetMin || totalPrice
    const creditDeduction = Math.round(baseAmount * 0.03)

    // 공급자 크레딧 확인
    const credit = await prisma.credit.findUnique({
      where: { supplierId: session.user.id },
    })

    if (!credit || credit.balance < creditDeduction) {
      return NextResponse.json({
        error: '크레딧이 부족합니다',
        required: creditDeduction,
        current: credit?.balance || 0,
      }, { status: 400 })
    }

    // 트랜잭션으로 제안 생성 + 크레딧 차감
    const result = await prisma.$transaction(async (tx) => {
      // 1. 제안 생성
      const quote = await tx.quote.create({
        data: {
          rfqId: body.rfq_id,
          supplierId: session.user.id,
          unitPrice: body.unit_price,
          totalPrice: totalPrice,
          deliveryDate: new Date(body.delivery_date),
          note: body.note || null,
          status: 'pending',
          optionType: body.optionType || 'basic',
          commissionRate: 3.0, // 기본 수수료율 3%
        },
      })

      // 2. 크레딧 차감
      const newBalance = credit.balance - creditDeduction
      await tx.credit.update({
        where: { supplierId: session.user.id },
        data: { balance: newBalance },
      })

      // 3. 크레딧 로그 생성
      await tx.creditLog.create({
        data: {
          supplierId: session.user.id,
          amount: -creditDeduction,
          type: 'use',
          description: `제안 제출 - ${rfq.title}`,
          referenceId: quote.id,
          balanceAfter: newBalance,
        },
      })

      // 4. 채팅방 생성 (제안과 동시에)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 3) // 3일 후 만료

      await tx.chatRoom.create({
        data: {
          rfqId: body.rfq_id,
          quoteId: quote.id,
          buyerId: rfq.buyerId,
          supplierId: session.user.id,
          status: 'active',
          expiresAt,
        },
      })

      // 5. 알림 생성 - 구매자에게 (새 제안)
      await tx.notification.create({
        data: {
          userId: rfq.buyerId,
          type: 'new_quote',
          title: '새 제안이 도착했습니다',
          message: `"${rfq.title}"에 새로운 제안이 도착했습니다. 단가: ${body.unit_price.toLocaleString()}원`,
          link: '/buyer/quotes',
        },
      })

      // 6. 알림 생성 - 공급자에게 (크레딧 차감)
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'system',
          title: '제안 제출 완료',
          message: `"${rfq.title}" 제안이 제출되었습니다. 수수료 ${creditDeduction.toLocaleString()}원 차감.`,
          link: '/supplier/quotes',
        },
      })

      return { quote, creditDeduction, newBalance }
    })

    return NextResponse.json({
      ...result.quote,
      creditDeduction: result.creditDeduction,
      newBalance: result.newBalance,
      message: `제안이 제출되었습니다. ${result.creditDeduction.toLocaleString()}원이 선차감되었습니다.`,
    })
  } catch (error) {
    console.error('제안 생성 오류:', error)
    return NextResponse.json({ error: '제안 생성에 실패했습니다' }, { status: 500 })
  }
}
