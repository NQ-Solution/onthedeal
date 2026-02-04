'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, FileText, Clock, CheckCircle, XCircle, Loader2,
  Building2, MessageSquare, ChevronDown, ChevronUp, Paperclip,
  Calendar, MapPin
} from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'

interface RFQ {
  id: string
  title: string
  category: string
  description: string
  quantity: number
  unit: string
  budgetMin: number | null
  budgetMax: number | null
  desiredPrice: number | null
  orderSizeRange: string | null
  orderFrequency: string | null
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
  _count?: {
    quotes: number
  }
}

interface Quote {
  id: string
  rfqId: string
  supplierId: string
  totalPrice: number
  deliveryDate: string
  note: string | null
  status: string
  createdAt: string
  attachments?: string[]
  supplier: {
    id: string
    companyName: string
  }
  chatRooms?: {
    id: string
    status: string
    _count?: {
      messages: number
    }
    unreadCount?: number
  }[]
}

const rfqStatusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  open: { label: '제안 받는 중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: Clock },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

const quoteStatusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  pending: { label: '검토 중', variant: 'warning', icon: Clock },
  accepted: { label: '수락됨', variant: 'success', icon: CheckCircle },
  rejected: { label: '거절됨', variant: 'error', icon: XCircle },
  expired: { label: '만료됨', variant: 'default', icon: Clock },
}

const formatPrice = (price: number) => {
  return `${price.toLocaleString()}원`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function BuyerRFQsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [expandedRfqIds, setExpandedRfqIds] = useState<Set<string>>(new Set())
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rfqRes, quoteRes] = await Promise.all([
        fetch('/api/rfqs?role=buyer'),
        fetch('/api/quotes?role=buyer')
      ])

      if (rfqRes.ok) {
        const rfqData = await rfqRes.json()
        setRfqs(rfqData)
      }

      if (quoteRes.ok) {
        const quoteData = await quoteRes.json()
        setQuotes(quoteData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRfqExpand = (rfqId: string) => {
    setExpandedRfqIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rfqId)) {
        newSet.delete(rfqId)
      } else {
        newSet.add(rfqId)
      }
      return newSet
    })
  }

  const toggleQuoteExpand = (quoteId: string) => {
    setExpandedQuoteId(prev => prev === quoteId ? null : quoteId)
  }

  const getQuotesForRfq = (rfqId: string) => {
    return quotes.filter(q => q.rfqId === rfqId)
  }

  const getLowestPrice = (rfqQuotes: Quote[]) => {
    if (rfqQuotes.length === 0) return 0
    return Math.min(...rfqQuotes.map(q => q.totalPrice))
  }

  const handleAcceptQuote = async (quoteId: string, rfqId: string) => {
    if (!confirm('이 제안을 수락하시겠습니까? 수락 후 채팅방에서 거래를 진행합니다.')) return

    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        alert('제안을 수락했습니다. 채팅방으로 이동합니다.')
        if (data.data?.chatRoom?.id) {
          router.push(`/chat?room=${data.data.chatRoom.id}`)
        } else {
          router.push('/chat')
        }
      } else {
        const error = await res.json()
        alert(error.error || '제안 수락에 실패했습니다.')
      }
    } catch (error) {
      alert('제안 수락 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 발주</h1>
          <p className="text-base text-gray-500 mt-1">
            발주를 등록하면 판매자의 제안이 시작됩니다.
          </p>
        </div>
        <Link href="/buyer/rfqs/new">
          <Button size="lg">
            <Plus className="w-6 h-6 mr-2" />
            새 발주
          </Button>
        </Link>
      </div>

      {/* 발주 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">발주 목록</h2>
          <span className="text-sm text-gray-500">{rfqs.length}개</span>
        </div>

        {rfqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg text-gray-500">등록된 발주가 없습니다</p>
              <Link href="/buyer/rfqs/new">
                <Button size="md" className="mt-4">
                  <Plus className="w-5 h-5 mr-2" />
                  첫 발주 등록하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rfqs.map((rfq) => {
              const status = rfqStatusConfig[rfq.status] || rfqStatusConfig.open
              const StatusIcon = status.icon
              const rfqQuotes = getQuotesForRfq(rfq.id)
              const quoteCount = rfqQuotes.length
              const isExpanded = expandedRfqIds.has(rfq.id)
              const lowestPrice = getLowestPrice(rfqQuotes)

              return (
                <Card key={rfq.id} className="overflow-hidden">
                  <CardContent className="py-4">
                    {/* 발주 헤더 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={status.variant} className="text-sm px-3 py-1">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="info" className="text-sm px-3 py-1">{rfq.category}</Badge>
                      </div>
                      {quoteCount > 0 && (
                        <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                          제안 {quoteCount}개
                        </span>
                      )}
                    </div>

                    {/* 발주 제목 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{rfq.title}</h3>

                    {/* 발주 정보 */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>등록: {formatDate(rfq.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>납품희망: {formatDate(rfq.deliveryDate)}</span>
                      </div>
                    </div>

                    {/* 평균발주/발주주기 */}
                    {(rfq.orderFrequency || rfq.orderSizeRange) && (
                      <div className="flex flex-wrap gap-2 text-sm mb-3">
                        {rfq.orderSizeRange && (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                            평균발주: {rfq.orderSizeRange}
                          </span>
                        )}
                        {rfq.orderFrequency && (
                          <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded">
                            발주주기: {rfq.orderFrequency}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 제안 펼침/접힘 버튼 */}
                    {quoteCount > 0 && (
                      <button
                        onClick={() => toggleRfqExpand(rfq.id)}
                        className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mt-2"
                      >
                        <span className="font-medium text-gray-700">
                          받은 제안 <span className="font-bold text-primary-600">{quoteCount}개</span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    )}

                    {/* 제안이 없는 경우 */}
                    {quoteCount === 0 && (
                      <div className="py-3 px-4 bg-gray-50 rounded-lg mt-2 text-center text-gray-500">
                        아직 받은 제안이 없습니다. 판매자들의 제안을 기다려주세요.
                      </div>
                    )}
                  </CardContent>

                  {/* 제안 목록 (펼쳐진 경우) */}
                  {isExpanded && quoteCount > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {rfqQuotes.map((quote, index) => {
                        const quoteStatus = quoteStatusConfig[quote.status] || quoteStatusConfig.pending
                        const QuoteStatusIcon = quoteStatus.icon
                        const isLowest = quote.totalPrice === lowestPrice && quoteCount > 1
                        const isQuoteExpanded = expandedQuoteId === quote.id
                        const chatRoom = quote.chatRooms?.[0]
                        const unreadCount = chatRoom?.unreadCount || 0

                        return (
                          <div key={quote.id} className="border-b border-gray-200 last:border-b-0">
                            {/* 제안 요약 (클릭 시 상세 펼침) */}
                            <button
                              onClick={() => toggleQuoteExpand(quote.id)}
                              className="w-full px-6 py-4 text-left hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-gray-600">[제안 {String.fromCharCode(65 + index)}]</span>
                                  <span className="text-xl font-bold text-primary-600">
                                    제안가 {formatPrice(quote.totalPrice)}
                                  </span>
                                                                    <Badge variant={quoteStatus.variant} className="text-xs px-2 py-0.5">
                                    <QuoteStatusIcon className="w-3 h-3 mr-1" />
                                    {quoteStatus.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{quote.supplier?.companyName}</span>
                                  {isQuoteExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* 제안 상세 (펼쳐진 경우) */}
                            {isQuoteExpanded && (
                              <div className="px-6 pb-4 bg-white border-t border-gray-100">
                                <div className="py-4 space-y-4">
                                  {/* 기본 정보 */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">판매자:</span>
                                      <span className="ml-2 font-medium">{quote.supplier?.companyName}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">납품 가능일:</span>
                                      <span className="ml-2 font-medium">{formatDate(quote.deliveryDate)}</span>
                                    </div>
                                  </div>

                                  {/* 제안 설명 */}
                                  {quote.note && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-1">제안 설명:</p>
                                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                                        {quote.note}
                                      </div>
                                    </div>
                                  )}

                                  {/* 첨부파일 */}
                                  {quote.attachments && quote.attachments.length > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-500 mb-2">첨부파일:</p>
                                      <div className="space-y-1">
                                        {quote.attachments.map((file, fileIndex) => (
                                          <a
                                            key={fileIndex}
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                                          >
                                            <Paperclip className="w-4 h-4" />
                                            <span>첨부파일 {fileIndex + 1}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 버튼 영역 */}
                                  <div className="flex gap-2 pt-2">
                                    {chatRoom && chatRoom.status !== 'expired' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          router.push(`/chat?room=${chatRoom.id}`)
                                        }}
                                        className="relative"
                                      >
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        채팅하기
                                        {unreadCount > 0 && (
                                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                          </span>
                                        )}
                                      </Button>
                                    )}
                                    {quote.status === 'pending' && (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleAcceptQuote(quote.id, rfq.id)
                                        }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        수락하기
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
