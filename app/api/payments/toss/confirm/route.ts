import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { confirmPayment } from '@/lib/toss-payments'
import { checkIdempotency, setIdempotencyResult } from '@/lib/idempotency'

// 결제 승인 API
export async function POST(request: NextRequest) {
  try {
    // 멱등성 키 확인 (중복 결제 방지)
    const idempotency = checkIdempotency(request)
    if (idempotency?.cachedResult) {
      return NextResponse.json(idempotency.cachedResult.data, {
        status: idempotency.cachedResult.status,
        headers: { 'X-Idempotency-Key': idempotency.key },
      })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentKey, orderId, amount } = body

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 주문 정보 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        supplier: true,
        quote: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 금액 검증
    if (order.totalAmount !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다' },
        { status: 400 }
      )
    }

    // 구매자 본인 확인
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 토스페이먼츠 결제 승인
    const paymentResult = await confirmPayment(paymentKey, orderId, amount)

    if (paymentResult.status === 'DONE') {
      // 결제 성공 - 주문 상태 업데이트 및 paymentKey 저장
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentKey: paymentKey, // 환불/취소 시 필요
          updatedAt: new Date(),
        },
      })

      // 주문 로그 기록
      await prisma.orderLog.create({
        data: {
          orderId: orderId,
          status: 'paid',
          note: `토스페이먼츠 결제 완료 (${paymentResult.method})`,
        },
      })

      // 알림 생성 (공급자에게)
      await prisma.notification.create({
        data: {
          userId: order.supplierId,
          type: 'order_update',
          title: '새 주문이 결제되었습니다',
          message: `${order.buyer.companyName}의 주문이 결제 완료되었습니다.`,
          link: `/supplier/orders/${orderId}`,
        },
      })

      const responseData = {
        success: true,
        message: '결제가 완료되었습니다',
        data: {
          orderId: orderId,
          amount: paymentResult.totalAmount,
          method: paymentResult.method,
          approvedAt: paymentResult.approvedAt,
          receipt: paymentResult.receipt?.url,
        },
      }

      // 멱등성 키가 있으면 결과 캐시
      if (idempotency?.key) {
        setIdempotencyResult(idempotency.key, { data: responseData, status: 200 })
      }

      return NextResponse.json(responseData)
    } else {
      return NextResponse.json(
        { error: '결제 승인 상태가 올바르지 않습니다', status: paymentResult.status },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('결제 승인 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 승인에 실패했습니다' },
      { status: 500 }
    )
  }
}
