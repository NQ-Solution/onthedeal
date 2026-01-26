import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cancelPayment } from '@/lib/toss-payments'

// 결제 취소 API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, cancelReason, cancelAmount } = body

    if (!orderId || !cancelReason) {
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
      },
    })

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인 (구매자 또는 관리자만 취소 가능)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (order.buyerId !== session.user.id && user?.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 취소 가능 상태 확인
    if (!['paid', 'preparing'].includes(order.status)) {
      return NextResponse.json(
        { error: '취소할 수 없는 주문 상태입니다' },
        { status: 400 }
      )
    }

    // paymentKey 조회 (실제로는 DB에 저장해야 함)
    // TODO: Order 모델에 paymentKey 필드 추가 필요
    const paymentKey = body.paymentKey

    if (!paymentKey) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다' },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 취소
    const cancelResult = await cancelPayment(paymentKey, cancelReason, cancelAmount)

    if (cancelResult.status === 'CANCELED' || cancelResult.status === 'PARTIAL_CANCELED') {
      // 취소 성공 - 주문 상태 업데이트
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
          note: `결제 취소: ${cancelReason}`,
        },
      })

      // 공급자 크레딧 환불 (수수료 반환)
      if (order.supplierFee && order.supplierFee > 0) {
        const supplierCredit = await prisma.credit.findUnique({
          where: { supplierId: order.supplierId },
        })

        if (supplierCredit) {
          await prisma.$transaction([
            prisma.credit.update({
              where: { supplierId: order.supplierId },
              data: { balance: { increment: order.supplierFee } },
            }),
            prisma.creditLog.create({
              data: {
                supplierId: order.supplierId,
                amount: order.supplierFee,
                type: 'refund',
                description: `주문 취소 환불 (주문번호: ${orderId.slice(0, 8)})`,
                referenceId: orderId,
                balanceAfter: supplierCredit.balance + order.supplierFee,
              },
            }),
          ])
        }
      }

      // 알림 생성
      await Promise.all([
        // 구매자에게
        prisma.notification.create({
          data: {
            userId: order.buyerId,
            type: 'order_update',
            title: '주문이 취소되었습니다',
            message: `주문이 취소되었습니다. 취소 사유: ${cancelReason}`,
            link: `/buyer/orders/${orderId}`,
          },
        }),
        // 공급자에게
        prisma.notification.create({
          data: {
            userId: order.supplierId,
            type: 'order_update',
            title: '주문이 취소되었습니다',
            message: `${order.buyer.companyName}의 주문이 취소되었습니다.`,
            link: `/supplier/orders/${orderId}`,
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        message: '결제가 취소되었습니다',
        data: {
          orderId: orderId,
          cancelAmount: cancelResult.balanceAmount,
          canceledAt: new Date().toISOString(),
        },
      })
    } else {
      return NextResponse.json(
        { error: '결제 취소 상태가 올바르지 않습니다', status: cancelResult.status },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('결제 취소 오류:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 취소에 실패했습니다' },
      { status: 500 }
    )
  }
}
