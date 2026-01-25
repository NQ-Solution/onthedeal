import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export const getSocket = (): Socket | null => socket

export const connectSocket = (userId: string): Socket => {
  const socketInstance = initSocket()

  if (!socketInstance.connected) {
    socketInstance.auth = { userId }
    socketInstance.connect()
  }

  return socketInstance
}

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event types
export interface ChatMessageData {
  id: string
  chatRoomId: string
  senderId: string
  content: string
  createdAt: string
}

export interface TypingData {
  chatRoomId: string
  userId: string
  isTyping: boolean
}

export interface JoinRoomData {
  chatRoomId: string
  userId: string
}
