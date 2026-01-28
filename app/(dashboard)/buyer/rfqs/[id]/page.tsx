'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Check, X, Loader2, Building2, Calendar, MapPin, Package } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

interface Quote {
  id: string
  supplierId: string
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  note: string | null
  status: string
  createdAt: string
  supplier: {
    companyName: string
    contactName: string
  }
}

interface RFQ {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  unit: string
  budgetMin: number | null
  budgetMax: number | null
  desiredPrice: number | null
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
  quotes?: Quote[]
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  open: { label: '모집중', variant: 'success' },
  in_progress: { label: '진행중', variant: 'warning' },
  closed: { label: '마감', variant: 'default' },
  cancelled: { label: '취소', variant: 'error' },
}

const quoteStatusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  pending: { label: '대기중', variant: 'warning' },
  accepted: { label: '수락됨', variant: 'success' },
  rejected: { label: '거절됨', variant: 'error' },
  expired: { label: '만료됨', variant: 'default' },
}

const formatPrice = (price: number) => {
  if (price >= 10000) {
    return `${Math.floor(price / 10000)}만원`
  }
  return `${price.toLocaleString()}원`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function BuyerRFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rfq, setRfq] = useState<RFQ | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [processingQuoteId, setProcessingQuoteId] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchRFQDetail()
      fetchQuotes()
    }
  }, [params.id])

  const fetchRFQDetail = async () => {
    try {
      const res = await fetch(`/api/rfqs/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setRfq(data)
      }
    } catch (error) {
      console.error('Failed to fetch RFQ:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`/api/quotes?rfq_id=${params.id}&role=buyer`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    }
  }

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('이 제안을 수락하시겠습니까? 수락 시 다른 제안들은 자동으로 거절됩니다.')) {
      return
    }

    setProcessingQuoteId(quoteId)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/accept`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('제안이 수락되었습니다. 주문 관리 페이지로 이동합니다.')
        router.push('/buyer/orders')
      } else {
        alert(data.error || '제안 수락에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error accepting quote:', error)
      alert('제안 수락 중 오류가 발생했습니다.')
    } finally {
      setProcessingQuoteId(null)
    }
  }

  const handleRejectQuote = async (quoteId: string) => {
    if (!confirm('이 제안을 거절하시겠습니까?')) {
      return
    }

    setProcessingQuoteId(quoteId)
    try {
      const res = await fetch(`/api/quotes/${quoteId}/reject`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('제안이 거절되었습니다.')
        fetchQuotes() // 새로고침
      } else {
        alert(data.error || '제안 거절에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error rejecting quote:', error)
      alert('제안 거절 중 오류가 발생했습니다.')
    } finally {
      setProcessingQuoteId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">발주를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          뒤로가기
        </Button>
      </div>
    )
  }

  const statusBadge = statusLabels[rfq.status] || statusLabels.open

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      {/* RFQ 정보 카드 */}
      <Card className="shadow-lg border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
                <Badge variant="info">{rfq.category}</Badge>
              </div>
              <CardTitle className="text-2xl">{rfq.title}</CardTitle>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>등록일: {formatDate(rfq.createdAt)}</p>
              <p>납품일: {formatDate(rfq.deliveryDate)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">상세 설명</p>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">{rfq.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">수량</p>
                <p className="font-medium">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">구매 희망가</p>
              <p className="font-medium text-primary-600">
                {rfq.budgetMin && rfq.budgetMax ? (
                  `${formatPrice(rfq.budgetMin)} ~ ${formatPrice(rfq.budgetMax)}`
                ) : rfq.desiredPrice ? (
                  formatPrice(rfq.desiredPrice)
                ) : (
                  '협의'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">배송지</p>
                <p className="font-medium text-sm">{rfq.deliveryAddress}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">받은 제안</p>
              <p className="font-medium text-primary-600">{quotes.length}개</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 제안 목록 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">받은 제안 ({quotes.length})</h2>
        <div className="space-y-4">
          {quotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-500">아직 받은 제안이 없습니다</p>
                <p className="text-gray-400 mt-2">공급자들의 제안을 기다려주세요</p>
              </CardContent>
            </Card>
          ) : (
            quotes.map((quote) => {
              const quoteStatus = quoteStatusLabels[quote.status] || quoteStatusLabels.pending
              const isProcessing = processingQuoteId === quote.id
              return (
                <Card key={quote.id} className="hover:shadow-lg transition-all">
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant={quoteStatus.variant} className="text-base px-4 py-2">
                            {quoteStatus.label}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-500" />
                            <span className="font-bold text-lg">{quote.supplier.companyName}</span>
                          </div>
                        </div>

                        {quote.note && (
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{quote.note}</p>
                        )}

                        <div className="flex gap-6 text-base">
                          <div>
                            <span className="text-gray-500">제안가: </span>
                            <span className="font-bold text-xl text-primary-600">
                              {formatPrice(quote.totalPrice)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              (단가 {quote.unitPrice.toLocaleString()}원)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-500">납품일: </span>
                            <span className="font-medium">{formatDate(quote.deliveryDate)}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-400">
                          제안일: {formatDate(quote.createdAt)}
                        </p>
                      </div>

                      {quote.status === 'pending' && rfq.status === 'open' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="lg"
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={isProcessing}
                            isLoading={isProcessing}
                          >
                            <Check className="w-5 h-5 mr-2" />
                            수락
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => handleRejectQuote(quote.id)}
                            disabled={isProcessing}
                          >
                            <X className="w-5 h-5 mr-2" />
                            거절
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
