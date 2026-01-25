'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, Clock, CheckCircle, XCircle, Receipt, Loader2 } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface Quote {
  id: string
  rfq: { title: string; buyer: { companyName: string } }
  supplier: { companyName: string; email: string }
  unitPrice: number
  totalPrice: number
  deliveryDate: string
  status: string
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  accepted: number
  totalAmount: { _sum: { totalPrice: number | null } }
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' }> = {
  pending: { label: '대기중', variant: 'warning' },
  accepted: { label: '수락됨', variant: 'success' },
  rejected: { label: '거절됨', variant: 'error' },
  expired: { label: '만료됨', variant: 'default' },
}

export default function AdminQuotesPage() {
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchQuotes()
  }, [statusFilter])

  const fetchQuotes = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/quotes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setQuotes(data.quotes)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchQuotes()
  }

  const handleDelete = async (quoteId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      const res = await fetch(`/api/admin/quotes?id=${quoteId}`, { method: 'DELETE' })
      if (res.ok) fetchQuotes()
    } catch (error) {
      console.error('Failed to delete quote:', error)
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true
    return quote.rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.rfq.buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const totalAmount = stats?.totalAmount?._sum?.totalPrice || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending || 0}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.accepted || 0}</p>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
            <Button variant="outline" className="gap-2" onClick={handleSearch}>
              <Search className="w-4 h-4" />
              검색
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
                  const status = statusConfig[quote.status] || statusConfig.pending
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{quote.rfq.title}</p>
                        <p className="text-sm text-gray-500">{new Date(quote.createdAt).toLocaleDateString('ko-KR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{quote.supplier.companyName}</p>
                        <p className="text-sm text-gray-500">{quote.supplier.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{quote.rfq.buyer.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">{quote.totalPrice.toLocaleString()}원</p>
                        <p className="text-sm text-gray-500">단가: {quote.unitPrice.toLocaleString()}원</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(quote.deliveryDate).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
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
                <p className="text-lg">견적이 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
