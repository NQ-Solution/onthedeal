'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Handshake, AlertTriangle, CheckCircle, Info, Building, Clock, Loader2 } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

interface Message {
  id: string
  room_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  content: string
  is_read: boolean
  created_at: string
}

interface ChatRoom {
  id: string
  status: string
  createdAt: string
  expiresAt: string
  dealConfirmedAt: string | null
  rfq: {
    id: string
    title: string
    category: string
    quantity: number
    unit: string
  } | null
  quote: {
    id: string
    unitPrice: number
    totalPrice: number
    deliveryDate: string
  } | null
  buyer: {
    id: string
    companyName: string
    contactName: string
  } | null
  supplier: {
    id: string
    companyName: string
    contactName: string
  } | null
  currentUserId: string
  currentUserRole: string
}

// 한국 시간 포맷 함수
const formatKoreanTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 채팅 만료까지 남은 시간 계산
const getExpiryInfo = (expiresAt: string) => {
  const expires = new Date(expiresAt)
  const now = new Date()
  const diffMs = expires.getTime() - now.getTime()

  if (diffMs <= 0) return { expired: true, text: '만료됨', hours: 0, isUrgent: true }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return { expired: false, text: `${days}일 ${hours % 24}시간 남음`, hours, isUrgent: days < 1 }
  }
  return { expired: false, text: `${hours}시간 남음`, hours, isUrgent: true }
}

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showDealModal, setShowDealModal] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (params.roomId) {
      fetchChatRoom()
      fetchMessages()
    }
  }, [params.roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 주기적으로 새 메시지 확인 (5초마다)
  useEffect(() => {
    if (!params.roomId) return
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [params.roomId])

  const fetchChatRoom = async () => {
    try {
      const res = await fetch(`/api/chat/rooms/${params.roomId}`)
      if (res.ok) {
        const data = await res.json()
        setChatRoom(data)
      } else {
        console.error('Failed to fetch chat room')
      }
    } catch (error) {
      console.error('Error fetching chat room:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/rooms/${params.roomId}/messages`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMessages(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chat/rooms/${params.roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMessages(prev => [...prev, data.data])
          setNewMessage('')
        }
      } else {
        const data = await res.json()
        alert(data.error || '메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleConfirmDeal = async () => {
    if (isConfirming) return

    setIsConfirming(true)
    try {
      const res = await fetch(`/api/chat/rooms/${params.roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_deal' }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('거래가 확정되었습니다!')
        setShowDealModal(false)
        fetchChatRoom() // 채팅방 상태 새로고침
        router.push('/buyer/orders')
      } else {
        alert(data.error || '거래 확정에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error confirming deal:', error)
      alert('거래 확정 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!chatRoom) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">채팅방을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/chat')}>
          채팅 목록으로
        </Button>
      </div>
    )
  }

  const expiryInfo = getExpiryInfo(chatRoom.expiresAt)
  const isCurrentUserBuyer = chatRoom.currentUserRole === 'buyer'
  const otherParty = isCurrentUserBuyer ? chatRoom.supplier : chatRoom.buyer
  const isDealConfirmed = chatRoom.status === 'deal_confirmed'

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/chat')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{otherParty?.companyName}</h1>
            <p className="text-sm text-gray-500">{chatRoom.rfq?.title}</p>
          </div>
        </div>
        {!isDealConfirmed && isCurrentUserBuyer && chatRoom.status === 'active' && (
          <Button onClick={() => setShowDealModal(true)}>
            <Handshake className="w-4 h-4 mr-2" />
            거래 확정
          </Button>
        )}
        {isDealConfirmed && (
          <Badge variant="success">거래 확정됨</Badge>
        )}
      </div>

      {/* Quote Info */}
      {chatRoom.quote && (
        <div className="py-3 px-4 bg-gray-50 border-b text-sm">
          <span className="text-gray-500">제안가: </span>
          <span className="font-semibold text-primary-600">
            {chatRoom.quote.totalPrice.toLocaleString()}원
          </span>
          <span className="mx-3 text-gray-300">|</span>
          <span className="text-gray-500">납품일: </span>
          <span>{new Date(chatRoom.quote.deliveryDate).toLocaleDateString('ko-KR')}</span>
        </div>
      )}

      {/* 거래 상태 및 만료 안내 */}
      {isDealConfirmed ? (
        <div className="py-2 px-4 bg-green-50 border-b flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">거래 확정됨 - 채팅이 보존됩니다</p>
        </div>
      ) : expiryInfo.expired ? (
        <div className="py-2 px-4 bg-red-50 border-b flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">채팅이 만료되었습니다</p>
        </div>
      ) : (
        <div className={`py-2 px-4 border-b flex items-center gap-2 ${expiryInfo.isUrgent ? 'bg-red-50' : 'bg-yellow-50'}`}>
          <Clock className={`w-4 h-4 flex-shrink-0 ${expiryInfo.isUrgent ? 'text-red-600' : 'text-yellow-600'}`} />
          <p className={`text-sm ${expiryInfo.isUrgent ? 'text-red-700 font-bold' : 'text-yellow-700'}`}>
            거래 미확정 시 {expiryInfo.text} 후 채팅 삭제
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-2">첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender_id === chatRoom.currentUserId
            return (
              <div
                key={message.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    isMe
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-medium mb-1 opacity-75">{message.sender_name}</p>
                  )}
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                    {formatKoreanTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="pt-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={expiryInfo.expired && !isDealConfirmed}
          />
          <Button type="submit" disabled={(expiryInfo.expired && !isDealConfirmed) || isSending}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>

      {/* Deal Confirmation Modal */}
      {showDealModal && chatRoom.quote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>거래 확정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 상품 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품</span>
                  <span className="font-medium">{chatRoom.rfq?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">공급자</span>
                  <span className="font-medium">{chatRoom.supplier?.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span className="font-medium text-primary-600">
                    {chatRoom.quote.totalPrice.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">납품 예정일</span>
                  <span className="font-medium">
                    {new Date(chatRoom.quote.deliveryDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>

              {/* 결제 안내 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Building className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">계좌이체 결제</p>
                    <p>거래 확정 후 공급자에게 직접 연락하여 결제를 진행해주세요.</p>
                  </div>
                </div>
              </div>

              {/* 공급자 수수료 안내 */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium mb-1">수수료 안내</p>
                    <p>공급자에게 상품 금액의 3%가 수수료로 차감됩니다.</p>
                    <p className="font-bold mt-1">
                      수수료: {Math.round(chatRoom.quote.totalPrice * 0.03).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDealModal(false)}
                  disabled={isConfirming}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmDeal}
                  isLoading={isConfirming}
                >
                  거래 확정하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
