'use client'

import { useState } from 'react'
import { Search, Eye, Trash2, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Download } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface RFQ {
  id: string
  title: string
  buyer: { company_name: string; email: string }
  category: string
  quantity: number
  unit: string
  budget_min: number
  budget_max: number
  deadline: string
  status: string
  quote_count: number
  created_at: string
}

const mockRFQs: RFQ[] = [
  {
    id: 'rfq1',
    title: '한우 등심 대량 구매',
    buyer: { company_name: '맛있는식당', email: 'buyer1@restaurant.com' },
    category: '육류',
    quantity: 50,
    unit: 'kg',
    budget_min: 500000,
    budget_max: 700000,
    deadline: '2024-02-15',
    status: 'open',
    quote_count: 5,
    created_at: '2024-02-01',
  },
  {
    id: 'rfq2',
    title: '돼지고기 삼겹살 납품',
    buyer: { company_name: '고기천국', email: 'meat@heaven.com' },
    category: '육류',
    quantity: 100,
    unit: 'kg',
    budget_min: 300000,
    budget_max: 400000,
    deadline: '2024-02-20',
    status: 'in_progress',
    quote_count: 3,
    created_at: '2024-02-03',
  },
  {
    id: 'rfq3',
    title: '닭고기 냉동 대량',
    buyer: { company_name: '치킨마을', email: 'chicken@village.com' },
    category: '육류',
    quantity: 200,
    unit: 'kg',
    budget_min: 200000,
    budget_max: 300000,
    deadline: '2024-02-10',
    status: 'closed',
    quote_count: 8,
    created_at: '2024-01-25',
  },
  {
    id: 'rfq4',
    title: '수입 소고기 안심',
    buyer: { company_name: '스테이크하우스', email: 'steak@house.com' },
    category: '육류',
    quantity: 30,
    unit: 'kg',
    budget_min: 450000,
    budget_max: 600000,
    deadline: '2024-02-08',
    status: 'cancelled',
    quote_count: 2,
    created_at: '2024-01-28',
  },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error'; icon: any }> = {
  open: { label: '모집중', variant: 'success', icon: Clock },
  in_progress: { label: '진행중', variant: 'warning', icon: AlertTriangle },
  closed: { label: '마감', variant: 'default', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

export default function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState(mockRFQs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredRfqs = rfqs.filter(rfq => {
    const matchesSearch =
      rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfq.buyer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || rfq.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openCount = rfqs.filter(r => r.status === 'open').length
  const inProgressCount = rfqs.filter(r => r.status === 'in_progress').length
  const totalQuotes = rfqs.reduce((sum, r) => sum + r.quote_count, 0)

  const handleDelete = (rfqId: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setRfqs(rfqs.filter(r => r.id !== rfqId))
    }
  }

  const handleStatusChange = (rfqId: string, newStatus: string) => {
    setRfqs(rfqs.map(r => r.id === rfqId ? { ...r, status: newStatus } : r))
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{rfqs.length}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">{openCount}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-1">{inProgressCount}</p>
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
                <p className="text-3xl font-bold text-primary-600 mt-1">{totalQuotes}</p>
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
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              내보내기
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
                  const StatusIcon = status.icon
                  return (
                    <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-gray-900">{rfq.title}</p>
                          <p className="text-sm text-gray-500">{rfq.quantity} {rfq.unit} | 마감: {rfq.deadline}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{rfq.buyer.company_name}</p>
                          <p className="text-sm text-gray-500">{rfq.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{rfq.category}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">
                          {(rfq.budget_min / 10000).toFixed(0)}만 ~ {(rfq.budget_max / 10000).toFixed(0)}만원
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{rfq.quote_count}건</span>
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
                  <p className="font-bold">{selectedRfq.buyer.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">수량</p>
                  <p className="font-bold">{selectedRfq.quantity} {selectedRfq.unit}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">예산</p>
                  <p className="font-bold text-primary-600">
                    {(selectedRfq.budget_min / 10000).toFixed(0)}만 ~ {(selectedRfq.budget_max / 10000).toFixed(0)}만원
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">마감일</p>
                  <p className="font-bold">{selectedRfq.deadline}</p>
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
                      onClick={() => {
                        handleStatusChange(selectedRfq.id, key)
                        setSelectedRfq({ ...selectedRfq, status: key })
                      }}
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
                  onClick={() => { handleDelete(selectedRfq.id); setShowModal(false); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
