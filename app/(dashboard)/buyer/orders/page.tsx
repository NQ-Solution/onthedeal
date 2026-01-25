'use client'

import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, Building2, Calendar, CreditCard, ShoppingBag, PackageCheck, HandCoins } from 'lucide-react'
import { Input, Select, Card, CardContent, Badge, Button } from '@/components/ui'
import { mockBuyerOrders, mockRFQs, mockSuppliers } from '@/lib/mock-data'

// 새로운 주문 상태 플로우: 배송준비→배송중→배송완료→수령확인→거래완료
const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info'; icon: any; color: string; step: number }> = {
  pending: { label: '결제대기', variant: 'default', icon: Clock, color: 'gray', step: 0 },
  paid: { label: '결제완료', variant: 'info', icon: CreditCard, color: 'blue', step: 1 },
  preparing: { label: '배송준비', variant: 'info', icon: Package, color: 'blue', step: 2 },
  shipping: { label: '배송중', variant: 'warning', icon: Truck, color: 'yellow', step: 3 },
  delivered: { label: '배송완료', variant: 'success', icon: PackageCheck, color: 'green', step: 4 },
  confirmed: { label: '수령확인', variant: 'success', icon: CheckCircle, color: 'green', step: 5 },
  completed: { label: '거래완료', variant: 'success', icon: HandCoins, color: 'green', step: 6 },
  cancelled: { label: '취소', variant: 'error', icon: Clock, color: 'red', step: -1 },
}

// 금액 포맷 함수 (만원 단위)
const formatPrice = (price: number) => {
  if (price >= 10000) {
    return `${Math.floor(price / 10000)}만${price % 10000 > 0 ? Math.floor((price % 10000) / 1000) + '천' : ''}원`
  }
  return `${price.toLocaleString()}원`
}

const formatPriceSimple = (price: number) => {
  if (price >= 10000) {
    const man = Math.floor(price / 10000)
    return `${man}만원`
  }
  return `${price.toLocaleString()}원`
}

export default function BuyerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // 주문 데이터에 관련 정보 결합
  const ordersWithDetails = mockBuyerOrders.map(order => {
    const rfq = mockRFQs.find(r => r.id === order.rfq_id)
    const supplier = mockSuppliers.find(s => s.id === order.supplier_id)
    return {
      ...order,
      rfq_title: rfq?.title || '알 수 없는 발주',
      supplier_name: supplier?.company_name || '알 수 없는 공급자',
      delivery_date: rfq?.delivery_date || '미정',
    }
  })

  const filteredOrders = ordersWithDetails.filter(order => {
    const matchesSearch = order.rfq_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const shippingCount = ordersWithDetails.filter(o => o.status === 'shipping').length
  const completedCount = ordersWithDetails.filter(o => o.status === 'completed' || o.status === 'confirmed').length
  const totalSpent = ordersWithDetails.reduce((sum, o) => sum + o.total_amount, 0)

  const handleConfirmReceipt = (orderId: string) => {
    alert(`주문 ${orderId}의 수령을 확인했습니다. 거래가 완료됩니다.`)
  }

  return (
    <div className="space-y-8">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">주문 내역</h1>
        <p className="text-lg text-gray-500 mt-1">주문 상태를 확인하고 관리하세요</p>
      </div>

      {/* 벤토 그리드 - 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 배송중 */}
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

        {/* 완료됨 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-500">완료됨</p>
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
                <p className="text-lg text-gray-500">총 주문 금액</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">{formatPriceSimple(totalSpent)}</p>
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
                <p className="text-lg text-gray-500">총 주문</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{ordersWithDetails.length}건</p>
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
              const status = statusConfig[order.status]
              const StatusIcon = status.icon
              return (
                <Card key={order.id} className="hover:shadow-xl transition-all h-full">
                  <CardContent className="py-6">
                    {/* 상단 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant} className="text-base px-4 py-2">
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.label}
                        </Badge>
                        <span className="text-lg text-gray-500">#{order.id}</span>
                      </div>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{order.rfq_title}</h3>

                    {/* 공급자 정보 */}
                    <div className="flex items-center gap-3 text-lg text-gray-600 mb-4">
                      <Building2 className="w-5 h-5" />
                      <span>{order.supplier_name}</span>
                    </div>

                    {/* 결제 금액 정보 */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-base text-gray-600">
                        <span>상품 금액</span>
                        <span>{formatPriceSimple(order.product_amount)}</span>
                      </div>
                      <div className="flex justify-between text-base text-gray-500">
                        <span>안전거래 수수료 (3.5%)</span>
                        <span>+{(order.buyer_fee || order.commission_amount).toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-primary-600 pt-2 border-t border-gray-200">
                        <span>총 결제금액</span>
                        <span>{formatPriceSimple(order.total_amount)}</span>
                      </div>
                      <p className="text-sm text-gray-400 text-right">안전거래 및 에스크로 이용료 포함</p>
                    </div>

                    {/* 하단 */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="flex items-center gap-2 text-base text-gray-500">
                          <Truck className="w-5 h-5" />
                          납품예정: {order.delivery_date}
                        </span>
                        <span className="flex items-center gap-2 text-base text-gray-400">
                          <Calendar className="w-5 h-5" />
                          주문일: {order.created_at}
                        </span>
                      </div>
                      {order.status === 'delivered' && (
                        <Button size="md" onClick={() => handleConfirmReceipt(order.id)}>
                          수령 확인
                        </Button>
                      )}
                      {order.status === 'shipping' && (
                        <Button size="md" variant="outline">배송 추적</Button>
                      )}
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
