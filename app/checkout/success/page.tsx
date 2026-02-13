'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle, FileText, MessageSquare, Home } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

interface PaymentResult {
  orderId: string
  amount: number
  method: string
  approvedAt: string
  receipt?: string
}

// 로딩 컴포넌트
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-16 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-6" />
          <h1 className="text-xl font-bold text-gray-900 mb-2 break-keep">결제 처리 중...</h1>
          <p className="text-gray-600 break-keep">잠시만 기다려주세요</p>
        </CardContent>
      </Card>
    </div>
  )
}

// 실제 결제 성공 페이지 내용
function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || '결제 승인에 실패했습니다')
        }

        setPaymentResult(data.data)
      } catch (err) {
        console.error('결제 승인 오류:', err)
        setError(err instanceof Error ? err.message : '결제 승인에 실패했습니다')
      } finally {
        setLoading(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-6" />
            <h1 className="text-xl font-bold text-gray-900 mb-2 break-keep">결제 승인 중...</h1>
            <p className="text-gray-600 break-keep">잠시만 기다려주세요</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2 break-keep">결제 승인 실패</h1>
            <p className="text-gray-600 mb-8 break-keep">{error}</p>
            <div className="space-y-3">
              <Link href="/buyer/orders">
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  주문 내역 확인
                </Button>
              </Link>
              <Link href="/buyer/rfqs">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  메인으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 break-keep">결제 완료</h1>
          <p className="text-gray-600 mb-8 break-keep">결제가 정상적으로 완료되었습니다</p>

          {paymentResult && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">주문번호</span>
                  <span className="font-mono text-sm">{paymentResult.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">결제금액</span>
                  <span className="font-semibold text-primary-600 whitespace-nowrap">
                    {paymentResult.amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">결제수단</span>
                  <span className="whitespace-nowrap">{paymentResult.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 whitespace-nowrap shrink-0 mr-4">결제시간</span>
                  <span className="text-sm">
                    {new Date(paymentResult.approvedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
                  </span>
                </div>
              </div>
              {paymentResult.receipt && (
                <a
                  href={paymentResult.receipt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 text-center text-sm text-primary-600 hover:underline"
                >
                  영수증 보기 →
                </a>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Link href="/buyer/orders">
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                주문 내역 확인
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                공급자와 채팅하기
              </Button>
            </Link>
            <Link href="/buyer/rfqs">
              <Button variant="ghost" className="w-full">
                메인으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 메인 페이지 컴포넌트 - Suspense로 감싸기
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
