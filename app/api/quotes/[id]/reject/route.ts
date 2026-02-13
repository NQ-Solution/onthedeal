import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const quoteId = params.id

    // 견적 조회
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: {
          select: {
            id: true,
            buyerId: true,
            title: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: '견적을 찾을 수 없습니다' }, { status: 404 })
    }

    // 구매자 확인
    if (quote.rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: '해당 견적을 거절할 권한이 없습니다' }, { status: 403 })
    }

    // 이미 처리된 견적인지 확인
    if (quote.status !== 'pending') {
      return NextResponse.json({ error: '이미 처리된 견적입니다' }, { status: 400 })
    }

    // 선차감된 금액 계산 (제안 제출 시 totalPrice 기준으로 차감되었으므로 동일하게 계산)
    const refundAmount = Math.round(quote.totalPrice * ((quote.commissionRate ?? 3.0) / 100))

    // 트랜잭션으로 처리
    await prisma.$transaction(async (tx) => {
      // 1. 견적 상태 업데이트
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'rejected' },
      })

      // 2. 공급자 크레딧 환불
      const credit = await tx.credit.findUnique({
        where: { supplierId: quote.supplierId },
      })

      if (credit) {
        const newBalance = credit.balance + refundAmount
        await tx.credit.update({
          where: { supplierId: quote.supplierId },
          data: { balance: newBalance },
        })

        // 3. 크레딧 로그 생성
        await tx.creditLog.create({
          data: {
            supplierId: quote.supplierId,
            amount: refundAmount,
            type: 'refund',
            description: `제안 거절 환불 (${quote.rfq.title})`,
            referenceId: quoteId,
            balanceAfter: newBalance,
          },
        })
      }

      // 4. 채팅방이 있으면 상태 업데이트
      const chatRoom = await tx.chatRoom.findFirst({
        where: { quoteId: quoteId },
      })

      if (chatRoom) {
        await tx.chatRoom.update({
          where: { id: chatRoom.id },
          data: { status: 'closed' },
        })
      }

      // 5. 알림 생성 - 공급자에게
      await tx.notification.create({
        data: {
          userId: quote.supplierId,
          type: 'system',
          title: '제안이 거절되었습니다',
          message: `"${quote.rfq.title}" 제안이 거절되었습니다. 선차감 크레딧 ${refundAmount.toLocaleString()}원이 환불되었습니다.`,
          link: '/supplier/credits',
        },
      })
    })

    return NextResponse.json({
      success: true,
      message: '제안이 거절되었습니다.',
      data: {
        quoteId,
        refundAmount,
      },
    })
  } catch (error) {
    console.error('Error rejecting quote:', error)
    return NextResponse.json(
      { error: '제안 거절에 실패했습니다.' },
      { status: 500 }
    )
  }
}
