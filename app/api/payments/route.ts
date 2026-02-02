import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - 결제 생성 (토스페이먼츠 결제창 호출 전)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { chatRoomId, paymentMethod } = body

    if (!chatRoomId) {
      return NextResponse.json({ error: '채팅방 ID가 필요합니다' }, { status: 400 })
    }

    // 채팅방 조회
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        quote: true,
        rfq: true,
        buyer: { select: { id: true, companyName: true, email: true, phone: true } },
        supplier: { select: { id: true, companyName: true } },
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구매자만 결제 가능
    if (chatRoom.buyerId !== session.user.id) {
      return NextResponse.json({ error: '구매자만 결제할 수 있습니다' }, { status: 403 })
    }

    if (!chatRoom.quote) {
      return NextResponse.json({ error: '제안 정보가 없습니다' }, { status: 400 })
    }

    const amount = chatRoom.quote.totalPrice
    const orderId = `ORDER_${chatRoom.id}_${Date.now()}`
    const orderName = `${chatRoom.rfq?.title || '발주'} 결제`

    // 토스페이먼츠 결제 정보 반환
    return NextResponse.json({
      success: true,
      paymentInfo: {
        orderId,
        orderName,
        amount,
        customerName: chatRoom.buyer?.companyName || '',
        customerEmail: chatRoom.buyer?.email || '',
        customerMobilePhone: chatRoom.buyer?.phone || '',
        chatRoomId: chatRoom.id,
        supplierId: chatRoom.supplierId,
        supplierName: chatRoom.supplier?.companyName || '',
      },
      // 토스페이먼츠 클라이언트 키 (테스트용)
      clientKey: process.env.TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq',
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: '결제 정보 생성에 실패했습니다.' },
      { status: 500 }
    )
  }
}
