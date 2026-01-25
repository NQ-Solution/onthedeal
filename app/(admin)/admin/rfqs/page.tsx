'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Download, Loader2 } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface RFQ {
  id: string
  title: string
  buyer: { id: string; companyName: string; email: string }
  category: string
  quantity: number
  unit: string
  budgetMin: number | null
  budgetMax: number | null
  deliveryDate: string
  status: string
  _count: { quotes: number }
  createdAt: string
}

interface Stats {
  total: number
  open: number
  inProgress: number
  closed: number
  totalQuotes: number
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error'; icon: any }> = {
  open: { label: '모집중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: AlertTriangle },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

export default function AdminRFQsPage() {
  const [loading, setLoading] = useState(true)
  const [rfqs, setRfqs] = useState<RFQ[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchRFQs()
  }, [statusFilter])

  const fetchRFQs = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/rfqs?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRfqs(data.rfqs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch RFQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchRFQs()
  }

  const filteredRfqs = rfqs.filter(rfq => {
    if (!searchTerm) return true
    const matchesSearch =
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleDelete = async (rfqId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/rfqs?id=${rfqId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchRFQs()
        setShowModal(false)
        setSelectedRfq(null)
      }
    } catch (error) {
      console.error('Failed to delete RFQ:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async (rfqId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, status: newStatus }),
      })
      if (res.ok) {
        fetchRFQs()
        if (selectedRfq) {
          setSelectedRfq({ ...selectedRfq, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Failed to update RFQ status:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const formatPrice = (min: number | null, max: number | null) => {
    if (!min && !max) return '-'
    const minStr = min ? `${(min / 10000).toFixed(0)}만` : ''
    const maxStr = max ? `${(max / 10000).toFixed(0)}만원` : ''
    if (min && max) return `${minStr} ~ ${maxStr}`
    return minStr || maxStr
  }

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
                <p className="text-sm text-gray-500">전체 발주</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">모집중</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.open || 0}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">진행중</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.inProgress || 0}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 견적</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{stats?.totalQuotes || 0}</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary-600" />
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
                  placeholder="제목, 구매자 검색..."
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
                { value: 'open', label: '모집중' },
                { value: 'in_progress', label: '진행중' },
                { value: 'closed', label: '마감' },
                { value: 'cancelled', label: '취소' },
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

      {/* RFQ List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">발주 정보</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">카테고리</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">예산</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">견적</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRfqs.map((rfq) => {
                  const status = statusConfig[rfq.status]
                  const StatusIcon = status?.icon || Clock
                  return (
                    <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{rfq.title}</p>
                          <p className="text-sm text-gray-500">{rfq.quantity} {rfq.unit} | 마감: {formatDate(rfq.deliveryDate)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{rfq.buyer.companyName}</p>
                          <p className="text-sm text-gray-500">{rfq.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{rfq.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">
                          {formatPrice(rfq.budgetMin, rfq.budgetMax)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status?.variant || 'default'}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status?.label || rfq.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{rfq._count.quotes}건</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedRfq(rfq); setShowModal(true); }}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                            onClick={() => handleDelete(rfq.id)}
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
            {filteredRfqs.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RFQ Detail Modal */}
      {showModal && selectedRfq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">발주 상세 정보</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">제목</p>
                  <p className="font-bold text-lg">{selectedRfq.title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">카테고리</p>
                  <Badge variant="info" className="mt-1">{selectedRfq.category}</Badge>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="font-bold">{selectedRfq.buyer.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">수량</p>
                  <p className="font-bold">{selectedRfq.quantity} {selectedRfq.unit}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">예산</p>
                  <p className="font-bold text-primary-600">
                    {formatPrice(selectedRfq.budgetMin, selectedRfq.budgetMax)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">마감일</p>
                  <p className="font-bold">{formatDate(selectedRfq.deliveryDate)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">상태 변경</label>
                <div className="flex gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedRfq.status === key ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(selectedRfq.id, key)}
                      disabled={actionLoading}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  닫기
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(selectedRfq.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
