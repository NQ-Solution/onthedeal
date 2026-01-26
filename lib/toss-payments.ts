// 토스페이먼츠 결제 유틸리티
// 문서: https://docs.tosspayments.com/

export const TOSS_PAYMENTS_CONFIG = {
  // 클라이언트 키 (결제창 호출용)
  clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',
  // 시크릿 키 (서버 API 호출용)
  secretKey: process.env.TOSS_SECRET_KEY || '',
  // API 베이스 URL
  apiBaseUrl: 'https://api.tosspayments.com/v1',
}

// 결제 상태 타입
export type TossPaymentStatus =
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_DEPOSIT'
  | 'DONE'
  | 'CANCELED'
  | 'PARTIAL_CANCELED'
  | 'ABORTED'
  | 'EXPIRED'

// 결제 수단 타입
export type PaymentMethod =
  | 'CARD'
  | 'VIRTUAL_ACCOUNT'
  | 'TRANSFER'
  | 'MOBILE_PHONE'
  | 'GIFT_CARD'
  | 'EASY_PAY'

// 결제 요청 파라미터
export interface TossPaymentRequest {
  orderId: string
  amount: number
  orderName: string
  customerName: string
  customerEmail?: string
  successUrl: string
  failUrl: string
  validHours?: number
  cashReceipt?: {
    type: 'income' | 'expense'
  }
}

// 결제 승인 응답
export interface TossPaymentConfirmResponse {
  paymentKey: string
  orderId: string
  status: TossPaymentStatus
  totalAmount: number
  balanceAmount: number
  suppliedAmount: number
  vat: number
  method: string
  requestedAt: string
  approvedAt: string
  card?: {
    company: string
    number: string
    installmentPlanMonths: number
    isInterestFree: boolean
    approveNo: string
    acquireStatus: string
    amount: number
  }
  virtualAccount?: {
    accountNumber: string
    accountType: string
    bank: string
    customerName: string
    dueDate: string
    expired: boolean
    settlementStatus: string
  }
  receipt?: {
    url: string
  }
  failure?: {
    code: string
    message: string
  }
}

// 결제 승인 함수
export async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<TossPaymentConfirmResponse> {
  const secretKey = TOSS_PAYMENTS_CONFIG.secretKey

  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not configured')
  }

  const response = await fetch(`${TOSS_PAYMENTS_CONFIG.apiBaseUrl}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '결제 승인에 실패했습니다')
  }

  return data
}

// 결제 취소 함수
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
): Promise<TossPaymentConfirmResponse> {
  const secretKey = TOSS_PAYMENTS_CONFIG.secretKey

  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not configured')
  }

  const body: Record<string, unknown> = {
    cancelReason,
  }

  if (cancelAmount) {
    body.cancelAmount = cancelAmount
  }

  const response = await fetch(`${TOSS_PAYMENTS_CONFIG.apiBaseUrl}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    },
    body: JSON.stringify(body),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '결제 취소에 실패했습니다')
  }

  return data
}

// 결제 조회 함수
export async function getPayment(paymentKey: string): Promise<TossPaymentConfirmResponse> {
  const secretKey = TOSS_PAYMENTS_CONFIG.secretKey

  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY is not configured')
  }

  const response = await fetch(`${TOSS_PAYMENTS_CONFIG.apiBaseUrl}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || '결제 조회에 실패했습니다')
  }

  return data
}

// 주문번호 생성 (고유 ID)
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `OTD_${timestamp}_${randomStr}`.toUpperCase()
}
