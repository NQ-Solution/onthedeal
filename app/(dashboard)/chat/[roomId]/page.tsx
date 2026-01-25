'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Handshake, AlertTriangle, CheckCircle, Info, CreditCard, Building, Eye, EyeOff, Clock } from 'lucide-react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { useUser } from '@/contexts/UserContext'

// 한국 시간 포맷 함수
const formatKoreanTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 채팅 만료까지 남은 시간 계산
const getExpiryInfo = (createdAt: string) => {
  const created = new Date(createdAt)
  const expiresAt = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000) // 3일 후
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()

  if (diffMs <= 0) return { expired: true, text: '만료됨', hours: 0 }

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return { expired: false, text: `${days}일 ${hours % 24}시간 남음`, hours, isUrgent: days < 1 }
  }
  return { expired: false, text: `${hours}시간 남음`, hours, isUrgent: true }
}

// Mock data
const mockChatRoom = {
  id: 'room-1',
  rfq: { id: '1', title: '한우 등심 대량 구매' },
  quote: { price: 620000, delivery_date: '2024-02-12' },
  buyer: { id: 'b1', company_name: '맛있는식당' },
  supplier: {
    id: 's1',
    company_name: '명품축산',
    bank_name: '국민은행',
    account_number: '123-456-789012',
    account_holder: '명품축산(주)'
  },
  deal_confirmed: false,
  created_at: new Date().toISOString(),
}

const mockMessages = [
  {
    id: 'm1',
    sender_id: 's1',
    sender_type: 'supplier',
    content: '안녕하세요! 견적 수락 감사합니다. 상품 관련해서 궁금한 점 있으시면 말씀해주세요.',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    sender_id: 'b1',
    sender_type: 'buyer',
    content: '네 감사합니다. 배송은 어떻게 진행되나요?',
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3',
    sender_id: 's1',
    sender_type: 'supplier',
    content: '냉장 배송으로 당일 도축 후 진공포장하여 다음날 새벽에 도착합니다.',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 'm4',
    sender_id: 'b1',
    sender_type: 'buyer',
    content: '좋습니다. 그럼 거래 진행하겠습니다!',
    created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
]

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user, currentRole } = useUser()
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [showDealModal, setShowDealModal] = useState(false)
  const [dealConfirmed, setDealConfirmed] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | null>(null)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [accountViewed, setAccountViewed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 현재 유저 정보 (역할에 따라 동적으로 변경)
  const currentUser = {
    id: currentRole === 'buyer' ? 'b1' : 's1',
    role: currentRole
  }

  // 만료 정보
  const expiryInfo = getExpiryInfo(mockChatRoom.created_at)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: `m${messages.length + 1}`,
      sender_id: currentUser.id,
      sender_type: currentUser.role,
      content: newMessage,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const handleViewAccount = () => {
    setShowAccountNumber(true)
    setAccountViewed(true)
  }

  const handleConfirmDeal = () => {
    if (paymentMethod === 'bank' && !accountViewed) {
      alert('계좌번호를 확인해주세요.')
      return
    }

    setDealConfirmed(true)
    setShowDealModal(false)

    // 크레딧 3% 차감 안내 (공급자에게)
    const creditDeduction = Math.round(mockChatRoom.quote.price * 0.03)
    alert(`거래가 확정되었습니다!\n\n공급자 크레딧 ${creditDeduction.toLocaleString()}원 (3%) 차감됩니다.`)
    router.push('/buyer/orders')
  }

  // 카드 결제 금액 (103%)
  const cardPaymentAmount = Math.round(mockChatRoom.quote.price * 1.03)
  // 계좌이체 금액 (100%)
  const bankPaymentAmount = mockChatRoom.quote.price

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/chat')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            {/* 역할에 따라 상대방 이름 표시 */}
            <h1 className="font-semibold">
              {currentRole === 'buyer' ? mockChatRoom.supplier.company_name : mockChatRoom.buyer.company_name}
            </h1>
            <p className="text-sm text-gray-500">{mockChatRoom.rfq.title}</p>
          </div>
        </div>
        {!dealConfirmed && currentUser.role === 'buyer' && (
          <Button onClick={() => setShowDealModal(true)}>
            <Handshake className="w-4 h-4 mr-2" />
            거래 확정
          </Button>
        )}
        {dealConfirmed && (
          <Badge variant="success">거래 확정됨</Badge>
        )}
      </div>

      {/* Quote Info */}
      <div className="py-3 px-4 bg-gray-50 border-b text-sm">
        <span className="text-gray-500">견적가: </span>
        <span className="font-semibold text-primary-600">
          {mockChatRoom.quote.price.toLocaleString()}원
        </span>
        <span className="mx-3 text-gray-300">|</span>
        <span className="text-gray-500">납품일: </span>
        <span>{mockChatRoom.quote.delivery_date}</span>
      </div>

      {/* 거래 상태 및 만료 안내 */}
      {dealConfirmed ? (
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
        {messages.map((message) => {
          const isMe = message.sender_id === currentUser.id
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
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-100' : 'text-gray-400'}`}>
                  {formatKoreanTime(message.created_at)}
                </p>
              </div>
            </div>
          )
        })}
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
            disabled={expiryInfo.expired && !dealConfirmed}
          />
          <Button type="submit" disabled={expiryInfo.expired && !dealConfirmed}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Deal Confirmation Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>거래 확정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 상품 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">상품</span>
                  <span className="font-medium">{mockChatRoom.rfq.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">공급자</span>
                  <span className="font-medium">{mockChatRoom.supplier.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">상품 금액</span>
                  <span className="font-medium text-primary-600">
                    {mockChatRoom.quote.price.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 결제 방법 선택 */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3">결제 방법 선택</h4>
                <div className="space-y-3">
                  {/* 카드 결제 */}
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'card' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">카드 결제</span>
                          <Badge variant="warning" className="text-xs">준비 중</Badge>
                        </div>
                        <p className="text-sm text-gray-500">수수료 3% 포함</p>
                      </div>
                      <span className="font-bold text-primary-600">
                        {cardPaymentAmount.toLocaleString()}원
                      </span>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-700 font-medium">
                          ⚠️ 카드 결제는 현재 준비 중입니다. 계좌이체를 이용해주세요.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 계좌 이체 */}
                  <div
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        paymentMethod === 'bank' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">계좌 이체 (현금)</span>
                          <Badge variant="success" className="text-xs">추천</Badge>
                        </div>
                        <p className="text-sm text-gray-500">수수료 없음</p>
                      </div>
                      <span className="font-bold text-green-600">
                        {bankPaymentAmount.toLocaleString()}원
                      </span>
                    </div>

                    {/* 계좌 정보 */}
                    {paymentMethod === 'bank' && (
                      <div className="mt-4 space-y-3">
                        <div className="p-4 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">입금 계좌</span>
                            {!showAccountNumber ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewAccount()
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                계좌번호 보기
                              </Button>
                            ) : (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                확인됨
                              </Badge>
                            )}
                          </div>

                          {showAccountNumber ? (
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">은행</span>
                                <span className="font-bold">{mockChatRoom.supplier.bank_name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">계좌번호</span>
                                <span className="font-bold font-mono">{mockChatRoom.supplier.account_number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">예금주</span>
                                <span className="font-bold">{mockChatRoom.supplier.account_holder}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-2">
                              계좌번호 보기 클릭 시 거래가 확정됩니다
                            </p>
                          )}
                        </div>

                        {accountViewed && (
                          <div className="p-3 bg-green-100 rounded-lg border border-green-300">
                            <p className="text-sm text-green-700 font-medium">
                              ✓ 계좌번호를 확인하셨습니다. 거래가 확정됩니다.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 공급자 수수료 안내 */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">공급자 수수료 안내</p>
                    <p>거래 확정 시 공급자에게 상품 금액의 3%가 크레딧에서 차감됩니다.</p>
                    <p className="font-bold mt-1">
                      차감 금액: {Math.round(mockChatRoom.quote.price * 0.03).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDealModal(false)
                    setPaymentMethod(null)
                    setShowAccountNumber(false)
                    setAccountViewed(false)
                  }}
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirmDeal}
                  disabled={!paymentMethod || (paymentMethod === 'card') || (paymentMethod === 'bank' && !accountViewed)}
                >
                  {paymentMethod === 'bank' && accountViewed ? '거래 확정하기' : '결제 방법을 선택하세요'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
