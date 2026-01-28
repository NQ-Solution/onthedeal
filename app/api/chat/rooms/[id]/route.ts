import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 채팅방 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const roomId = params.id

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            category: true,
            quantity: true,
            unit: true,
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
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 참여자만 조회 가능
    if (chatRoom.buyerId !== session.user.id && chatRoom.supplierId !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json({
      id: chatRoom.id,
      status: chatRoom.status,
      createdAt: chatRoom.createdAt.toISOString(),
      expiresAt: chatRoom.expiresAt.toISOString(),
      dealConfirmedAt: chatRoom.dealConfirmedAt?.toISOString() || null,
      rfq: chatRoom.rfq,
      quote: chatRoom.quote,
      buyer: chatRoom.buyer,
      supplier: chatRoom.supplier,
      currentUserId: session.user.id,
      currentUserRole: session.user.role,
    })
  } catch (error) {
    console.error('Error fetching chat room:', error)
    return NextResponse.json(
      { error: '채팅방 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 거래 확정
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const roomId = params.id
    const body = await request.json()
    const { action } = body

    if (action !== 'confirm_deal') {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        quote: true,
        rfq: true,
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구매자만 거래 확정 가능
    if (chatRoom.buyerId !== session.user.id) {
      return NextResponse.json({ error: '구매자만 거래를 확정할 수 있습니다' }, { status: 403 })
    }

    // 이미 확정된 거래인지 확인
    if (chatRoom.status === 'deal_confirmed') {
      return NextResponse.json({ error: '이미 확정된 거래입니다' }, { status: 400 })
    }

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 채팅방 상태 업데이트
      const updatedRoom = await tx.chatRoom.update({
        where: { id: roomId },
        data: {
          status: 'deal_confirmed',
          dealConfirmedAt: new Date(),
        },
      })

      // 2. 주문 생성 (이미 수락 시 생성되었으면 스킵)
      const existingOrder = await tx.order.findFirst({
        where: { chatRoomId: roomId },
      })

      if (!existingOrder && chatRoom.quote) {
        await tx.order.create({
          data: {
            chatRoomId: roomId,
            rfqId: chatRoom.rfqId,
            quoteId: chatRoom.quoteId!,
            buyerId: chatRoom.buyerId,
            supplierId: chatRoom.supplierId,
            status: 'preparing',
            productAmount: chatRoom.quote.totalPrice,
            totalAmount: chatRoom.quote.totalPrice,
            commissionAmount: Math.round(chatRoom.quote.totalPrice * 0.03),
            supplierFee: Math.round(chatRoom.quote.totalPrice * 0.03),
            paymentMethod: 'direct',
          },
        })
      }

      // 3. 알림 생성
      await tx.notification.create({
        data: {
          userId: chatRoom.supplierId,
          type: 'deal_confirmed',
          title: '거래가 확정되었습니다',
          message: `"${chatRoom.rfq?.title}" 거래가 확정되었습니다. 배송을 준비해주세요.`,
          link: '/supplier/orders',
        },
      })

      await tx.notification.create({
        data: {
          userId: chatRoom.buyerId,
          type: 'deal_confirmed',
          title: '거래 확정 완료',
          message: `"${chatRoom.rfq?.title}" 거래가 확정되었습니다.`,
          link: '/buyer/orders',
        },
      })

      return updatedRoom
    })

    return NextResponse.json({
      success: true,
      message: '거래가 확정되었습니다.',
      chatRoom: {
        id: result.id,
        status: result.status,
        dealConfirmedAt: result.dealConfirmedAt?.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error confirming deal:', error)
    return NextResponse.json(
      { error: '거래 확정에 실패했습니다.' },
      { status: 500 }
    )
  }
}
