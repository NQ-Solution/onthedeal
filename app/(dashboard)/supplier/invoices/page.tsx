'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, Loader2, Building2, TrendingUp, Filter, Calendar, ArrowUpDown } from 'lucide-react'
import { Input, Card, CardContent, Badge } from '@/components/ui'

interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  productAmount: number
  commissionRate: number
  commissionAmount: number
  totalAmount: number
  isRepeatTrade: boolean
  status: string
  issuedAt: string
  buyer: {
    id: string
    companyName: string
  }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  issued: { label: '발행됨', variant: 'info' },
  confirmed: { label: '확인됨', variant: 'success' },
  cancelled: { label: '취소됨', variant: 'error' },
}

const formatPrice = (price: number) => `${price.toLocaleString()}원`
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ko-KR')

export default function SupplierInvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_asc' | 'amount_desc'>('newest')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices
    .filter(inv => {
      const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.buyer?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
      const invDate = new Date(inv.issuedAt)
      const matchesDateFrom = !dateFrom || invDate >= new Date(dateFrom)
      const matchesDateTo = !dateTo || invDate <= new Date(dateTo + 'T23:59:59')
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
        case 'amount_asc': return a.totalAmount - b.totalAmount
        case 'amount_desc': return b.totalAmount - a.totalAmount
        default: return new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
      }
    })

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.productAmount, 0)
  const totalCommission = invoices.reduce((sum, inv) => sum + inv.commissionAmount, 0)
  const netAmount = totalAmount - totalCommission

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
        <h1 className="text-3xl font-bold text-gray-900 break-keep">거래명세표</h1>
        <p className="text-lg text-gray-500 mt-1 break-keep">발행된 거래명세표를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">총 명세표</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{invoices.length}건</p>
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
                <p className="text-lg text-gray-500 whitespace-nowrap">총 거래 금액</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{formatPrice(totalAmount)}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">총 수수료</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{formatPrice(totalCommission)}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">순 정산액</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{formatPrice(netAmount)}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 + 필터 */}
      <Card>
        <CardContent className="py-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              placeholder="명세표 번호 또는 구매자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">전체 상태</option>
                <option value="issued">발행됨</option>
                <option value="confirmed">확인됨</option>
                <option value="cancelled">취소됨</option>
              </select>
            </div>
            {/* 날짜 범위 */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-gray-400">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="amount_desc">금액 높은순</option>
                <option value="amount_asc">금액 낮은순</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 명세표 목록 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">명세표 목록</h2>
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-500">발행된 명세표가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">명세표 번호</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">구매자</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">상품금액</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">수수료율</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">수수료</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">총액</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">발행일</th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">상세</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status] || statusConfig.issued
                  return (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-primary-600 whitespace-nowrap">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 whitespace-nowrap">{invoice.buyer?.companyName}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-900 whitespace-nowrap">{formatPrice(invoice.productAmount)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-700 whitespace-nowrap">{invoice.commissionRate}%</span>
                          {invoice.isRepeatTrade && (
                            <Badge variant="success" className="text-xs">연속</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gray-500 whitespace-nowrap">{formatPrice(invoice.commissionAmount)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900 whitespace-nowrap">{formatPrice(invoice.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-500 whitespace-nowrap">{formatDate(invoice.issuedAt)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
