import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 견적 목록 조회
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

    // 특정 RFQ의 견적만
    if (rfqId) {
      whereClause.rfqId = rfqId
    }

    // 공급자: 자신이 보낸 견적
    if (role === 'supplier') {
      whereClause.supplierId = session.user.id
    }

    // 구매자: 자신의 RFQ에 대한 견적만
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
    console.error('견적 조회 오류:', error)
    return NextResponse.json({ error: '견적 조회에 실패했습니다' }, { status: 500 })
  }
}

// 견적 생성
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
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

    const totalPrice = body.unit_price * rfq.quantity

    const quote = await prisma.quote.create({
      data: {
        rfqId: body.rfq_id,
        supplierId: session.user.id,
        unitPrice: body.unit_price,
        totalPrice: totalPrice,
        deliveryDate: new Date(body.delivery_date),
        note: body.note || null,
        status: 'pending',
      },
    })

    // TODO: 크레딧 차감 로직 추가

    return NextResponse.json(quote)
  } catch (error) {
    console.error('견적 생성 오류:', error)
    return NextResponse.json({ error: '견적 생성에 실패했습니다' }, { status: 500 })
  }
}
