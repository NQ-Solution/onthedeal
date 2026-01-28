'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Clock, MapPin, Building2, TrendingUp, FileText, AlertCircle, Eye, MessageSquare, Loader2 } from 'lucide-react'
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
}

const formatPrice = (price: number) => {
  if (price >= 10000) {
    return `${Math.floor(price / 10000)}만원`
  }
  return `${price.toLocaleString()}원`
}

export default function SupplierRFQsPage() {
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [myQuotesCount, setMyQuotesCount] = useState(0)

  useEffect(() => {
    fetchRFQs()
    fetchMyQuotes()
  }, [])

  const fetchRFQs = async () => {
    try {
      const res = await fetch('/api/rfqs?status=open')
      if (res.ok) {
        const data = await res.json()
        setRfqs(data)
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyQuotes = async () => {
    try {
      const res = await fetch('/api/quotes?role=supplier')
      if (res.ok) {
        const data = await res.json()
        setMyQuotesCount(data.length)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    }
  }

  const openRFQs = rfqs.filter(rfq => rfq.status === 'open')

  const filteredRFQs = openRFQs.filter(rfq => {
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || rfq.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalRFQs = openRFQs.length
  const totalBudget = openRFQs.reduce((sum, r) => sum + (r.budgetMax || r.desiredPrice || 0), 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">발주 탐색</h1>
        <p className="text-lg text-gray-500 mt-1">새로운 거래 기회를 찾아보세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">등록된 발주</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{totalRFQs}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

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

        <Link href="/supplier/quotes">
          <Card className="hover:shadow-xl transition-all cursor-pointer h-full bg-gradient-to-br from-primary-500 to-primary-600 border-0">
            <CardContent className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg text-white/80">보낸 제안</p>
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
                { value: '', label: '전체 카테고리' },
                ...CATEGORIES.map(cat => ({
                  value: cat,
                  label: CATEGORY_STATUS[cat]?.label || cat,
                })),
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">새로운 발주</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRFQs.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">현재 모집중인 발주가 없습니다</p>
                <p className="text-lg text-gray-400 mt-2">새로운 발주가 등록되면 여기에 표시됩니다</p>
              </CardContent>
            </Card>
          ) : (
            filteredRFQs.map((rfq) => (
              <Link key={rfq.id} href={`/supplier/rfqs/${rfq.id}`}>
                <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="success" className="text-base px-4 py-2">
                          <Clock className="w-4 h-4 mr-2" />
                          모집중
                        </Badge>
                        <Badge variant="info" className="text-base px-4 py-2">{rfq.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-base text-primary-600 font-medium">
                          <MessageSquare className="w-4 h-4" />
                          제안 {rfq._count?.quotes || 0}개
                        </span>
                        <span className="flex items-center gap-1 text-base text-gray-500">
                          <Eye className="w-4 h-4" />
                          {rfq.viewCount || 0}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{rfq.title}</h3>

                    <div className="flex items-center gap-4 text-lg text-gray-600 mb-4">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {rfq.buyer?.companyName || '구매자'}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {rfq.deliveryAddress?.split(' ')[0] || ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-600">{rfq.quantity} {rfq.unit}</span>
                      <span className="font-bold text-primary-600">
                        {rfq.budgetMin && rfq.budgetMax ? (
                          `구매희망가: ${formatPrice(rfq.budgetMin)} ~ ${formatPrice(rfq.budgetMax)}`
                        ) : rfq.desiredPrice ? (
                          `구매희망가: ${formatPrice(rfq.desiredPrice)}`
                        ) : (
                          '가격 협의'
                        )}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <span className="text-base text-gray-500">납품희망일: {formatDate(rfq.deliveryDate)}</span>
                      <Button size="md">제안 제출하기</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="text-center text-base text-gray-500">
        <Eye className="w-4 h-4 inline mr-1" />
        조회수는 공급자들의 열람 횟수입니다
      </div>
    </div>
  )
}
