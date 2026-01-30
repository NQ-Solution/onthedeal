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
            bankName: true,
            bankAccount: true,
            bankHolder: true,
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

    // 수수료 계산 (제안 제출 시 이미 선차감됨 - 여기서 추가 차감 없음)
    const commissionRate = 0.03
    const commissionAmount = Math.round(quote.totalPrice * commissionRate)

    // 주문 생성 (크레딧은 제안 제출 시 이미 선차감되었으므로 여기서 차감하지 않음)
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

    // 채팅방 상태 업데이트
    await prisma.chatRoom.update({
      where: { id: body.chat_room_id },
      data: {
        status: 'deal_confirmed',
        dealConfirmedAt: new Date(),
      },
    })

    // 알림 생성 - 구매자에게
    await prisma.notification.create({
      data: {
        userId: quote.rfq.buyerId,
        type: 'order_update',
        title: '주문이 생성되었습니다',
        message: `"${quote.rfq.title}" 주문이 생성되었습니다. 결제를 진행해주세요.`,
        link: `/checkout/${order.id}`,
      },
    })

    // 알림 생성 - 공급자에게
    await prisma.notification.create({
      data: {
        userId: quote.supplierId,
        type: 'order_update',
        title: '새 주문이 확정되었습니다',
        message: `"${quote.rfq.title}" 주문이 확정되었습니다. 결제 완료 후 배송을 준비해주세요.`,
        link: '/supplier/orders',
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return NextResponse.json({ error: '주문 생성에 실패했습니다' }, { status: 500 })
  }
}
