'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Receipt, Clock, CheckCircle, XCircle, Building2, Calendar, TrendingUp, Loader2, ChevronDown, ChevronUp, FileText, MessageSquare } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge, Button } from '@/components/ui'

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
  rfq: {
    id: string
    title: string
    quantity: number
    unit: string
    status: string
    deliveryDate: string
  }
  supplier: {
    id: string
    companyName: string
  }
  chatRooms?: {
    id: string
    status: string
  }[]
}

interface GroupedQuotes {
  rfqId: string
  rfqTitle: string
  rfqStatus: string
  rfqDeliveryDate: string
  quotes: Quote[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  pending: { label: '대기중', variant: 'warning', icon: Clock },
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

export default function BuyerQuotesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedRfqs, setExpandedRfqs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes?role=buyer')
      const data = await res.json()

      if (res.ok) {
        setQuotes(data)
        // 기본적으로 모든 발주 펼침
        const rfqIds = new Set(data.map((q: Quote) => q.rfqId))
        setExpandedRfqs(rfqIds as Set<string>)
      } else {
        console.error('제안 조회 실패:', data.error || '알 수 없는 오류')
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  // 발주별로 제안 그룹화
  const groupedQuotes = useMemo(() => {
    const filtered = quotes.filter(quote => {
      const matchesSearch = quote.rfq?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.supplier?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || quote.status === statusFilter
      return matchesSearch && matchesStatus
    })

    const groups: Record<string, GroupedQuotes> = {}

    filtered.forEach(quote => {
      if (!groups[quote.rfqId]) {
        groups[quote.rfqId] = {
          rfqId: quote.rfqId,
          rfqTitle: quote.rfq?.title || '알 수 없는 발주',
          rfqStatus: quote.rfq?.status || 'open',
          rfqDeliveryDate: quote.rfq?.deliveryDate || '',
          quotes: [],
        }
      }
      groups[quote.rfqId].quotes.push(quote)
    })

    // 최신 제안 기준으로 정렬
    return Object.values(groups).sort((a, b) => {
      const aLatest = Math.max(...a.quotes.map(q => new Date(q.createdAt).getTime()))
      const bLatest = Math.max(...b.quotes.map(q => new Date(q.createdAt).getTime()))
      return bLatest - aLatest
    })
  }, [quotes, searchTerm, statusFilter])

  const toggleRfqExpansion = (rfqId: string) => {
    setExpandedRfqs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rfqId)) {
        newSet.delete(rfqId)
      } else {
        newSet.add(rfqId)
      }
      return newSet
    })
  }

  const pendingCount = quotes.filter(q => q.status === 'pending').length
  const acceptedCount = quotes.filter(q => q.status === 'accepted').length
  const totalValue = quotes.reduce((sum, q) => sum + q.totalPrice, 0)
  const rfqCount = new Set(quotes.map(q => q.rfqId)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">받은 제안</h1>
        <p className="text-lg text-gray-500 mt-1">발주별로 제안을 비교하고 최적의 거래처를 선택하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">제안 받은 발주</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{rfqCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">대기중 제안</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">수락됨</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 제안</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{quotes.length}개</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="발주명 또는 공급자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'pending', label: '대기중' },
                { value: 'accepted', label: '수락됨' },
                { value: 'rejected', label: '거절됨' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* 발주별 제안 목록 */}
      <div className="space-y-4">
        {groupedQuotes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">받은 제안이 없습니다</p>
              <p className="text-gray-400 mt-2">발주를 등록하면 공급자들의 제안을 받을 수 있습니다</p>
            </CardContent>
          </Card>
        ) : (
          groupedQuotes.map((group) => {
            const isExpanded = expandedRfqs.has(group.rfqId)
            const pendingInGroup = group.quotes.filter(q => q.status === 'pending').length
            const lowestPrice = Math.min(...group.quotes.map(q => q.totalPrice))

            return (
              <Card key={group.rfqId} className="overflow-hidden">
                {/* 발주 헤더 */}
                <div
                  className="px-6 py-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleRfqExpansion(group.rfqId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{group.rfqTitle}</h3>
                          {pendingInGroup > 0 && (
                            <Badge variant="warning" className="text-xs">
                              {pendingInGroup}개 대기중
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          제안 <span className="font-bold text-primary-600">{group.quotes.length}개</span> 도착
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/buyer/rfqs/${group.rfqId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        발주 상세 →
                      </Link>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 제안 목록 */}
                {isExpanded && (
                  <div className="divide-y">
                    {group.quotes.map((quote) => {
                      const status = statusConfig[quote.status] || statusConfig.pending
                      const StatusIcon = status.icon
                      const isLowest = quote.totalPrice === lowestPrice

                      return (
                        <div key={quote.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Badge variant={status.variant} className="text-sm px-3 py-1">
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <span className="font-bold text-gray-900">{quote.supplier?.companyName}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  납품 가능일: {formatDate(quote.deliveryDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {/* 채팅하기 버튼 */}
                              {quote.chatRooms?.[0] && quote.chatRooms[0].status !== 'expired' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/chat/${quote.chatRooms![0].id}`)
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  채팅
                                </Button>
                              )}
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary-600">{formatPrice(quote.totalPrice)}</p>
                                <p className="text-sm text-gray-500">단가 {formatPrice(quote.unitPrice)}</p>
                              </div>
                            </div>
                          </div>
                          {quote.note && (
                            <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{quote.note}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
