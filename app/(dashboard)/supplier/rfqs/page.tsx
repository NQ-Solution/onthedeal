'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, MapPin, Building2, FileText, AlertCircle, Eye, MessageSquare, Loader2, CheckCircle, Filter } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge, Button } from '@/components/ui'
import { CATEGORIES, CATEGORY_STATUS } from '@/types'

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
  viewCount: number
  createdAt: string
  buyer: {
    companyName: string
  }
  _count?: {
    quotes: number
  }
  hasMyQuote?: boolean
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function SupplierRFQsPage() {
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [myQuoteRfqIds, setMyQuoteRfqIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'submitted'>('all')

  useEffect(() => {
    fetchData()
    // 10초마다 새 발주 확인 (실시간 업데이트)
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [rfqRes, quoteRes] = await Promise.all([
        fetch('/api/rfqs'), // 모든 발주 가져오기
        fetch('/api/quotes?role=supplier')
      ])

      if (rfqRes.ok) {
        const data = await rfqRes.json()
        setRfqs(data)
      }

      if (quoteRes.ok) {
        const quotes = await quoteRes.json()
        const rfqIds = new Set(quotes.map((q: any) => q.rfqId)) as Set<string>
        setMyQuoteRfqIds(rfqIds)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 열린 발주 (모집중)
  const openRFQs = rfqs.filter(rfq => rfq.status === 'open')
  // 내가 제안한 발주 중 완료된 것 (closed/in_progress)
  const myCompletedRFQs = rfqs.filter(rfq =>
    myQuoteRfqIds.has(rfq.id) && (rfq.status === 'closed' || rfq.status === 'in_progress')
  )

  const filteredOpenRFQs = openRFQs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rfq.buyer?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || rfq.category === categoryFilter
    const hasMyQuote = myQuoteRfqIds.has(rfq.id)

    let matchesStatus = true
    if (statusFilter === 'available') {
      matchesStatus = !hasMyQuote
    } else if (statusFilter === 'submitted') {
      matchesStatus = hasMyQuote
    }

    return matchesSearch && matchesCategory && matchesStatus
  })

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">발주 탐색</h1>
        <p className="text-lg text-gray-500 mt-1">새로운 거래 기회를 찾아보세요</p>
      </div>

      {/* 안내문구 + 검색/필터 통합 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <span className="text-sm text-primary-700">현재 육류 카테고리만 서비스 중입니다</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="발주명 또는 업체명 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 카테고리' },
                ...CATEGORIES.map(cat => ({
                  value: cat,
                  label: CATEGORY_STATUS[cat]?.label || cat,
                })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48"
            />
            <Select
              options={[
                { value: 'all', label: '전체 발주' },
                { value: 'available', label: '제안 가능' },
                { value: 'submitted', label: '제안 완료' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'submitted')}
              className="w-full md:w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* 열린 발주 목록 */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          모집중인 발주
          <span className="text-sm font-normal text-gray-500">({filteredOpenRFQs.length}개)</span>
        </h2>

        {filteredOpenRFQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {statusFilter === 'submitted' ? '제안한 발주가 없습니다' : '현재 모집중인 발주가 없습니다'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOpenRFQs.map((rfq) => {
            const hasMyQuote = myQuoteRfqIds.has(rfq.id)

            return (
              <Link key={rfq.id} href={`/supplier/rfqs/${rfq.id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="py-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {hasMyQuote ? (
                            <Badge variant="warning" className="text-sm px-3 py-1">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              제안완료
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-sm px-3 py-1">
                              <Clock className="w-3 h-3 mr-1" />
                              제안가능
                            </Badge>
                          )}
                          <Badge variant="info" className="text-sm px-3 py-1">{rfq.category}</Badge>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{rfq.title}</h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {rfq.buyer?.companyName || '구매자'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {rfq.deliveryAddress?.split(' ')[0] || ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            제안 {rfq._count?.quotes || 0}개
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-2 lg:min-w-[200px]">
                        {(rfq.orderSizeRange || rfq.orderFrequency) && (
                          <div className="flex flex-wrap gap-2 text-sm">
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

                        <div className="text-sm text-gray-500">
                          납품희망: {formatDate(rfq.deliveryDate)}
                        </div>

                        <Button size="sm" className="mt-1" variant={hasMyQuote ? "outline" : "primary"}>
                          {hasMyQuote ? '제안 확인하기' : '발주 상세보기'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>

      {/* 완료된 거래 (내가 제안한 것 중 마감된 것) */}
      {myCompletedRFQs.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            완료된 거래
            <span className="text-sm font-normal text-gray-500">({myCompletedRFQs.length}개)</span>
          </h2>

          {myCompletedRFQs.map((rfq) => (
            <Link key={rfq.id} href={`/supplier/rfqs/${rfq.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer bg-gray-50">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default" className="text-sm px-3 py-1">
                          마감
                        </Badge>
                        <Badge variant="info" className="text-sm px-3 py-1">{rfq.category}</Badge>
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 truncate">{rfq.title}</h3>
                      <p className="text-sm text-gray-500">{rfq.buyer?.companyName}</p>
                    </div>

                    <Button size="sm" variant="outline">
                      거래 내역 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
