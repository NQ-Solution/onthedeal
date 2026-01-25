'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button, Card, CardContent, Badge } from '@/components/ui'
import { mockRFQs } from '@/lib/mock-data'

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  open: { label: '모집중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: Clock },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

export default function BuyerRFQsPage() {
  // 구매자 ID로 필터링 (실제로는 로그인 사용자 기준)
  const buyerRFQs = mockRFQs.filter(rfq => rfq.buyer_id === 'buyer-001')
  const [rfqs] = useState(buyerRFQs)

  const openCount = rfqs.filter(r => r.status === 'open').length
  const inProgressCount = rfqs.filter(r => r.status === 'in_progress').length
  const totalQuotes = rfqs.reduce((sum, r) => sum + (r.quote_count || 0), 0)

  // 금액 포맷 함수 (만원 단위)
  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${Math.floor(price / 10000)}만원`
    }
    return `${price.toLocaleString()}원`
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 발주</h1>
          <p className="text-lg text-gray-500 mt-1">발주를 관리하고 새로운 요청을 등록하세요</p>
        </div>
        <Link href="/buyer/rfqs/new">
          <Button size="lg">
            <Plus className="w-6 h-6 mr-2" />
            새 발주
          </Button>
        </Link>
      </div>

      {/* 벤토 그리드 - 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 새 견적요청 버튼 카드 */}
        <Link href="/buyer/rfqs/new" className="block">
          <Card className="h-full bg-gradient-to-br from-primary-500 to-primary-600 border-0 hover:shadow-xl transition-all cursor-pointer group">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">새 요청 등록</span>
              <span className="text-white/80 mt-2">클릭하여 시작</span>
            </CardContent>
          </Card>
        </Link>

        {/* 모집중 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">모집중</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{openCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 진행중 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">진행중</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{inProgressCount}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 받은 견적 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">받은 견적</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{totalQuotes}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RFQ 목록 - 벤토 그리드 스타일 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">최근 발주</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rfqs.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">등록된 발주가 없습니다</p>
                <Link href="/buyer/rfqs/new">
                  <Button size="lg" className="mt-6">
                    <Plus className="w-5 h-5 mr-2" />
                    첫 발주 등록하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            rfqs.map((rfq) => {
              const status = statusConfig[rfq.status]
              const StatusIcon = status.icon
              return (
                <Link key={rfq.id} href={`/buyer/rfqs/${rfq.id}`}>
                  <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                    <CardContent className="py-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={status.variant} className="text-base px-4 py-2">
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {status.label}
                          </Badge>
                          <Badge variant="info" className="text-base px-4 py-2">{rfq.category}</Badge>
                        </div>
                        <span className="text-lg font-bold text-primary-600">
                          견적 {rfq.quote_count || 0}개
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{rfq.title}</h3>
                      <div className="flex items-center justify-between text-lg text-gray-600">
                        <span>{rfq.quantity} {rfq.unit}</span>
                        <span>구매희망가: {formatPrice(rfq.budget_min || 0)} ~ {formatPrice(rfq.budget_max || 0)}</span>
                      </div>
                      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between text-base text-gray-500">
                        <span>납품희망일: {rfq.delivery_date}</span>
                        <span>등록일: {rfq.created_at}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
