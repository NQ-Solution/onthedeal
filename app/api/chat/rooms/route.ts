import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/chat/rooms - Get all chat rooms for current user
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const userId = session.user.id

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { supplierId: userId },
        ],
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        quote: {
          select: {
            id: true,
            totalPrice: true,
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 안읽은 메시지 수 계산
    const roomsWithUnread = await Promise.all(
      chatRooms.map(async (room) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            chatRoomId: room.id,
            senderId: { not: userId },
            isRead: false,
          },
        })

        return {
          id: room.id,
          status: room.status,
          createdAt: room.createdAt.toISOString(),
          expiresAt: room.expiresAt.toISOString(),
          dealConfirmedAt: room.dealConfirmedAt?.toISOString() || null,
          rfq: room.rfq,
          quote: room.quote,
          buyer: room.buyer,
          supplier: room.supplier,
          lastMessage: room.messages[0] || null,
          unreadCount,
        }
      })
    )

    return NextResponse.json(roomsWithUnread)
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json(
      { error: '채팅방 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
