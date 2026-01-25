'use client'

import { useState } from 'react'
import { Search, Eye, Trash2, Clock, CheckCircle, XCircle, Receipt, Download } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface Quote {
  id: string
  rfq_title: string
  supplier: { company_name: string; email: string }
  buyer: { company_name: string }
  unit_price: number
  total_price: number
  delivery_date: string
  status: string
  created_at: string
}

const mockQuotes: Quote[] = [
  {
    id: 'q1',
    rfq_title: '한우 등심 대량 구매',
    supplier: { company_name: '프리미엄 한우농장', email: 'supplier1@farm.com' },
    buyer: { company_name: '맛있는식당' },
    unit_price: 12000,
    total_price: 600000,
    delivery_date: '2024-02-12',
    status: 'pending',
    created_at: '2024-02-05',
  },
  {
    id: 'q2',
    rfq_title: '한우 등심 대량 구매',
    supplier: { company_name: '한우마을', email: 'hanwoo@village.com' },
    buyer: { company_name: '맛있는식당' },
    unit_price: 11500,
    total_price: 575000,
    delivery_date: '2024-02-13',
    status: 'accepted',
    created_at: '2024-02-06',
  },
  {
    id: 'q3',
    rfq_title: '돼지고기 삼겹살 납품',
    supplier: { company_name: '돼지농장', email: 'pork@farm.com' },
    buyer: { company_name: '고기천국' },
    unit_price: 3500,
    total_price: 350000,
    delivery_date: '2024-02-18',
    status: 'rejected',
    created_at: '2024-02-07',
  },
  {
    id: 'q4',
    rfq_title: '닭고기 냉동 대량',
    supplier: { company_name: '치킨팜', email: 'chicken@farm.com' },
    buyer: { company_name: '치킨마을' },
    unit_price: 1200,
    total_price: 240000,
    delivery_date: '2024-02-15',
    status: 'expired',
    created_at: '2024-01-28',
  },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  pending: { label: '대기중', variant: 'warning' },
  accepted: { label: '수락됨', variant: 'success' },
  rejected: { label: '거절됨', variant: 'error' },
  expired: { label: '만료됨', variant: 'default' },
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState(mockQuotes)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch =
      quote.rfq_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.buyer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = quotes.filter(q => q.status === 'pending').length
  const acceptedCount = quotes.filter(q => q.status === 'accepted').length
  const totalAmount = quotes.reduce((sum, q) => sum + q.total_price, 0)

  const handleDelete = (quoteId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setQuotes(quotes.filter(q => q.id !== quoteId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">전체 견적</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{quotes.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Receipt className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">대기중</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-yellow-600" />
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
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 금액</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{(totalAmount / 10000).toLocaleString()}만</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Receipt className="w-7 h-7 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="RFQ, 공급자, 구매자 검색..."
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
                { value: 'expired', label: '만료됨' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40"
            />
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quote List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">RFQ</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">공급자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">금액</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">납품일</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQuotes.map((quote) => {
                  const status = statusConfig[quote.status]
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{quote.rfq_title}</p>
                        <p className="text-sm text-gray-500">등록: {quote.created_at}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{quote.supplier.company_name}</p>
                        <p className="text-sm text-gray-500">{quote.supplier.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{quote.buyer.company_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">{quote.total_price.toLocaleString()}원</p>
                        <p className="text-sm text-gray-500">단가: {quote.unit_price.toLocaleString()}원</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {quote.delivery_date}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            onClick={() => handleDelete(quote.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredQuotes.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
