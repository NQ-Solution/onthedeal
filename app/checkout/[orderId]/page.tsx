'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Building2, Smartphone, Loader2, AlertCircle, Info } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import Script from 'next/script'
import { siteConfig, getPaymentUrls } from '@/lib/site-config'

// 토스페이먼츠 타입 정의
declare global {
  interface Window {
    TossPayments: (clientKey: string) => {
      requestPayment: (method: string, options: TossPaymentOptions) => Promise<void>
    }
  }
}

interface TossPaymentOptions {
  amount: number
  orderId: string
  orderName: string
  customerName: string
  customerEmail?: string
  successUrl: string
  failUrl: string
  card?: {
    useEscrow?: boolean
    flowMode?: string
    useCardPoint?: boolean
    useAppCardOnly?: boolean
  }
  virtualAccount?: {
    cashReceipt?: {
      type: 'income' | 'expense'
    }
    useEscrow?: boolean
    validHours?: number
  }
}

// Mock 주문 데이터 (실제로는 API에서 가져옴)
const mockOrder = {
  id: 'order-001',
  buyer: { companyName: '맛있는식당', contactName: '김구매', email: 'buyer@test.com' },
  supplier: { companyName: '프리미엄한우농장' },
  rfq: { title: '한우 등심 1++ 등급 대량 구매' },
  quote: { totalPrice: 600000, deliveryDate: '2025-02-14' },
  productAmount: 600000,
  totalAmount: 600000, // 구매자는 수수료 없음
  commissionAmount: 18000, // 3% (공급자 부담)
  supplierFee: 18000,
  buyerFee: 0,
  status: 'pending',
}

type PaymentMethod = 'card' | 'virtualAccount' | 'transfer'

const paymentMethods = [
  { id: 'card' as PaymentMethod, label: '신용/체크카드', icon: CreditCard, description: '국내 모든 카드 결제 가능' },
  { id: 'virtualAccount' as PaymentMethod, label: '가상계좌', icon: Building2, description: '무통장입금 (24시간 유효)' },
  { id: 'transfer' as PaymentMethod, label: '계좌이체', icon: Smartphone, description: '실시간 계좌이체' },
]

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(mockOrder)
  const [loading, setLoading] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [error, setError] = useState<string | null>(null)

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

  // 토스페이먼츠 SDK 로드 완료 핸들러
  const handleSdkLoad = () => {
    setSdkReady(true)
  }

  // 결제 요청
  const handlePayment = async () => {
    if (!sdkReady) {
      setError('결제 시스템을 로드하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (!clientKey) {
      setError('결제 설정이 완료되지 않았습니다. 관리자에게 문의하세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const tossPayments = window.TossPayments(clientKey)
      const paymentUrls = getPaymentUrls(order.id)

      const paymentOptions: TossPaymentOptions = {
        amount: order.totalAmount,
        orderId: order.id,
        orderName: order.rfq.title.length > 100 ? order.rfq.title.slice(0, 97) + '...' : order.rfq.title,
        customerName: order.buyer.contactName,
        customerEmail: order.buyer.email,
        successUrl: paymentUrls.successUrl,
        failUrl: paymentUrls.failUrl,
      }

      // 결제 수단별 추가 옵션
      if (selectedMethod === 'card') {
        paymentOptions.card = {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: true,
        }
      } else if (selectedMethod === 'virtualAccount') {
        paymentOptions.virtualAccount = {
          cashReceipt: {
            type: 'expense', // 사업자용 현금영수증
          },
          useEscrow: false,
          validHours: 24,
        }
      }

      // 결제 수단 매핑
      const methodMap: Record<PaymentMethod, string> = {
        card: '카드',
        virtualAccount: '가상계좌',
        transfer: '계좌이체',
      }

      await tossPayments.requestPayment(methodMap[selectedMethod], paymentOptions)
    } catch (err) {
      console.error('결제 요청 오류:', err)
      setError(err instanceof Error ? err.message : '결제 요청에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 토스페이먼츠 SDK 스크립트 */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        onLoad={handleSdkLoad}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* 헤더 */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">결제하기</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽: 결제 수단 선택 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 주문 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">주문 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품명</span>
                    <span className="font-medium">{order.rfq.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">공급자</span>
                    <span>{order.supplier.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">납품예정일</span>
                    <span>{order.quote.deliveryDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 결제 수단 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결제 수단 선택</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            selectedMethod === method.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            selectedMethod === method.id ? 'bg-primary-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              selectedMethod === method.id ? 'text-primary-600' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">{method.label}</p>
                            <p className="text-sm text-gray-500">{method.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">결제 오류</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 오른쪽: 결제 금액 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결제 금액</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span>{order.productAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">수수료</span>
                    <span className="text-green-600">0원 (무료)</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-semibold text-gray-900">총 결제금액</span>
                    <span className="font-bold text-xl text-primary-600">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 안내 메시지 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">안전한 결제</p>
                    <ul className="space-y-1 text-blue-600">
                      <li>- 토스페이먼츠 보안 결제</li>
                      <li>- 에스크로 안전 거래</li>
                      <li>- 문제 발생 시 전액 환불</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 결제 버튼 */}
              <Button
                className="w-full h-14 text-lg"
                onClick={handlePayment}
                disabled={loading || !sdkReady}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    {order.totalAmount.toLocaleString()}원 결제하기
                  </>
                )}
              </Button>

              {!sdkReady && (
                <p className="text-sm text-center text-gray-500">
                  결제 시스템을 로드하는 중...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
