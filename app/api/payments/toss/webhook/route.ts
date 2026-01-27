import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

// 토스페이먼츠 웹훅 처리
// 웹훅 URL: https://your-domain.com/api/payments/toss/webhook
// 토스 상점관리자 > 개발정보 > 웹훅에서 등록 필요

// 웹훅 서명 검증 함수
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secretKey: string
): boolean {
  if (!signature) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64')

  // 타이밍 공격 방지를 위한 상수 시간 비교
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // 원본 payload를 먼저 가져옴 (서명 검증용)
    const rawBody = await request.text()

    // 웹훅 서명 검증
    const signature = request.headers.get('toss-signature')
    const webhookSecretKey = process.env.TOSS_WEBHOOK_SECRET_KEY

    if (!webhookSecretKey) {
      console.error('TOSS_WEBHOOK_SECRET_KEY 환경변수가 설정되지 않았습니다')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecretKey)) {
      console.error('웹훅 서명 검증 실패')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const body = JSON.parse(rawBody)

    // 웹훅 이벤트 타입 확인
    const { eventType, data } = body

    console.log('토스페이먼츠 웹훅 (검증됨):', eventType)

    switch (eventType) {
      case 'PAYMENT_COMPLETED':
        // 결제 완료 이벤트
        await handlePaymentCompleted(data)
        break

      case 'VIRTUAL_ACCOUNT_DEPOSITED':
        // 가상계좌 입금 완료 이벤트
        await handleVirtualAccountDeposited(data)
        break

      case 'PAYMENT_CANCELED':
        // 결제 취소 이벤트
        await handlePaymentCanceled(data)
        break

      case 'PAYMENT_STATUS_CHANGED':
        // 결제 상태 변경 이벤트
        await handlePaymentStatusChanged(data)
        break

      default:
        console.log('알 수 없는 웹훅 이벤트:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('웹훅 처리 오류:', error)
    // 웹훅은 항상 200을 반환해야 함 (재시도 방지)
    return NextResponse.json({ success: false, error: 'Internal error' })
  }
}

// 결제 완료 처리
async function handlePaymentCompleted(data: {
  paymentKey: string
  orderId: string
  status: string
  totalAmount: number
  method: string
}) {
  const { orderId, totalAmount, method } = data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    console.error('주문을 찾을 수 없습니다:', orderId)
    return
  }

  // 이미 결제 완료 상태면 무시
  if (order.status === 'paid') {
    return
  }

  // 주문 상태 업데이트
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      updatedAt: new Date(),
    },
  })

  // 주문 로그 기록
  await prisma.orderLog.create({
    data: {
      orderId: orderId,
      status: 'paid',
      note: `웹훅 결제 완료 (${method}, ${totalAmount}원)`,
    },
  })
}

// 가상계좌 입금 완료 처리
async function handleVirtualAccountDeposited(data: {
  paymentKey: string
  orderId: string
  status: string
  totalAmount: number
}) {
  const { orderId, totalAmount } = data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      supplier: true,
    },
  })

  if (!order) {
    console.error('주문을 찾을 수 없습니다:', orderId)
    return
  }

  // 주문 상태 업데이트
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      updatedAt: new Date(),
    },
  })

  // 주문 로그 기록
  await prisma.orderLog.create({
    data: {
      orderId: orderId,
      status: 'paid',
      note: `가상계좌 입금 완료 (${totalAmount}원)`,
    },
  })

  // 알림 생성
  await Promise.all([
    // 구매자에게
    prisma.notification.create({
      data: {
        userId: order.buyerId,
        type: 'order_update',
        title: '입금이 확인되었습니다',
        message: '가상계좌 입금이 확인되어 결제가 완료되었습니다.',
        link: `/buyer/orders/${orderId}`,
      },
    }),
    // 공급자에게
    prisma.notification.create({
      data: {
        userId: order.supplierId,
        type: 'order_update',
        title: '새 주문이 결제되었습니다',
        message: `${order.buyer.companyName}의 주문이 결제 완료되었습니다.`,
        link: `/supplier/orders/${orderId}`,
      },
    }),
  ])
}

// 결제 취소 처리
async function handlePaymentCanceled(data: {
  paymentKey: string
  orderId: string
  cancelReason: string
}) {
  const { orderId, cancelReason } = data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    console.error('주문을 찾을 수 없습니다:', orderId)
    return
  }

  // 이미 취소 상태면 무시
  if (order.status === 'cancelled') {
    return
  }

  // 주문 상태 업데이트
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      updatedAt: new Date(),
    },
  })

  // 주문 로그 기록
  await prisma.orderLog.create({
    data: {
      orderId: orderId,
      status: 'cancelled',
      note: `웹훅 결제 취소: ${cancelReason}`,
    },
  })
}

// 결제 상태 변경 처리
async function handlePaymentStatusChanged(data: {
  paymentKey: string
  orderId: string
  status: string
}) {
  const { orderId, status } = data

  console.log(`주문 ${orderId} 상태 변경: ${status}`)

  // 상태에 따른 처리 추가 가능
}
