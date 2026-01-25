import { Server as HTTPServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface AuthenticatedSocket extends Socket {
  userId?: string
}

export const initSocketServer = (httpServer: HTTPServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // 인증 미들웨어
  io.use((socket: AuthenticatedSocket, next) => {
    const userId = socket.handshake.auth.userId
    if (!userId) {
      return next(new Error('인증이 필요합니다.'))
    }
    socket.userId = userId
    next()
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`)

    // 채팅방 입장
    socket.on('join_room', async (chatRoomId: string) => {
      socket.join(chatRoomId)
      console.log(`User ${socket.userId} joined room ${chatRoomId}`)

      // 읽지 않은 메시지 읽음 처리
      if (socket.userId) {
        await prisma.chatMessage.updateMany({
          where: {
            chatRoomId,
            senderId: { not: socket.userId },
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        })
      }
    })

    // 채팅방 퇴장
    socket.on('leave_room', (chatRoomId: string) => {
      socket.leave(chatRoomId)
      console.log(`User ${socket.userId} left room ${chatRoomId}`)
    })

    // 메시지 전송
    socket.on('send_message', async (data: {
      chatRoomId: string
      content: string
    }) => {
      try {
        if (!socket.userId) return

        // 채팅방 존재 및 권한 확인
        const chatRoom = await prisma.chatRoom.findFirst({
          where: {
            id: data.chatRoomId,
            OR: [
              { buyerId: socket.userId },
              { supplierId: socket.userId },
            ],
          },
        })

        if (!chatRoom) {
          socket.emit('error', { message: '채팅방에 접근할 수 없습니다.' })
          return
        }

        // 만료된 채팅방 확인
        if (chatRoom.status === 'expired' || chatRoom.status === 'closed') {
          socket.emit('error', { message: '종료된 채팅방입니다.' })
          return
        }

        // 메시지 저장
        const message = await prisma.chatMessage.create({
          data: {
            chatRoomId: data.chatRoomId,
            senderId: socket.userId,
            content: data.content,
          },
          include: {
            sender: {
              select: {
                id: true,
                companyName: true,
                contactName: true,
                profileImage: true,
              },
            },
          },
        })

        // 채팅방의 모든 사용자에게 메시지 전송
        io.to(data.chatRoomId).emit('new_message', {
          id: message.id,
          chatRoomId: message.chatRoomId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
          sender: message.sender,
        })

        // 상대방에게 알림 전송
        const recipientId = chatRoom.buyerId === socket.userId
          ? chatRoom.supplierId
          : chatRoom.buyerId

        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'new_message',
            title: '새 메시지',
            message: `${message.sender.companyName}에서 메시지를 보냈습니다.`,
            link: `/chat/${data.chatRoomId}`,
          },
        })

        // 상대방 소켓에 알림 전송
        io.to(`user_${recipientId}`).emit('notification', {
          type: 'new_message',
          chatRoomId: data.chatRoomId,
        })
      } catch (error) {
        console.error('메시지 전송 오류:', error)
        socket.emit('error', { message: '메시지 전송에 실패했습니다.' })
      }
    })

    // 타이핑 상태
    socket.on('typing', (data: { chatRoomId: string; isTyping: boolean }) => {
      socket.to(data.chatRoomId).emit('user_typing', {
        userId: socket.userId,
        isTyping: data.isTyping,
      })
    })

    // 메시지 읽음 처리
    socket.on('mark_read', async (chatRoomId: string) => {
      if (!socket.userId) return

      await prisma.chatMessage.updateMany({
        where: {
          chatRoomId,
          senderId: { not: socket.userId },
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      socket.to(chatRoomId).emit('messages_read', {
        chatRoomId,
        readBy: socket.userId,
      })
    })

    // 사용자 개인 채널 입장 (알림용)
    if (socket.userId) {
      socket.join(`user_${socket.userId}`)
    }

    // 연결 해제
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  return io
}
