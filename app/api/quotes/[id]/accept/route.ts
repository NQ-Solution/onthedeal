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

    // 공급자 크레딧 확인 (수수료 3%)
    const commissionRate = 0.03
    const commissionAmount = Math.round(quote.totalPrice * commissionRate)

    const supplierCredit = await prisma.credit.findUnique({
      where: { supplierId: quote.supplierId },
    })

    if (!supplierCredit || supplierCredit.balance < commissionAmount) {
      return NextResponse.json({
        error: '판매자의 크레딧이 부족합니다. 거래를 진행할 수 없습니다.',
        requiredCredit: commissionAmount,
        currentCredit: supplierCredit?.balance || 0,
      }, { status: 400 })
    }

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

      // 3. 다른 견적들 rejected 처리
      await tx.quote.updateMany({
        where: {
          rfqId: quote.rfqId,
          id: { not: quoteId },
          status: 'pending',
        },
        data: { status: 'rejected' },
      })

      // 4. 채팅방 생성 또는 조회
      let chatRoom = await tx.chatRoom.findFirst({
        where: { quoteId: quoteId },
      })

      if (!chatRoom) {
        // 채팅방 만료일: 7일 후
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        chatRoom = await tx.chatRoom.create({
          data: {
            rfqId: quote.rfqId,
            quoteId: quoteId,
            buyerId: session.user.id,
            supplierId: quote.supplierId,
            expiresAt: expiresAt,
          },
        })
      }

      // 5. 주문 생성
      const order = await tx.order.create({
        data: {
          chatRoomId: chatRoom.id,
          rfqId: quote.rfqId,
          quoteId: quoteId,
          buyerId: session.user.id,
          supplierId: quote.supplierId,
          status: 'pending',
          productAmount: quote.totalPrice,
          totalAmount: quote.totalPrice,
          commissionAmount: commissionAmount,
          paymentMethod: 'escrow',
        },
      })

      // 6. 크레딧 차감
      const newBalance = supplierCredit.balance - commissionAmount

      await tx.credit.update({
        where: { supplierId: quote.supplierId },
        data: { balance: newBalance },
      })

      // 7. 크레딧 로그 생성
      await tx.creditLog.create({
        data: {
          supplierId: quote.supplierId,
          amount: -commissionAmount,
          type: 'use',
          description: `거래 수수료 (${quote.rfq.title})`,
          balanceAfter: newBalance,
          referenceId: order.id,
        },
      })

      // 8. 알림 생성 - 공급자에게 (견적 수락)
      await tx.notification.create({
        data: {
          userId: quote.supplierId,
          type: 'deal_confirmed',
          title: '견적이 수락되었습니다',
          message: `"${quote.rfq.title}" 견적이 수락되었습니다. 채팅방에서 상세 협의를 진행해주세요.`,
          link: `/chat/${chatRoom.id}`,
        },
      })

      // 9. 알림 생성 - 공급자에게 (수수료 차감)
      await tx.notification.create({
        data: {
          userId: quote.supplierId,
          type: 'system',
          title: '거래 수수료 차감',
          message: `"${quote.rfq.title}" 거래 수수료 ${commissionAmount.toLocaleString()}원이 차감되었습니다.`,
          link: '/supplier/credits',
        },
      })

      // 10. 알림 생성 - 구매자에게 (견적 수락 확인)
      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'deal_confirmed',
          title: '제안 수락 완료',
          message: `${quote.supplier.companyName}의 제안을 수락했습니다. 채팅방에서 상세 협의를 진행하세요.`,
          link: `/chat/${chatRoom.id}`,
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
          rate: '3%',
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
