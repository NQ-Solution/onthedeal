import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // 견적 및 RFQ 정보 가져오기
    const quote = await prisma.quote.findUnique({
      where: { id: body.quote_id },
      include: {
        rfq: true,
      },
    })

    if (!quote) {
      return NextResponse.json({ error: '견적을 찾을 수 없습니다' }, { status: 404 })
    }

    const commissionRate = 0.03 // 3% 수수료
    const commissionAmount = Math.round(quote.totalPrice * commissionRate)

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        chatRoomId: body.chat_room_id,
        rfqId: quote.rfqId,
        quoteId: quote.id,
        buyerId: quote.rfq.buyerId,
        supplierId: quote.supplierId,
        productAmount: quote.totalPrice,
        totalAmount: quote.totalPrice + commissionAmount,
        commissionAmount: commissionAmount,
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 생성 오류:', error)
    return NextResponse.json({ error: '주문 생성에 실패했습니다' }, { status: 500 })
  }
}
