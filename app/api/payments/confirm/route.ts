import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - 토스페이먼츠 결제 승인
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentKey, orderId, amount, chatRoomId } = body

    if (!paymentKey || !orderId || !amount || !chatRoomId) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 })
    }

    // 채팅방 확인
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: {
        quote: true,
        rfq: true,
        buyer: { select: { companyName: true } },
        supplier: { select: { companyName: true } },
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    if (chatRoom.buyerId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 토스페이먼츠 결제 승인 API 호출
    const secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R'
    const encryptedSecretKey = Buffer.from(secretKey + ':').toString('base64')

    const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const confirmData = await confirmResponse.json()

    if (!confirmResponse.ok) {
      console.error('Toss payment confirm error:', confirmData)
      return NextResponse.json(
        { error: confirmData.message || '결제 승인에 실패했습니다' },
        { status: 400 }
      )
    }

    // 결제 성공 - DB 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 채팅방 상태 업데이트
      const updatedRoom = await tx.chatRoom.update({
        where: { id: chatRoomId },
        data: {
          status: 'payment_confirmed',
          dealConfirmedAt: new Date(),
        },
      })

      // 주문 생성 또는 업데이트
      let order = await tx.order.findFirst({
        where: { chatRoomId },
      })

      if (!order && chatRoom.quote) {
        order = await tx.order.create({
          data: {
            chatRoomId,
            rfqId: chatRoom.rfqId,
            quoteId: chatRoom.quoteId!,
            buyerId: chatRoom.buyerId,
            supplierId: chatRoom.supplierId,
            status: 'preparing',
            productAmount: chatRoom.quote.totalPrice,
            totalAmount: chatRoom.quote.totalPrice,
            commissionAmount: Math.round(chatRoom.quote.totalPrice * 0.03),
            supplierFee: Math.round(chatRoom.quote.totalPrice * 0.03),
            paymentMethod: 'card',
            paymentKey,
          },
        })
      } else if (order) {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'preparing',
            paymentMethod: 'card',
            paymentKey,
          },
        })
      }

      // 시스템 메시지 생성
      await tx.chatMessage.create({
        data: {
          chatRoomId,
          senderId: chatRoom.buyerId,
          senderType: 'system',
          senderName: '시스템',
          content: `${chatRoom.buyer?.companyName}님이 카드결제를 완료했습니다. (${amount.toLocaleString()}원)`,
        },
      })

      // 판매자에게 알림
      await tx.notification.create({
        data: {
          userId: chatRoom.supplierId,
          type: 'payment_confirmed',
          title: '결제 완료',
          message: `"${chatRoom.rfq?.title}" 거래에서 구매자가 카드결제를 완료했습니다. 납품을 준비해주세요.`,
          link: `/chat/${chatRoomId}`,
        },
      })

      return updatedRoom
    })

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      payment: {
        paymentKey: confirmData.paymentKey,
        orderId: confirmData.orderId,
        amount: confirmData.totalAmount,
        method: confirmData.method,
        status: confirmData.status,
      },
    })
  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      { error: '결제 승인 처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}
