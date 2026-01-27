import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role')

  try {
    const whereClause = role === 'supplier'
      ? { supplierId: session.user.id }
      : { buyerId: session.user.id }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            category: true,
            quantity: true,
            unit: true,
            deliveryDate: true,
            deliveryAddress: true,
          },
        },
        quote: {
          select: {
            id: true,
            unitPrice: true,
            totalPrice: true,
            deliveryDate: true,
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    return NextResponse.json({ error: '주문 목록 조회에 실패했습니다' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // 제안 및 RFQ 정보 가져오기
    const quote = await prisma.quote.findUnique({
      where: { id: body.quote_id },
      include: {
        rfq: true,
      },
    })

    if (!quote) {
      return NextResponse.json({ error: '제안을 찾을 수 없습니다' }, { status: 404 })
    }

    const commissionRate = 0.03 // 3% 플랫폼 수수료 (판매자 크레딧에서 차감)
    const commissionAmount = Math.round(quote.totalPrice * commissionRate)

    // 판매자 크레딧 확인
    const supplierCredit = await prisma.credit.findUnique({
      where: { supplierId: quote.supplierId },
    })

    if (!supplierCredit || supplierCredit.balance < commissionAmount) {
      return NextResponse.json({
        error: '판매자의 크레딧이 부족합니다. 크레딧 충전 후 거래가 가능합니다.',
        requiredCredit: commissionAmount,
        currentCredit: supplierCredit?.balance || 0,
      }, { status: 400 })
    }

    // 주문 생성 (구매자가 지불하는 금액 = productAmount = totalAmount)
    // 수수료는 판매자 크레딧에서 별도 차감
    const order = await prisma.order.create({
      data: {
        chatRoomId: body.chat_room_id,
        rfqId: quote.rfqId,
        quoteId: quote.id,
        buyerId: quote.rfq.buyerId,
        supplierId: quote.supplierId,
        productAmount: quote.totalPrice,       // 상품 금액
        totalAmount: quote.totalPrice,          // 구매자 지불 금액 (수수료 별도 없음)
        commissionAmount: commissionAmount,     // 플랫폼 수수료 (판매자 크레딧에서 차감)
        supplierFee: commissionAmount,          // 판매자 부담 수수료
        buyerFee: 0,                            // 구매자 부담 수수료 없음
        status: 'pending',
        paymentMethod: body.payment_method,
      },
    })

    // 판매자 크레딧에서 수수료 차감
    await prisma.$transaction([
      prisma.credit.update({
        where: { supplierId: quote.supplierId },
        data: { balance: { decrement: commissionAmount } },
      }),
      prisma.creditLog.create({
        data: {
          supplierId: quote.supplierId,
          amount: -commissionAmount,
          type: 'use',
          description: `주문 수수료 (주문번호: ${order.id.slice(0, 8)})`,
          referenceId: order.id,
          balanceAfter: supplierCredit.balance - commissionAmount,
        },
      }),
    ])

    // 채팅방 상태 업데이트
    await prisma.chatRoom.update({
      where: { id: body.chat_room_id },
      data: {
        status: 'deal_confirmed',
        dealConfirmedAt: new Date(),
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return NextResponse.json({ error: '주문 생성에 실패했습니다' }, { status: 500 })
  }
}
