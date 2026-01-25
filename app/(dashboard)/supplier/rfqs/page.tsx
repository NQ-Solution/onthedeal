'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Clock, MapPin, Building2, TrendingUp, FileText, AlertCircle, Eye, MessageSquare } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge, Button } from '@/components/ui'
import { CATEGORIES, CATEGORY_STATUS } from '@/types'
import { mockRFQs, mockQuotes } from '@/lib/mock-data'

// 금액 포맷 함수 (만원 단위)
const formatPrice = (price: number) => {
  if (price >= 10000) {
    return `${Math.floor(price / 10000)}만원`
  }
  return `${price.toLocaleString()}원`
}

export default function SupplierRFQsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // 모집중인 발주만 표시 (본인이 공급자로서 볼 수 있는 발주들)
  const openRFQs = mockRFQs.filter(rfq => rfq.status === 'open')

  const filteredRFQs = openRFQs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || rfq.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalRFQs = openRFQs.length
  const totalBudget = openRFQs.reduce((sum, r) => sum + (r.budget_max || 0), 0)
  const myQuotesCount = mockQuotes.filter(q => q.supplier_id === 'supplier-001').length

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">발주 탐색</h1>
        <p className="text-lg text-gray-500 mt-1">새로운 거래 기회를 찾아보세요</p>
      </div>

      {/* 벤토 그리드 - 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 오픈 RFQ 수 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">모집중 발주</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{totalRFQs}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 구매 희망 규모 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">총 구매 희망 규모</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{formatPrice(totalBudget)}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 내 보낸 견적 */}
        <Link href="/supplier/quotes">
          <Card className="hover:shadow-xl transition-all cursor-pointer h-full bg-gradient-to-br from-primary-500 to-primary-600 border-0">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-white/80">보낸 견적</p>
                  <p className="text-4xl font-bold text-white mt-2">{myQuotesCount}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 카테고리 안내 배너 */}
      <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-bold text-primary-800">현재 육류 카테고리만 서비스 중입니다</h3>
            <p className="text-lg text-primary-700 mt-1">
              채소, 과일, 수산물 등 다른 카테고리는 추후 서비스 확대 예정입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="발주 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '육류 (서비스 중)' },
                ...CATEGORIES.filter(cat => cat !== '육류').map(cat => ({
                  value: cat,
                  label: CATEGORY_STATUS[cat].label,
                })),
              ]}
              value={categoryFilter}
              onChange={(e) => {
                // 육류만 선택 가능
                if (CATEGORY_STATUS[e.target.value]?.active || e.target.value === '') {
                  setCategoryFilter(e.target.value)
                }
              }}
              className="w-full md:w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* RFQ 목록 - 벤토 그리드 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">새로운 발주</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRFQs.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">검색 결과가 없습니다</p>
                <p className="text-lg text-gray-400 mt-2">다른 키워드로 검색해보세요</p>
              </CardContent>
            </Card>
          ) : (
            filteredRFQs.map((rfq) => (
              <Link key={rfq.id} href={`/supplier/rfqs/${rfq.id}`}>
                <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                  <CardContent className="py-6">
                    {/* 상단 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="success" className="text-base px-4 py-2">
                          <Clock className="w-4 h-4 mr-2" />
                          모집중
                        </Badge>
                        <Badge variant="info" className="text-base px-4 py-2">{rfq.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* 견적 수 */}
                        <span className="flex items-center gap-1 text-base text-primary-600 font-medium">
                          <MessageSquare className="w-4 h-4" />
                          견적 {rfq.quote_count || 0}개
                        </span>
                        {/* 조회수 */}
                        <span className="flex items-center gap-1 text-base text-gray-500">
                          <Eye className="w-4 h-4" />
                          {rfq.view_count || 0}
                        </span>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{rfq.title}</h3>

                    {/* 구매자 정보 */}
                    <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {rfq.buyer?.company_name || '구매자'}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {rfq.delivery_address?.split(' ')[0] || '서울'}
                      </span>
                    </div>

                    {/* 상세 정보 */}
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-600">{rfq.quantity} {rfq.unit}</span>
                      <span className="font-bold text-primary-600">
                        구매희망가: {formatPrice(rfq.budget_min || 0)} ~ {formatPrice(rfq.budget_max || 0)}
                      </span>
                    </div>

                    {/* 하단 */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <span className="text-base text-gray-500">납품희망일: {rfq.delivery_date}</span>
                      <Button size="md">견적 제출하기</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 조회수 안내 */}
      <div className="text-center text-base text-gray-500">
        <Eye className="w-4 h-4 inline mr-1" />
        조회수는 공급자들의 열람 횟수입니다
      </div>
    </div>
  )
}
