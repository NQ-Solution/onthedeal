'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Clock, CheckCircle, XCircle, Building2, Calendar, TrendingUp, Receipt } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge } from '@/components/ui'
import { mockQuotes, mockRFQs, mockBuyers } from '@/lib/mock-data'

// 공급자가 보낸 제안들
const supplierQuotes = mockQuotes.filter(q => q.supplier_id === 'supplier-001').map(quote => {
  const rfq = mockRFQs.find(r => r.id === quote.rfq_id)
  const buyer = mockBuyers.find(b => b.id === rfq?.buyer_id)
  return {
    ...quote,
    rfq_title: rfq?.title || '알 수 없는 발주',
    buyer_name: buyer?.company_name || '알 수 없는 구매자',
  }
})

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  pending: { label: '대기중', variant: 'warning', icon: Clock },
  accepted: { label: '수락됨', variant: 'success', icon: CheckCircle },
  rejected: { label: '거절됨', variant: 'error', icon: XCircle },
  expired: { label: '만료됨', variant: 'default', icon: Clock },
}

export default function SupplierQuotesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredQuotes = supplierQuotes.filter(quote => {
    const matchesSearch = quote.rfq_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = supplierQuotes.filter(q => q.status === 'pending').length
  const acceptedCount = supplierQuotes.filter(q => q.status === 'accepted').length
  const totalValue = supplierQuotes.reduce((sum, q) => sum + q.total_price, 0)

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
                <p className="text-4xl font-bold text-primary-600 mt-2">{(totalValue / 10000).toFixed(0)}만</p>
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
                <p className="text-4xl font-bold text-blue-600 mt-2">{supplierQuotes.length}개</p>
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
              const status = statusConfig[quote.status]
              const StatusIcon = status.icon
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
                        {(quote.total_price / 10000).toFixed(0)}만원
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{quote.rfq_title}</h3>

                    {/* 구매자 정보 */}
                    <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                      <Building2 className="w-5 h-5" />
                      <span>구매자: {quote.buyer_name}</span>
                    </div>

                    {/* 하단 */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <span className="flex items-center gap-2 text-base text-gray-500">
                        <Calendar className="w-5 h-5" />
                        납품일: {quote.delivery_date}
                      </span>
                      {quote.status === 'accepted' && (
                        <Link href={`/chat/room-${quote.id}`}>
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
