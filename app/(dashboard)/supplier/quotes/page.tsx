'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, CheckCircle, XCircle, Building2, Calendar, TrendingUp, Receipt, Loader2 } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge } from '@/components/ui'

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
    buyer: {
      id: string
      companyName: string
    }
  }
  chatRooms?: {
    id: string
  }[]
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

export default function SupplierQuotesPage() {
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes?role=supplier')
      if (res.ok) {
        const data = await res.json()
        setQuotes(data)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.rfq?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.rfq?.buyer?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = quotes.filter(q => q.status === 'pending').length
  const acceptedCount = quotes.filter(q => q.status === 'accepted').length
  const totalValue = quotes.reduce((sum, q) => sum + q.totalPrice, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">보낸 제안</h1>
        <p className="text-lg text-gray-500 mt-1">제출한 제안의 상태를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">대기중</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">수락됨</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{acceptedCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">총 제안 금액</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{formatPrice(totalValue)}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">총 제안</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{quotes.length}개</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Receipt className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="제안 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14"
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
              className="w-full md:w-56"
            />
          </div>
        </CardContent>
      </Card>

      {/* 제안 목록 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">제안 목록</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuotes.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">보낸 제안이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote) => {
              const status = statusConfig[quote.status] || statusConfig.pending
              const StatusIcon = status.icon
              const chatRoomId = quote.chatRooms?.[0]?.id
              return (
                <Card key={quote.id} className={`hover:shadow-xl transition-all cursor-pointer h-full ${quote.status === 'accepted' ? 'border-green-300 bg-green-50/50' : ''}`}>
                  <CardContent className="py-6">
                    {/* 상단 */}
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant={status.variant} className="text-base px-4 py-2">
                        <StatusIcon className="w-4 h-4 mr-2" />
                        {status.label}
                      </Badge>
                      <span className="text-3xl font-bold text-primary-600">
                        {formatPrice(quote.totalPrice)}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{quote.rfq?.title}</h3>

                    {/* 구매자 정보 */}
                    <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                      <Building2 className="w-5 h-5" />
                      <span>구매자: {quote.rfq?.buyer?.companyName}</span>
                    </div>

                    {/* 하단 */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <span className="flex items-center gap-2 text-base text-gray-500">
                        <Calendar className="w-5 h-5" />
                        납품일: {formatDate(quote.deliveryDate)}
                      </span>
                      {quote.status === 'accepted' && chatRoomId && (
                        <Link href={`/chat/${chatRoomId}`}>
                          <span className="text-base font-medium text-primary-600 hover:underline">
                            채팅방 이동 →
                          </span>
                        </Link>
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
