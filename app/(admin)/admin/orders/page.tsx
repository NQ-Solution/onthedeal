'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'

interface Order {
  id: string
  rfq: { title: string }
  buyer: { companyName: string }
  supplier: { companyName: string }
  totalAmount: number
  commissionAmount: number
  status: string
  paymentMethod: string
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  completed: number
  totalRevenue: { _sum: { commissionAmount: number | null } }
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' | 'error' | 'info'; icon: any }> = {
  pending: { label: '대기', variant: 'warning', icon: Clock },
  confirmed: { label: '확정', variant: 'info', icon: CheckCircle },
  paid: { label: '결제완료', variant: 'success', icon: DollarSign },
  preparing: { label: '준비중', variant: 'info', icon: Package },
  shipping: { label: '배송중', variant: 'info', icon: Truck },
  delivered: { label: '배송완료', variant: 'default', icon: Package },
  completed: { label: '완료', variant: 'success', icon: CheckCircle },
  cancelled: { label: '취소', variant: 'error', icon: XCircle },
}

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchOrders()
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    return order.rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
        if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error('Failed to update order:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const totalRevenue = stats?.totalRevenue?._sum?.commissionAmount || 0

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
                <p className="text-sm text-gray-500">전체 주문</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
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
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending || 0}</p>
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
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed || 0}</p>
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
                  placeholder="RFQ, 구매자, 공급자 검색..."
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
                { value: 'pending', label: '대기' },
                { value: 'paid', label: '결제완료' },
                { value: 'shipping', label: '배송중' },
                { value: 'completed', label: '완료' },
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
                  const status = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = status.icon
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{order.id.slice(0, 8)}...</p>
                        <p className="text-sm text-gray-500">{order.rfq.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{order.buyer.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{order.supplier.companyName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-primary-600">{order.totalAmount.toLocaleString()}원</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-green-600">{order.commissionAmount.toLocaleString()}원</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                          className="p-2"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-lg">주문이 없습니다</p>
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
                  <p className="text-sm text-gray-500">RFQ</p>
                  <p className="font-bold">{selectedOrder.rfq.title}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">결제방식</p>
                  <p className="font-bold">{selectedOrder.paymentMethod === 'escrow' ? '에스크로' : '직접결제'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">구매자</p>
                  <p className="font-bold">{selectedOrder.buyer.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">공급자</p>
                  <p className="font-bold">{selectedOrder.supplier.companyName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">주문 금액</p>
                  <p className="font-bold text-primary-600 text-lg">{selectedOrder.totalAmount.toLocaleString()}원</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">수수료</p>
                  <p className="font-bold text-green-600 text-lg">{selectedOrder.commissionAmount.toLocaleString()}원</p>
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
                      disabled={actionLoading}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setShowModal(false)}>
                닫기
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
