'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Info, AlertCircle, RefreshCw } from 'lucide-react'
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'

const mockRFQ = {
  id: '1',
  title: '한우 등심 대량 구매',
  description: '프리미엄 한우 등심 1++ 등급으로 50kg 필요합니다. 신선도가 중요하며, 진공포장 필수입니다.',
  buyer: { company_name: '맛있는식당' },
  category: '육류',
  quantity: 50,
  unit: 'kg',
  budget_min: 500000,
  budget_max: 700000,
  deadline: '2024-02-15',
  delivery_address: '서울시 강남구 역삼동 123-45',
  status: 'open',
  created_at: '2024-02-01',
}

export default function SupplierRFQDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    description: '',
    delivery_date: '',
  })

  // 현재 보유 크레딧 (Mock)
  const currentCredit = 150000 // 15만원

  // 구매 희망가 최소금액의 3% 선차감
  const depositAmount = Math.round(mockRFQ.budget_min * 0.03)

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (depositAmount > currentCredit) {
      alert('크레딧이 부족합니다. 크레딧을 충전해주세요.')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert(`제안이 제출되었습니다.\n\n선차감 크레딧: ${depositAmount.toLocaleString()}원\n\n※ 3일 내 거래 미확정 시 크레딧이 환불됩니다.`)
    router.push('/supplier/quotes')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 발주 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">모집중</Badge>
              <Badge variant="info">{mockRFQ.category}</Badge>
            </div>
            <CardTitle>{mockRFQ.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">구매자</p>
              <p className="font-medium">{mockRFQ.buyer.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">상세 설명</p>
              <p className="text-gray-700">{mockRFQ.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">수량</p>
                <p className="font-medium">{mockRFQ.quantity} {mockRFQ.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">구매 희망가</p>
                <p className="font-medium text-primary-600">
                  {(mockRFQ.budget_min / 10000).toFixed(0)}만원 ~ {(mockRFQ.budget_max / 10000).toFixed(0)}만원
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">마감일</p>
                <p className="font-medium">{mockRFQ.deadline}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">배송지</p>
                <p className="font-medium">{mockRFQ.delivery_address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제안 제출 폼 */}
        <Card>
          <CardHeader>
            <CardTitle>제안 제출</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              현재 보유 크레딧: <strong className="text-primary-600">{currentCredit.toLocaleString()}원</strong>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuote} className="space-y-6">
              <Input
                label="제안가 (원)"
                type="number"
                placeholder="650000"
                value={quoteForm.price}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, price: e.target.value }))}
                required
              />

              <Textarea
                label="제안 설명"
                placeholder="상품의 특징, 품질, 배송 조건 등을 설명해주세요."
                value={quoteForm.description}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />

              <Input
                label="납품 가능일"
                type="date"
                value={quoteForm.delivery_date}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                required
              />

              {/* 크레딧 선차감 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-bold mb-2">크레딧 선차감 안내</p>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>구매 희망가 (최소)</span>
                        <span>{mockRFQ.budget_min.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span>선차감 비율</span>
                        <span>3%</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-blue-200">
                        <span>제안 제출 시 차감</span>
                        <span className="text-blue-800">{depositAmount.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 환불 정책 안내 */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-bold mb-2">환불 정책</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>거래 확정 시: 크레딧 차감 유지 (환불 불가)</li>
                      <li className="text-green-800 font-medium">3일 내 거래 미확정 시: 크레딧 전액 환불</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 크레딧 부족 경고 */}
              {depositAmount > currentCredit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-red-800">크레딧 부족</p>
                      <p className="text-red-700 mt-1">
                        필요 크레딧: {depositAmount.toLocaleString()}원 / 보유: {currentCredit.toLocaleString()}원
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 text-red-600 border-red-300"
                        onClick={() => router.push('/supplier/credits')}
                      >
                        크레딧 충전하기
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                disabled={depositAmount > currentCredit}
              >
                <Send className="w-4 h-4 mr-2" />
                제안 제출하기 ({depositAmount.toLocaleString()}원 선차감)
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
