'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
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
  deliveryDate: string
  deliveryAddress: string
  status: string
  createdAt: string
  _count?: {
    quotes: number
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error'; icon: any }> = {
  open: { label: '모집중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: Clock },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
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
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])

  useEffect(() => {
    fetchRFQs()
  }, [])

  const fetchRFQs = async () => {
    try {
      const res = await fetch('/api/rfqs?role=buyer')
      const data = await res.json()

      if (res.ok) {
        setRfqs(data)
      } else {
        console.error('RFQ 조회 실패:', data.error || '알 수 없는 오류')
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCount = rfqs.filter(r => r.status === 'open').length
  const inProgressCount = rfqs.filter(r => r.status === 'in_progress').length
  const totalQuotes = rfqs.reduce((sum, r) => sum + (r._count?.quotes || 0), 0)

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
        {/* 새 제안요청 버튼 카드 */}
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

        {/* 받은 제안 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">받은 제안</p>
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
              const status = statusConfig[rfq.status] || statusConfig.open
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
                          제안 {rfq._count?.quotes || 0}개
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{rfq.title}</h3>
                      <div className="flex items-center justify-between text-lg text-gray-600">
                        <span>{rfq.quantity} {rfq.unit}</span>
                        <span>
                          {rfq.budgetMin && rfq.budgetMax ? (
                            `구매희망가: ${formatPrice(rfq.budgetMin)} ~ ${formatPrice(rfq.budgetMax)}`
                          ) : rfq.desiredPrice ? (
                            `구매희망가: ${formatPrice(rfq.desiredPrice)}`
                          ) : (
                            '가격 협의'
                          )}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between text-base text-gray-500">
                        <span>납품희망일: {formatDate(rfq.deliveryDate)}</span>
                        <span>등록일: {formatDate(rfq.createdAt)}</span>
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
