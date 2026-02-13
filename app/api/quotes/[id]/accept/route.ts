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
      return NextResponse.json({ error: '해당 견적을 수락할 권한이 없습니다' }, { status: 403 })
    }

    // 이미 수락된 견적인지 확인
    if (quote.status === 'accepted') {
      return NextResponse.json({ error: '이미 수락된 견적입니다' }, { status: 400 })
    }

    // 크레딧은 제안 제출 시 이미 선차감되었으므로, 여기서는 차감하지 않음
    // 제안 제출 시 저장된 수수료율 사용
    const commissionRate = (quote.commissionRate ?? 3.0) / 100
    const commissionAmount = Math.round(quote.totalPrice * commissionRate)

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 견적 상태 업데이트
      const updatedQuote = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
        },
      })

      // 2. RFQ 상태 업데이트 (closed)
      await tx.rFQ.update({
        where: { id: quote.rfqId },
        data: { status: 'closed' },
      })

      // 3. 다른 견적들 rejected 처리 + 해당 공급자들 크레딧 환불
      const rejectedQuotes = await tx.quote.findMany({
        where: {
          rfqId: quote.rfqId,
          id: { not: quoteId },
          status: 'pending',
        },
      })

      await tx.quote.updateMany({
        where: {
          rfqId: quote.rfqId,
          id: { not: quoteId },
          status: 'pending',
        },
        data: { status: 'rejected' },
      })

      // 3-1. 거절된 제안의 공급자들에게 크레딧 환불 + 채팅방 만료 처리
      for (const rejectedQuote of rejectedQuotes) {
        // 선차감된 금액 계산 (제안 제출 시 totalPrice 기준으로 차감되었으므로 동일하게 계산)
        const rfq = await tx.rFQ.findUnique({ where: { id: rejectedQuote.rfqId } })
        const refundAmount = Math.round(rejectedQuote.totalPrice * ((rejectedQuote.commissionRate ?? 3.0) / 100))

        const credit = await tx.credit.findUnique({
          where: { supplierId: rejectedQuote.supplierId },
        })

        if (credit) {
          const newBalance = credit.balance + refundAmount
          await tx.credit.update({
            where: { supplierId: rejectedQuote.supplierId },
            data: { balance: newBalance },
          })

          await tx.creditLog.create({
            data: {
              supplierId: rejectedQuote.supplierId,
              amount: refundAmount,
              type: 'refund',
              description: `제안 미선정 환불 (${rfq?.title})`,
              referenceId: rejectedQuote.id,
              balanceAfter: newBalance,
            },
          })

          await tx.notification.create({
            data: {
              userId: rejectedQuote.supplierId,
              type: 'system',
              title: '크레딧 환불',
              message: `"${rfq?.title}" 발주에서 다른 공급자가 선정되어 선차감 크레딧 ${refundAmount.toLocaleString()}원이 환불되었습니다.`,
              link: '/supplier/credits',
            },
          })
        }

        // 거절된 제안의 채팅방 만료 처리
        await tx.chatRoom.updateMany({
          where: {
            quoteId: rejectedQuote.id,
            status: 'active',
          },
          data: {
            status: 'expired',
            expiresAt: new Date(), // 즉시 만료
          },
        })
      }

      // 4. 채팅방 조회 (제안 제출 시 이미 생성됨)
      // quoteId에 @unique 제약조건이 있으므로 findUnique 사용
      let chatRoom = await tx.chatRoom.findUnique({
        where: { quoteId: quoteId },
      })

      if (chatRoom) {
        // 기존 채팅방 상태를 deal_confirmed로 업데이트
        chatRoom = await tx.chatRoom.update({
          where: { id: chatRoom.id },
          data: {
            status: 'deal_confirmed',
            dealConfirmedAt: new Date(),
          },
        })
      } else {
        // 예외 케이스: 채팅방이 없으면 새로 생성 (정상적인 경우 제안 제출 시 이미 생성됨)
        console.warn('[Accept API] ChatRoom not found for quote, creating new one:', quoteId)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        chatRoom = await tx.chatRoom.create({
          data: {
            rfqId: quote.rfqId,
            quoteId: quoteId,
            buyerId: session.user.id,
            supplierId: quote.supplierId,
            status: 'deal_confirmed',
            dealConfirmedAt: new Date(),
            expiresAt: expiresAt,
          },
        })
      }

      // 5. 주문 생성 (크레딧은 이미 제안 시 차감됨)
      const order = await tx.order.create({
        data: {
          chatRoomId: chatRoom.id,
          rfqId: quote.rfqId,
          quoteId: quoteId,
          buyerId: session.user.id,
          supplierId: quote.supplierId,
          status: 'preparing', // 즉시 배송준비 상태로 (에스크로 없음)
          productAmount: quote.totalPrice,
          totalAmount: quote.totalPrice,
          commissionAmount: commissionAmount,
          supplierFee: commissionAmount,
          paymentMethod: 'direct', // 계좌이체 직접 결제
        },
      })

      // 6. 알림 생성 - 공급자에게 (견적 수락)
      await tx.notification.create({
        data: {
          userId: quote.supplierId,
          type: 'deal_confirmed',
          title: '제안이 수락되었습니다',
          message: `"${quote.rfq.title}" 제안이 수락되었습니다. 배송을 준비해주세요.`,
          link: `/supplier/orders`,
        },
      })

      // 7. 알림 생성 - 구매자에게 (견적 수락 확인)
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'deal_confirmed',
          title: '제안 수락 완료',
          message: `${quote.supplier.companyName}의 제안을 수락했습니다. 공급자가 배송을 준비합니다.`,
          link: `/buyer/orders`,
        },
      })

      return { quote: updatedQuote, chatRoom, order }
    })

    return NextResponse.json({
      success: true,
      message: '제안이 수락되었습니다.',
      data: {
        quote: { id: quoteId, status: 'accepted' },
        chatRoom: {
          id: result.chatRoom.id,
          quoteId: quoteId,
        },
        order: {
          id: result.order.id,
          totalAmount: result.order.totalAmount,
        },
        commission: {
          amount: commissionAmount,
          rate: `${(quote.commissionRate ?? 3.0)}%`,
          note: '제안 제출 시 이미 선차감됨',
        },
      },
    })
  } catch (error) {
    console.error('Error accepting quote:', error)
    return NextResponse.json(
      { error: '제안 수락에 실패했습니다.' },
      { status: 500 }
    )
  }
}
