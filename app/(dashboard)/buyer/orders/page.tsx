'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Building2, Calendar, CreditCard, ShoppingBag, PackageCheck, HandCoins, Loader2, FileText } from 'lucide-react'
import Link from 'next/link'
import { Input, Select, Card, CardContent, Badge, Button } from '@/components/ui'

interface Order {
  id: string
  rfqId: string
  quoteId: string
  buyerId: string
  supplierId: string
  productAmount: number
  totalAmount: number
  commissionAmount: number
  supplierFee: number | null
  buyerFee: number | null
  status: string
  paymentMethod: string
  createdAt: string
  rfq: {
    id: string
    title: string
    category: string
    quantity: number
    unit: string
    deliveryDate: string
    deliveryAddress: string
  }
  supplier: {
    id: string
    companyName: string
    contactName: string
    phone: string
    bankName?: string
    bankAccount?: string
    bankHolder?: string
  }
  invoice?: {
    id: string
    invoiceNumber: string
  } | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: any; step: number }> = {
  pending: { label: '결제대기', variant: 'default', icon: Clock, step: 0 },
  paid: { label: '결제완료', variant: 'info', icon: CreditCard, step: 1 },
  preparing: { label: '배송준비', variant: 'info', icon: Package, step: 2 },
  shipping: { label: '배송중', variant: 'warning', icon: Truck, step: 3 },
  delivered: { label: '배송완료', variant: 'success', icon: PackageCheck, step: 4 },
  confirmed: { label: '수령확인', variant: 'success', icon: CheckCircle, step: 5 },
  completed: { label: '거래완료', variant: 'success', icon: HandCoins, step: 6 },
  cancelled: { label: '취소', variant: 'error', icon: Clock, step: -1 },
}

const formatPrice = (price: number) => {
  return `${price.toLocaleString()}원`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function BuyerOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders?role=buyer')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.rfq?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier?.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const shippingCount = orders.filter(o => o.status === 'shipping').length
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'confirmed').length
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null)

  const handleGenerateInvoice = async (orderId: string) => {
    setInvoiceLoading(orderId)
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      if (res.ok) {
        alert('명세표가 발행되었습니다.')
        fetchOrders()
      } else if (res.status === 409) {
        alert('이미 명세표가 발행되었습니다.')
        fetchOrders()
      } else {
        const data = await res.json()
        alert(data.error || '명세표 발행에 실패했습니다.')
      }
    } catch (error) {
      alert('명세표 발행에 실패했습니다.')
    } finally {
      setInvoiceLoading(null)
    }
  }

  const handleConfirmReceipt = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      })
      if (res.ok) {
        alert('수령이 확인되었습니다. 거래가 완료됩니다.')
        fetchOrders()
      }
    } catch (error) {
      alert('수령 확인에 실패했습니다.')
    }
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
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 break-keep">주문 내역</h1>
        <p className="text-lg text-gray-500 mt-1 break-keep">주문 상태를 확인하고 관리하세요</p>
      </div>

      {/* 벤토 그리드 - 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 배송중 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">배송중</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{shippingCount}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 완료됨 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">완료됨</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{completedCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 주문 금액 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">총 주문 금액</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{formatPrice(totalSpent)}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 주문 수 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500 whitespace-nowrap">총 주문</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{orders.length}건</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="주문 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-14"
                />
              </div>
            </div>
            <Select
              options={[
                { value: '', label: '전체 상태' },
                { value: 'preparing', label: '배송준비' },
                { value: 'shipping', label: '배송중' },
                { value: 'delivered', label: '배송완료' },
                { value: 'confirmed', label: '수령확인' },
                { value: 'completed', label: '거래완료' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-56"
            />
          </div>
        </CardContent>
      </Card>

      {/* 주문 목록 - 벤토 그리드 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">주문 목록</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">주문 내역이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon
              return (
                <Card key={order.id} className="hover:shadow-xl transition-all h-full">
                  <CardContent className="py-6">
                    {/* 상단 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant} className="text-base px-4 py-2 whitespace-nowrap shrink-0">
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.label}
                        </Badge>
                        <span className="text-lg text-gray-500">#{order.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 break-keep">{order.rfq?.title}</h3>

                    {/* 공급자 정보 */}
                    <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                      <Building2 className="w-5 h-5" />
                      <span>{order.supplier?.companyName}</span>
                    </div>

                    {/* 결제 금액 정보 */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-base text-gray-600">
                        <span className="whitespace-nowrap">상품 금액</span>
                        <span>{formatPrice(order.productAmount)}</span>
                      </div>
                      {order.buyerFee && order.buyerFee > 0 && (
                        <div className="flex justify-between text-base text-gray-500">
                          <span className="whitespace-nowrap">안전거래 수수료</span>
                          <span>+{order.buyerFee.toLocaleString()}원</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold text-primary-600 pt-2 border-t border-gray-200">
                        <span className="whitespace-nowrap">총 결제금액</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* 공급자 계좌 정보 */}
                    {order.supplier?.bankName && order.supplier?.bankAccount && (
                      <div className="bg-blue-50 rounded-xl p-4 mt-4">
                        <p className="text-sm font-medium text-blue-700 mb-2 whitespace-nowrap">결제 계좌 정보</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">은행</span>
                            <span className="font-medium text-gray-900">{order.supplier.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">계좌번호</span>
                            <span className="font-medium text-gray-900">{order.supplier.bankAccount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">예금주</span>
                            <span className="font-medium text-gray-900">{order.supplier.bankHolder || '-'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 하단 */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="flex items-center gap-2 text-base text-gray-500 whitespace-nowrap">
                          <Truck className="w-5 h-5 shrink-0" />
                          납품예정: {formatDate(order.rfq?.deliveryDate)}
                        </span>
                        <span className="flex items-center gap-2 text-base text-gray-400 whitespace-nowrap">
                          <Calendar className="w-5 h-5 shrink-0" />
                          주문일: {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'delivered' && (
                          <Button size="md" className="whitespace-nowrap shrink-0" onClick={() => handleConfirmReceipt(order.id)}>
                            수령 확인
                          </Button>
                        )}
                        {order.status === 'shipping' && (
                          <Button size="md" variant="outline" className="whitespace-nowrap shrink-0" onClick={() => alert('배송 추적 기능은 준비 중입니다.')}>배송 추적</Button>
                        )}
                        {['confirmed', 'completed', 'delivered'].includes(order.status) && !order.invoice && (
                          <Button
                            size="md"
                            variant="outline"
                            className="whitespace-nowrap shrink-0"
                            onClick={() => handleGenerateInvoice(order.id)}
                            disabled={invoiceLoading === order.id}
                          >
                            {invoiceLoading === order.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            명세표 발행
                          </Button>
                        )}
                        {order.invoice && (
                          <Link href={`/invoices/${order.invoice.id}`}>
                            <Button size="md" variant="outline" className="whitespace-nowrap shrink-0">
                              <FileText className="w-4 h-4 mr-2" />
                              명세표 보기
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
