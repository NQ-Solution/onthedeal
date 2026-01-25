'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Building2, Calendar, CreditCard, TrendingUp, PackageCheck, HandCoins, Info } from 'lucide-react'
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui'
import { mockSupplierOrders, mockRFQs, mockBuyers } from '@/lib/mock-data'

// 공급자의 주문 목록 (상세 정보 조인)
const orders = mockSupplierOrders.map(order => {
  const rfq = mockRFQs.find(r => r.id === order.rfq_id)
  const buyer = mockBuyers.find(b => b.id === order.buyer_id)
  // 정산 금액 = 상품 금액 - 공급자 수수료 (3%)
  const supplierFee = order.supplier_fee || Math.round(order.product_amount * 0.03)
  const netAmount = order.product_amount - supplierFee
  return {
    ...order,
    rfq_title: rfq?.title || '알 수 없는 발주',
    buyer_name: buyer?.company_name || '알 수 없는 구매자',
    delivery_date: rfq?.delivery_date || '미정',
    commission: supplierFee,
    net_amount: netAmount,
  }
})

// 새로운 주문 상태 플로우
const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: any }> = {
  pending: { label: '결제대기', variant: 'default', icon: Clock },
  paid: { label: '결제완료', variant: 'info', icon: CreditCard },
  preparing: { label: '배송준비', variant: 'info', icon: Package },
  shipping: { label: '배송중', variant: 'warning', icon: Truck },
  delivered: { label: '배송완료', variant: 'success', icon: PackageCheck },
  confirmed: { label: '수령확인', variant: 'success', icon: CheckCircle },
  completed: { label: '거래완료', variant: 'success', icon: HandCoins },
  cancelled: { label: '취소', variant: 'error', icon: Clock },
}

// 금액 포맷 함수 (만원 단위)
const formatPriceSimple = (price: number) => {
  if (price >= 10000) {
    const man = Math.floor(price / 10000)
    return `${man}만원`
  }
  return `${price.toLocaleString()}원`
}

export default function SupplierOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.rfq_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleShip = (orderId: string) => {
    alert(`주문 ${orderId}의 배송을 시작합니다.`)
  }

  // 통계 계산
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const shippingCount = orders.filter(o => o.status === 'shipping').length
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'confirmed').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.net_amount, 0)

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
        <p className="text-lg text-gray-500 mt-1">주문을 관리하고 배송을 진행하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">배송준비</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{preparingCount}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">배송중</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">{shippingCount}</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Truck className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">완료</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{completedCount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">총 정산액</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{formatPriceSimple(totalRevenue)}</p>
              </div>
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 정산 안내 */}
      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <Info className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-blue-900">정산 안내</h3>
              <p className="text-lg text-blue-700 mt-2">
                상품 금액에서 플랫폼 수수료 <span className="font-bold">3%</span>를 차감한 금액이 정산됩니다.
              </p>
              <p className="text-base text-blue-600 mt-1">
                구매자가 수령을 확인하면 영업일 기준 2~3일 내 정산이 진행됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* 주문 목록 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">주문 목록</h2>
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl text-gray-500">주문이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const status = statusLabels[order.status]
              const StatusIcon = status.icon
              return (
                <Card key={order.id} className="hover:shadow-xl transition-all">
                  <CardContent className="py-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* 좌측: 주문 정보 */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={status.variant} className="text-base px-4 py-2">
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {status.label}
                          </Badge>
                          <span className="text-lg text-gray-500">#{order.id}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{order.rfq_title}</h3>
                        <div className="flex items-center gap-3 text-lg text-gray-600">
                          <Building2 className="w-5 h-5" />
                          <span>구매자: {order.buyer_name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-base text-gray-500">
                          <span className="flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            납품예정: {order.delivery_date}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            주문일: {order.created_at}
                          </span>
                        </div>
                      </div>

                      {/* 우측: 금액 정보 */}
                      <div className="lg:w-80">
                        <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                          <div className="flex justify-between text-lg text-gray-700">
                            <span>상품 금액</span>
                            <span className="font-medium">{formatPriceSimple(order.product_amount)}</span>
                          </div>
                          <div className="flex justify-between text-base text-red-500">
                            <span>플랫폼 수수료 (3%)</span>
                            <span>-{order.commission.toLocaleString()}원</span>
                          </div>
                          <div className="flex justify-between text-2xl font-bold text-primary-600 pt-3 border-t-2 border-gray-200">
                            <span>정산 금액</span>
                            <span>{formatPriceSimple(order.net_amount)}</span>
                          </div>
                        </div>

                        {/* 액션 버튼 */}
                        {order.status === 'preparing' && (
                          <Button
                            size="lg"
                            className="w-full mt-4"
                            onClick={() => handleShip(order.id)}
                          >
                            <Truck className="w-5 h-5 mr-2" />
                            배송 시작
                          </Button>
                        )}
                        {order.status === 'shipping' && (
                          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                            <p className="text-yellow-700 font-medium">배송 진행 중</p>
                            <p className="text-sm text-yellow-600 mt-1">구매자 수령 대기</p>
                          </div>
                        )}
                        {(order.status === 'confirmed' || order.status === 'completed') && (
                          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                            <p className="text-green-700 font-medium">
                              {order.status === 'confirmed' ? '정산 진행 중' : '정산 완료'}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                              {order.status === 'confirmed' ? '영업일 2~3일 내 입금' : '정산이 완료되었습니다'}
                            </p>
                          </div>
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
