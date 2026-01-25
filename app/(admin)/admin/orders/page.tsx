'use client'

import { useState } from 'react'
import { Search, Eye, Trash2, Package, Truck, CheckCircle, XCircle, Clock, Download, DollarSign } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface Order {
  id: string
  order_number: string
  rfq_title: string
  buyer: { company_name: string }
  supplier: { company_name: string }
  total_amount: number
  commission_amount: number
  status: string
  payment_method: string
  created_at: string
}

const mockOrders: Order[] = [
  {
    id: 'o1',
    order_number: 'ORD-2024-0001',
    rfq_title: '한우 등심 대량 구매',
    buyer: { company_name: '맛있는식당' },
    supplier: { company_name: '프리미엄 한우농장' },
    total_amount: 600000,
    commission_amount: 18000,
    status: 'completed',
    payment_method: 'escrow',
    created_at: '2024-02-08',
  },
  {
    id: 'o2',
    order_number: 'ORD-2024-0002',
    rfq_title: '돼지고기 삼겹살 납품',
    buyer: { company_name: '고기천국' },
    supplier: { company_name: '돼지농장' },
    total_amount: 350000,
    commission_amount: 10500,
    status: 'shipped',
    payment_method: 'escrow',
    created_at: '2024-02-09',
  },
  {
    id: 'o3',
    order_number: 'ORD-2024-0003',
    rfq_title: '닭고기 냉동 대량',
    buyer: { company_name: '치킨마을' },
    supplier: { company_name: '치킨팜' },
    total_amount: 240000,
    commission_amount: 7200,
    status: 'paid',
    payment_method: 'escrow',
    created_at: '2024-02-10',
  },
  {
    id: 'o4',
    order_number: 'ORD-2024-0004',
    rfq_title: '수입 소고기 안심',
    buyer: { company_name: '스테이크하우스' },
    supplier: { company_name: '한우마을' },
    total_amount: 550000,
    commission_amount: 16500,
    status: 'pending',
    payment_method: 'escrow',
    created_at: '2024-02-11',
  },
  {
    id: 'o5',
    order_number: 'ORD-2024-0005',
    rfq_title: '닭가슴살 구매',
    buyer: { company_name: '헬시푸드' },
    supplier: { company_name: '치킨팜' },
    total_amount: 180000,
    commission_amount: 5400,
    status: 'cancelled',
    payment_method: 'escrow',
    created_at: '2024-02-05',
  },
]

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' | 'info'; icon: any }> = {
  pending: { label: '대기', variant: 'warning', icon: Clock },
  confirmed: { label: '확정', variant: 'info', icon: CheckCircle },
  paid: { label: '결제완료', variant: 'success', icon: DollarSign },
  shipped: { label: '배송중', variant: 'info', icon: Truck },
  delivered: { label: '배송완료', variant: 'default', icon: Package },
  completed: { label: '완료', variant: 'success', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.rfq_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.commission_amount, 0)
  const completedCount = orders.filter(o => o.status === 'completed').length
  const pendingCount = orders.filter(o => ['pending', 'confirmed', 'paid', 'shipped'].includes(o.status)).length

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
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
                <p className="text-sm text-gray-500">전체 주문</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">진행중</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">완료</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
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
                <p className="text-sm text-gray-500">수수료 수익</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">{(totalRevenue / 10000).toLocaleString()}만</p>
              </div>
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-primary-600" />
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
                  placeholder="주문번호, RFQ, 구매자, 공급자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'pending', label: '대기' },
                { value: 'confirmed', label: '확정' },
                { value: 'paid', label: '결제완료' },
                { value: 'shipped', label: '배송중' },
                { value: 'delivered', label: '배송완료' },
                { value: 'completed', label: '완료' },
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

      {/* Order List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">주문 정보</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">구매자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">공급자</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">금액</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">수수료</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">상태</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status]
                  const StatusIcon = status.icon
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.rfq_title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{order.buyer.company_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{order.supplier.company_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">{order.total_amount.toLocaleString()}원</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-green-600">{order.commission_amount.toLocaleString()}원</p>
                        <p className="text-xs text-gray-500">3%</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="py-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">주문 상세 정보</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">주문번호</p>
                  <p className="font-bold text-lg font-mono">{selectedOrder.order_number}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">RFQ</p>
                  <p className="font-bold">{selectedOrder.rfq_title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="font-bold">{selectedOrder.buyer.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">공급자</p>
                  <p className="font-bold">{selectedOrder.supplier.company_name}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">주문 금액</p>
                  <p className="font-bold text-primary-600 text-lg">{selectedOrder.total_amount.toLocaleString()}원</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">수수료 (3%)</p>
                  <p className="font-bold text-green-600 text-lg">{selectedOrder.commission_amount.toLocaleString()}원</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">상태 변경</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedOrder.status === key ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusChange(selectedOrder.id, key)}
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
