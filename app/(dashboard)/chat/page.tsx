'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge, Button, Input } from '@/components/ui'
import { MessageSquare, Loader2, Send, CreditCard, Truck, CheckCircle, Clock, ImagePlus, X, ArrowLeft, Building, Calendar, FileText, ChevronDown, ChevronUp, Eye } from 'lucide-react'

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
  } | null
  quote: {
    id: string
    totalPrice: number
    deliveryDate: string
    status: string
    note?: string
    attachments?: string[]
  } | null
  buyer: {
    id: string
    companyName: string
  } | null
  supplier: {
    id: string
    companyName: string
    bankName?: string
    bankAccount?: string
    bankHolder?: string
  } | null
  lastMessage: {
    content: string
    createdAt: string
    isRead: boolean
    senderId: string
  } | null
  unreadCount: number
  currentUserId?: string
  currentUserRole?: string
}

interface Message {
  id: string
  room_id: string
  sender_id: string
  sender_type: string
  sender_name: string
  content: string
  image?: string
  is_read: boolean
  created_at: string
}

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return '방금'
  if (diffMins < 60) return `${diffMins}분`
  if (diffHours < 24) return `${diffHours}시간`
  if (diffDays < 7) return `${diffDays}일`

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'deal_confirmed': return { label: '거래확정 - 입금대기', color: 'bg-orange-100 text-orange-800' }
    case 'payment_requested': return { label: '입금 확인 대기', color: 'bg-yellow-100 text-yellow-800' }
    case 'payment_confirmed': return { label: '납품 진행중', color: 'bg-blue-100 text-blue-800' }
    case 'delivery_completed': return { label: '거래 완료', color: 'bg-green-100 text-green-800' }
    case 'expired': return { label: '만료됨', color: 'bg-gray-100 text-gray-600' }
    default: return { label: '협의중', color: 'bg-primary-100 text-primary-800' }
  }
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const roomFromQuery = searchParams.get('room')

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomFromQuery)
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card' | null>(null)
  const [imageViewerSrc, setImageViewerSrc] = useState<string | null>(null)
  const [showQuoteDetails, setShowQuoteDetails] = useState(false)

  useEffect(() => {
    fetchChatRooms()
  }, [])

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomDetail(selectedRoomId)
      fetchMessages(selectedRoomId)
    }
  }, [selectedRoomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!selectedRoomId) return
    const interval = setInterval(() => fetchMessages(selectedRoomId), 5000)
    return () => clearInterval(interval)
  }, [selectedRoomId])

  const fetchChatRooms = async () => {
    try {
      const res = await fetch('/api/chat/rooms')
      const data = await res.json()
      if (res.ok) {
        setRooms(data)
        if (roomFromQuery) {
          setSelectedRoomId(roomFromQuery)
          setIsMobileView(true)
        } else if (data.length > 0 && window.innerWidth >= 1024) {
          setSelectedRoomId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomDetail = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedRoom(data)
      }
    } catch (error) {
      console.error('Error fetching chat room:', error)
    }
  }

  const fetchMessages = async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
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

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId)
    setIsMobileView(true)
  }

  const handleBackToList = () => {
    setIsMobileView(false)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setSelectedImage(reader.result as string)
    reader.readAsDataURL(file)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedImage) || isSending || !selectedRoomId) return

    setIsSending(true)
    try {
      const content = selectedImage
        ? (newMessage.trim() ? `[이미지]\n${newMessage}` : '[이미지]')
        : newMessage

      const res = await fetch(`/api/chat/rooms/${selectedRoomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, image: selectedImage || undefined }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setMessages(prev => [...prev, data.data])
          setNewMessage('')
          setSelectedImage(null)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  // 구매자: 입금 확인 요청
  const handleRequestPayment = async () => {
    if (isConfirming || !selectedRoomId) return
    setIsConfirming(true)
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_payment' }),
      })
      if (res.ok) {
        alert('입금 확인 요청이 완료되었습니다.')
        fetchRoomDetail(selectedRoomId)
        fetchMessages(selectedRoomId)
      } else {
        const data = await res.json()
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  // 판매자: 입금 확인 완료
  const handleConfirmPayment = async () => {
    if (isConfirming || !selectedRoomId) return
    if (!confirm('입금이 확인되었습니까? 확인 후 납품을 진행해주세요.')) return
    setIsConfirming(true)
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm_payment' }),
      })
      if (res.ok) {
        alert('입금 확인 완료! 납품을 진행해주세요.')
        fetchRoomDetail(selectedRoomId)
        fetchMessages(selectedRoomId)
      } else {
        const data = await res.json()
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  // 판매자: 납품 완료
  const handleCompleteDelivery = async () => {
    if (isConfirming || !selectedRoomId) return
    if (!confirm('납품이 완료되었습니까? 거래가 완료 처리됩니다.')) return
    setIsConfirming(true)
    try {
      const res = await fetch(`/api/chat/rooms/${selectedRoomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete_delivery' }),
      })
      if (res.ok) {
        alert('납품 완료! 거래가 완료되었습니다.')
        fetchRoomDetail(selectedRoomId)
        fetchMessages(selectedRoomId)
      } else {
        const data = await res.json()
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  // 구매자: 제안 수락 (거래 확정)
  const handleAcceptQuote = async () => {
    if (isConfirming || !selectedRoom?.quote?.id) return
    if (!confirm('이 제안을 수락하시겠습니까? 수락 후 입금을 진행해주세요.')) return
    setIsConfirming(true)
    try {
      const res = await fetch(`/api/quotes/${selectedRoom.quote.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        alert('제안이 수락되었습니다. 입금을 진행해주세요.')
        fetchRoomDetail(selectedRoomId!)
        fetchMessages(selectedRoomId!)
      } else {
        const data = await res.json()
        alert(data.error || '요청에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('요청 중 오류가 발생했습니다.')
    } finally {
      setIsConfirming(false)
    }
  }

  const activeRooms = rooms
    .filter(r => r.status !== 'expired')
    .sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1
      const aTime = a.lastMessage?.createdAt || a.createdAt
      const bTime = b.lastMessage?.createdAt || b.createdAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

  const totalUnread = rooms.reduce((sum, r) => sum + r.unreadCount, 0)

  // 역할 판단 - buyerId와 currentUserId 비교, 또는 role로 판단
  const isBuyer = selectedRoom?.buyer?.id === selectedRoom?.currentUserId ||
                  selectedRoom?.currentUserRole === 'buyer'
  const isSupplier = selectedRoom?.supplier?.id === selectedRoom?.currentUserId ||
                     selectedRoom?.currentUserRole === 'supplier'

  // 상태 체크
  const status = selectedRoom?.status || 'active'
  const isActive = status === 'active'
  const isDealConfirmed = status === 'deal_confirmed' // 거래확정 - 입금 전
  const isPaymentRequested = status === 'payment_requested' // 입금 확인 요청됨
  const isPaymentConfirmed = status === 'payment_confirmed' // 입금 확인 완료
  const isDeliveryCompleted = status === 'delivery_completed' // 납품 완료
  const isQuotePending = selectedRoom?.quote?.status === 'pending' // 제안 아직 미수락

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4 -mb-6">
      {/* 왼쪽: 채팅 목록 */}
      <div className={`w-full lg:w-80 flex-shrink-0 flex flex-col ${isMobileView ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">채팅</h1>
          {totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {activeRooms.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p>진행 중인 채팅이 없습니다</p>
            </div>
          ) : (
            activeRooms.map((room) => {
              const statusInfo = getStatusLabel(room.status)
              const isSelected = room.id === selectedRoomId

              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-50 border-2 border-primary-500'
                      : room.unreadCount > 0
                        ? 'bg-primary-50/50 hover:bg-primary-50'
                        : 'hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="font-medium text-sm truncate max-w-[100px]">
                        {room.buyer?.companyName || room.supplier?.companyName}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(room.lastMessage?.createdAt || room.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{room.rfq?.title}</p>
                  {room.unreadCount > 0 && (
                    <span className="inline-block mt-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 오른쪽: 채팅방 */}
      <div className={`flex-1 flex flex-col bg-white rounded-xl border overflow-hidden ${!isMobileView && !selectedRoomId ? 'hidden lg:flex' : ''} ${isMobileView ? 'flex' : 'hidden lg:flex'}`}>
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>채팅방을 선택하세요</p>
            </div>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className="p-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <button onClick={handleBackToList} className="lg:hidden p-1 hover:bg-gray-100 rounded">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="font-bold text-lg">
                    {isBuyer ? selectedRoom.supplier?.companyName : selectedRoom.buyer?.companyName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRoom.rfq?.title}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusLabel(status).color}`}>
                {getStatusLabel(status).label}
              </span>
            </div>

            {/* 거래 요약 영역 - 항상 표시 */}
            <div className="p-4 bg-gray-50 border-b">
              {/* 금액 + 납품일 */}
              {selectedRoom.quote && (
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-xs text-gray-500">거래금액</span>
                      <p className="font-bold text-xl text-primary-600">
                        {selectedRoom.quote.totalPrice.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" /> 납품예정일
                    </span>
                    <p className="font-medium">
                      {new Date(selectedRoom.quote.deliveryDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}

              {/* 제안 내용 확인 토글 (항상 표시, 단 isQuotePending이 아닐 때만) */}
              {selectedRoom.quote && (selectedRoom.quote.note || (selectedRoom.quote.attachments && selectedRoom.quote.attachments.length > 0)) && !(isActive && isBuyer && isQuotePending) && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowQuoteDetails(!showQuoteDetails)}
                    className="flex items-center justify-between w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2.5 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Eye className="w-4 h-4" />
                      제안 내용 확인
                    </span>
                    {showQuoteDetails ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showQuoteDetails && (
                    <div className="mt-2 bg-white border rounded-lg p-4 space-y-3">
                      {/* 제안 설명 */}
                      {selectedRoom.quote.note && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm">
                          <p className="text-gray-500 text-xs mb-1">제안 설명</p>
                          <p className="whitespace-pre-line">{selectedRoom.quote.note}</p>
                        </div>
                      )}

                      {/* 첨부파일 */}
                      {selectedRoom.quote.attachments && selectedRoom.quote.attachments.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">첨부파일 (클릭하여 확대)</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedRoom.quote.attachments.map((file, idx) => {
                              const isImage = file.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                              return isImage ? (
                                <img
                                  key={idx}
                                  src={file}
                                  alt={`첨부파일 ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => setImageViewerSrc(file)}
                                />
                              ) : (
                                <a
                                  key={idx}
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-primary-600 hover:bg-gray-200"
                                >
                                  <FileText className="w-4 h-4" />
                                  첨부파일 {idx + 1}
                                </a>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 거래 상태별 카드 */}

              {/* 0. 협의중 (active) - 제안 수락 전 */}
              {isActive && isBuyer && isQuotePending && (
                <div className="bg-white border-2 border-primary-200 rounded-lg p-4 space-y-3">
                  <p className="font-bold text-primary-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    제안 내용
                  </p>

                  {/* 제안 설명 */}
                  {selectedRoom?.quote?.note && (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p className="text-gray-500 text-xs mb-1">제안 설명</p>
                      <p className="whitespace-pre-line">{selectedRoom.quote.note}</p>
                    </div>
                  )}

                  {/* 첨부파일 */}
                  {selectedRoom?.quote?.attachments && selectedRoom.quote.attachments.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2">첨부파일 (클릭하여 확대)</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRoom.quote.attachments.map((file, idx) => {
                          const isImage = file.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                          return isImage ? (
                            <img
                              key={idx}
                              src={file}
                              alt={`첨부파일 ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setImageViewerSrc(file)}
                            />
                          ) : (
                            <a
                              key={idx}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-primary-600 hover:bg-gray-200"
                            >
                              <FileText className="w-4 h-4" />
                              첨부파일 {idx + 1}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 제안 수락 버튼 */}
                  <div className="pt-2 border-t">
                    <Button
                      onClick={handleAcceptQuote}
                      disabled={isConfirming}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isConfirming ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      제안 수락하기
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      수락 후 입금을 진행해주세요
                    </p>
                  </div>
                </div>
              )}

              {isActive && isSupplier && (
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    구매자의 제안 수락을 기다리고 있습니다
                  </p>
                </div>
              )}

              {/* 1. 거래확정 (deal_confirmed) - 구매자: 결제 수단 선택 */}
              {isDealConfirmed && isBuyer && (
                <div className="bg-white border-2 border-orange-300 rounded-lg p-4">
                  <p className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    거래가 확정되었습니다
                  </p>
                  <p className="text-sm text-orange-600 mb-4">
                    아래에서 결제 수단을 선택하고 입금 후 확인을 요청해주세요
                  </p>

                  {/* 결제 수단 선택 버튼 */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">계좌이체</span>
                      </div>
                      <p className="text-xs text-gray-500">판매자 계좌로 직접 입금</p>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                        paymentMethod === 'card'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">카드결제</span>
                      </div>
                      <p className="text-xs text-gray-500">신용/체크카드 결제</p>
                    </button>
                  </div>

                  {/* 계좌이체 선택 시 */}
                  {paymentMethod === 'bank' && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium mb-2">판매자 계좌 정보</p>
                      {selectedRoom.supplier?.bankAccount ? (
                        <div className="text-sm space-y-1">
                          <p><span className="text-gray-500">은행:</span> {selectedRoom.supplier.bankName}</p>
                          <p><span className="text-gray-500">계좌:</span> <strong className="text-lg">{selectedRoom.supplier.bankAccount}</strong></p>
                          <p><span className="text-gray-500">예금주:</span> {selectedRoom.supplier.bankHolder || selectedRoom.supplier.companyName}</p>
                          <p className="mt-2 pt-2 border-t">
                            <span className="text-gray-500">입금액:</span>{' '}
                            <strong className="text-primary-600">{selectedRoom.quote?.totalPrice.toLocaleString()}원</strong>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-orange-600">⚠️ 판매자가 계좌정보를 등록하지 않았습니다. 채팅으로 문의해주세요.</p>
                      )}
                    </div>
                  )}

                  {/* 카드결제 선택 시 */}
                  {paymentMethod === 'card' && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-3 text-center">
                      <div className="text-blue-600 mb-2">
                        <CreditCard className="w-8 h-8 mx-auto" />
                      </div>
                      <p className="font-medium text-blue-800">카드결제 연결 준비중</p>
                      <p className="text-sm text-blue-600 mt-1">현재 PG사 연동을 준비하고 있습니다.</p>
                      <p className="text-xs text-blue-500 mt-2">빠른 시일 내에 서비스될 예정입니다.</p>
                    </div>
                  )}

                  {/* 입금 확인 요청 버튼 (계좌이체일 때만 활성화) */}
                  {paymentMethod === 'bank' && selectedRoom.supplier?.bankAccount && (
                    <div className="flex justify-end">
                      <Button onClick={handleRequestPayment} disabled={isConfirming}>
                        {isConfirming ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                        입금 완료 - 확인 요청
                      </Button>
                    </div>
                  )}

                  {!paymentMethod && (
                    <p className="text-xs text-gray-500 text-center">
                      결제 수단을 선택해주세요
                    </p>
                  )}
                </div>
              )}

              {/* 1. 거래확정 - 판매자: 대기 안내 */}
              {isDealConfirmed && isSupplier && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    거래가 확정되었습니다
                  </p>
                  <p className="text-sm text-orange-600">
                    구매자의 입금과 확인 요청을 기다리고 있습니다
                  </p>
                </div>
              )}

              {/* 2. 입금 확인 대기 - 구매자 */}
              {isPaymentRequested && isBuyer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    입금 확인 대기 중
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">판매자가 입금을 확인하면 납품이 시작됩니다</p>
                </div>
              )}

              {/* 2. 입금 확인 대기 - 판매자: 입금확인완료 버튼 */}
              {isPaymentRequested && isSupplier && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-yellow-800 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        구매자가 입금 확인을 요청했습니다
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">입금을 확인하고 버튼을 눌러주세요</p>
                    </div>
                    <Button onClick={handleConfirmPayment} disabled={isConfirming} className="bg-yellow-600 hover:bg-yellow-700">
                      {isConfirming ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                      입금 확인 완료
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. 납품 진행중 - 구매자 */}
              {isPaymentConfirmed && isBuyer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    입금 확인 완료 - 납품 진행중
                  </p>
                  <p className="text-sm text-blue-700 mt-1">판매자가 납품을 준비하고 있습니다</p>
                </div>
              )}

              {/* 3. 납품 진행중 - 판매자: 납품완료 버튼 */}
              {isPaymentConfirmed && isSupplier && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-800 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        납품을 진행해주세요
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        납품예정일: {selectedRoom.quote && new Date(selectedRoom.quote.deliveryDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Button onClick={handleCompleteDelivery} disabled={isConfirming} className="bg-green-600 hover:bg-green-700">
                      {isConfirming ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Truck className="w-4 h-4 mr-1" />}
                      납품 완료
                    </Button>
                  </div>
                </div>
              )}

              {/* 4. 거래 완료 */}
              {isDeliveryCompleted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    거래가 완료되었습니다
                  </p>
                  <p className="text-sm text-green-700 mt-1">감사합니다. 좋은 거래였습니다!</p>
                </div>
              )}

              {/* Fallback: 역할이 감지되지 않았을 때 - 안내 메시지만 표시 */}
              {!isBuyer && !isSupplier && isActive && (
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">역할 정보를 불러오는 중입니다...</p>
                  <p className="text-xs text-gray-500 mt-1">페이지를 새로고침해 주세요</p>
                </div>
              )}
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>첫 메시지를 보내보세요</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.sender_id === selectedRoom.currentUserId
                  const isSystem = message.sender_type === 'system'

                  if (isSystem) {
                    return (
                      <div key={message.id} className="flex justify-center">
                        <div className="bg-white shadow-sm text-gray-600 text-xs px-4 py-2 rounded-full border">
                          {message.content}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                        isMe ? 'bg-primary-500 text-white' : 'bg-white text-gray-900'
                      }`}>
                        {!isMe && (
                          <p className="text-[10px] font-medium mb-0.5 opacity-70">{message.sender_name}</p>
                        )}
                        {message.image && (
                          <img
                            src={message.image}
                            alt="첨부"
                            className="max-w-full max-h-48 rounded mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setImageViewerSrc(message.image!)}
                          />
                        )}
                        {message.content && message.content !== '[이미지]' && (
                          <p className="text-sm whitespace-pre-wrap">{message.content.replace('[이미지]\n', '')}</p>
                        )}
                        <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                          {formatKoreanTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white">
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img src={selectedImage} alt="첨부" className="max-h-20 rounded border" />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="메시지 입력..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={isSending}>
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* 이미지 뷰어 모달 */}
      {imageViewerSrc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImageViewerSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
            onClick={() => setImageViewerSrc(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageViewerSrc}
            alt="확대 이미지"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
