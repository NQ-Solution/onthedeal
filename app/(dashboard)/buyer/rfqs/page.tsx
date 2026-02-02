'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Clock, CheckCircle, XCircle, Loader2, Building2, MessageSquare, Receipt } from 'lucide-react'
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
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  note: string | null
  status: string
  createdAt: string
  supplier: {
    id: string
    companyName: string
  }
  chatRooms?: {
    id: string
    status: string
  }[]
}

const rfqStatusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  open: { label: '모집중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: Clock },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

const quoteStatusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  pending: { label: '대기중', variant: 'warning', icon: Clock },
  accepted: { label: '수락됨', variant: 'success', icon: CheckCircle },
  rejected: { label: '거절됨', variant: 'error', icon: XCircle },
  expired: { label: '만료됨', variant: 'default', icon: Clock },
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

export default function BuyerRFQsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null)

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
        // 첫 번째 발주 자동 선택
        if (rfqData.length > 0) {
          setSelectedRfqId(rfqData[0].id)
        }
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

  // 선택된 발주의 제안 필터링
  const selectedQuotes = useMemo(() => {
    if (!selectedRfqId) return []
    return quotes.filter(q => q.rfqId === selectedRfqId)
  }, [quotes, selectedRfqId])

  // 선택된 발주 정보
  const selectedRfq = useMemo(() => {
    return rfqs.find(r => r.id === selectedRfqId)
  }, [rfqs, selectedRfqId])

  // 최저가 계산
  const lowestPrice = useMemo(() => {
    if (selectedQuotes.length === 0) return 0
    return Math.min(...selectedQuotes.map(q => q.totalPrice))
  }, [selectedQuotes])

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
          <p className="text-lg text-gray-500 mt-1">발주 목록과 받은 제안을 한눈에 관리하세요</p>
        </div>
        <Link href="/buyer/rfqs/new">
          <Button size="lg">
            <Plus className="w-6 h-6 mr-2" />
            새 발주
          </Button>
        </Link>
      </div>

      {/* 2단 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 왼쪽: 발주 목록 */}
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
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
              {rfqs.map((rfq) => {
                const status = rfqStatusConfig[rfq.status] || rfqStatusConfig.open
                const StatusIcon = status.icon
                const isSelected = selectedRfqId === rfq.id
                const quoteCount = rfq._count?.quotes || 0

                return (
                  <Card
                    key={rfq.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary-500 shadow-lg bg-primary-50'
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedRfqId(rfq.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="text-sm px-3 py-1">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          <Badge variant="info" className="text-sm px-3 py-1">{rfq.category}</Badge>
                        </div>
                        {quoteCount > 0 && (
                          <span className="text-sm font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                            제안 {quoteCount}개
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{rfq.title}</h3>

                      <div className="text-sm text-gray-600">
                        납품희망: {formatDate(rfq.deliveryDate)}
                      </div>

                      {(rfq.orderFrequency || rfq.orderSizeRange) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2 text-sm">
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
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* 오른쪽: 받은 제안 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              받은 제안
              {selectedRfq && <span className="text-base font-normal text-gray-500 ml-2">- {selectedRfq.title}</span>}
            </h2>
            <span className="text-sm text-gray-500">{selectedQuotes.length}개</span>
          </div>

          {!selectedRfqId ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg text-gray-500">왼쪽에서 발주를 선택하세요</p>
              </CardContent>
            </Card>
          ) : selectedQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-lg text-gray-500">아직 받은 제안이 없습니다</p>
                <p className="text-sm text-gray-400 mt-1">공급자들의 제안을 기다려주세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
              {selectedQuotes.map((quote) => {
                const status = quoteStatusConfig[quote.status] || quoteStatusConfig.pending
                const StatusIcon = status.icon
                const isLowest = quote.totalPrice === lowestPrice && selectedQuotes.length > 1
                const hasChatRoom = quote.chatRooms?.[0] && quote.chatRooms[0].status !== 'expired'

                return (
                  <Card key={quote.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant} className="text-sm px-3 py-1">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                          {isLowest && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                              최저가
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary-600">{formatPrice(quote.totalPrice)}</p>
                          <p className="text-xs text-gray-500">단가 {formatPrice(quote.unitPrice)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{quote.supplier?.companyName}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        납품 가능일: {formatDate(quote.deliveryDate)}
                      </p>

                      {quote.note && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3 line-clamp-2">
                          {quote.note}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {hasChatRoom && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.push(`/chat/${quote.chatRooms![0].id}`)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            채팅하기
                          </Button>
                        )}
                        <Link href={`/buyer/rfqs/${quote.rfqId}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            상세보기
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* 선택된 발주 요약 */}
          {selectedRfq && selectedQuotes.length > 0 && (
            <div className="bg-primary-50 rounded-xl p-4 text-sm">
              <p className="font-medium text-primary-800 mb-1">
                {selectedQuotes.filter(q => q.status === 'pending').length}개 제안 검토 대기중
              </p>
              <p className="text-primary-600">
                최저가 {formatPrice(lowestPrice)} · 납품희망 {formatDate(selectedRfq.deliveryDate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
