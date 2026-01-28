import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 채팅방 메시지 조회
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

    // 채팅방 존재 및 권한 확인
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: {
        buyerId: true,
        supplierId: true,
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 참여자만 메시지 조회 가능
    if (chatRoom.buyerId !== session.user.id && chatRoom.supplierId !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    // 메시지 조회
    const messages = await prisma.chatMessage.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            companyName: true,
            role: true,
          },
        },
      },
    })

    // 상대방 메시지 읽음 처리
    await prisma.chatMessage.updateMany({
      where: {
        chatRoomId: roomId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: messages.map(m => ({
        id: m.id,
        room_id: m.chatRoomId,
        sender_id: m.senderId,
        sender_type: m.sender.role,
        sender_name: m.sender.companyName,
        content: m.content,
        is_read: m.isRead,
        created_at: m.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: '메시지를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 메시지 전송
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
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '메시지 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    // 채팅방 존재 및 권한 확인
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        buyerId: true,
        supplierId: true,
        status: true,
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 참여자만 메시지 전송 가능
    if (chatRoom.buyerId !== session.user.id && chatRoom.supplierId !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    // 만료된 채팅방 확인
    if (chatRoom.status === 'expired') {
      return NextResponse.json({ error: '만료된 채팅방입니다' }, { status: 400 })
    }

    // 메시지 저장
    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: roomId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            companyName: true,
            role: true,
          },
        },
      },
    })

    // 상대방에게 알림 생성
    const recipientId = chatRoom.buyerId === session.user.id ? chatRoom.supplierId : chatRoom.buyerId
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'new_message',
        title: '새 메시지',
        message: `${message.sender.companyName}: ${content.trim().substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        link: `/chat/${roomId}`,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        room_id: message.chatRoomId,
        sender_id: message.senderId,
        sender_type: message.sender.role,
        sender_name: message.sender.companyName,
        content: message.content,
        is_read: message.isRead,
        created_at: message.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: '메시지 전송에 실패했습니다.' },
      { status: 500 }
    )
  }
}
