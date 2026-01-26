'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, RefreshCw, Home, MessageCircle, Loader2 } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

// 로딩 컴포넌트
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-16 text-center">
          <Loader2 className="w-16 h-16 mx-auto text-gray-400 animate-spin mb-6" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">로딩 중...</h1>
        </CardContent>
      </Card>
    </div>
  )
}

// 실제 결제 실패 페이지 내용
function CheckoutFailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')
  const orderId = searchParams.get('orderId')

  // 에러 코드별 사용자 친화적 메시지
  const getErrorDescription = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다. 다시 시도해주세요.'
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다. 다시 시도해주세요.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거부했습니다. 다른 카드로 시도해주세요.'
      case 'INVALID_CARD_NUMBER':
        return '카드 정보가 올바르지 않습니다. 확인 후 다시 시도해주세요.'
      case 'EXCEED_MAX_CARD_INSTALLMENT_PLAN':
        return '할부 개월 수가 초과되었습니다.'
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다. 다른 카드로 시도해주세요.'
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 횟수를 초과했습니다. 내일 다시 시도해주세요.'
      case 'NOT_SUPPORTED_INSTALLMENT_PLAN':
        return '지원하지 않는 할부 개월입니다.'
      case 'INVALID_CARD_LOST_OR_STOLEN':
        return '분실 또는 도난 신고된 카드입니다.'
      case 'INVALID_CARD_EXPIRY':
        return '카드 유효기간이 만료되었습니다.'
      case 'NOT_AVAILABLE_PAYMENT':
        return '현재 결제가 불가능합니다. 잠시 후 다시 시도해주세요.'
      default:
        return errorMessage || '결제 처리 중 문제가 발생했습니다.'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
          <p className="text-gray-600 mb-4">{getErrorDescription(errorCode)}</p>

          {errorCode && (
            <p className="text-sm text-gray-400 mb-8">오류 코드: {errorCode}</p>
          )}

          <div className="space-y-3">
            {orderId && (
              <Link href={`/checkout/${orderId}`}>
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 결제하기
                </Button>
              </Link>
            )}
            <Link href="/buyer/orders">
              <Button variant="outline" className="w-full">
                주문 내역 확인
              </Button>
            </Link>
            <Link href="/buyer/rfqs">
              <Button variant="ghost" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                메인으로 돌아가기
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500 mb-3">결제에 문제가 계속되나요?</p>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-primary-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                고객센터 문의하기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 메인 페이지 컴포넌트 - Suspense로 감싸기
export default function CheckoutFailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutFailContent />
    </Suspense>
  )
}
