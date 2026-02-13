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

interface Order {
  id: string
  buyer: { companyName: string; contactName: string; email: string }
  supplier: { companyName: string }
  rfq: { title: string }
  quote: { totalPrice: number; deliveryDate: string }
  productAmount: number
  totalAmount: number
  commissionAmount: number
  supplierFee: number
  buyerFee: number
  status: string
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
  const orderId = params?.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [sdkReady, setSdkReady] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card')
  const [error, setError] = useState<string | null>(null)

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

  // 주문 정보 로드
  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        setError('주문 정보를 찾을 수 없습니다.')
      }
    } catch (err) {
      setError('주문 정보를 불러오는데 실패했습니다.')
    } finally {
      setPageLoading(false)
    }
  }

  // 토스페이먼츠 SDK 로드 완료 핸들러
  const handleSdkLoad = () => {
    setSdkReady(true)
  }

  // 결제 요청
  const handlePayment = async () => {
    if (!order) {
      setError('주문 정보가 없습니다.')
      return
    }

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

  // 로딩 중
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // 주문 정보 없음
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 break-keep">주문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4 break-keep">{error || '요청하신 주문 정보가 존재하지 않습니다.'}</p>
          <Button onClick={() => router.back()}>돌아가기</Button>
        </div>
      </div>
    )
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

          <h1 className="text-2xl font-bold text-gray-900 mb-6 break-keep">결제하기</h1>

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
                    <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">상품명</span>
                    <span className="font-medium break-keep text-right">{order.rfq.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">공급자</span>
                    <span className="break-keep text-right">{order.supplier.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">납품예정일</span>
                    <span className="whitespace-nowrap">{order.quote.deliveryDate}</span>
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
                            <p className="font-semibold text-gray-900 whitespace-nowrap">{method.label}</p>
                            <p className="text-sm text-gray-500 break-keep">{method.description}</p>
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
                    <p className="font-medium text-red-800 break-keep">결제 오류</p>
                    <p className="text-sm text-red-600 break-keep">{error}</p>
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
                    <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">상품 금액</span>
                    <span className="whitespace-nowrap">{order.productAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 whitespace-nowrap shrink-0 mr-4">수수료</span>
                    <span className="text-green-600 whitespace-nowrap">0원 (무료)</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-semibold text-gray-900 whitespace-nowrap shrink-0 mr-4">총 결제금액</span>
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
                    <p className="font-medium mb-1 break-keep">안전한 결제</p>
                    <ul className="space-y-1 text-blue-600">
                      <li className="break-keep">- 토스페이먼츠 보안 결제</li>
                      <li className="break-keep">- 에스크로 안전 거래</li>
                      <li className="break-keep">- 문제 발생 시 전액 환불</li>
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
                <p className="text-sm text-center text-gray-500 break-keep">
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
