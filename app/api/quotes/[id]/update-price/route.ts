import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// PATCH - 제안 금액 수정 (채팅 중 협상)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const quoteId = params.id
    const body = await request.json()
    const { newTotalPrice } = body

    if (!newTotalPrice || newTotalPrice <= 0) {
      return NextResponse.json({ error: '올바른 금액을 입력해주세요' }, { status: 400 })
    }

    // 제안 조회
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        rfq: true,
        chatRooms: {
          where: { status: 'active' },
          take: 1,
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: '제안을 찾을 수 없습니다' }, { status: 404 })
    }

    // 공급자 또는 구매자만 수정 가능
    const isSupplier = quote.supplierId === session.user.id
    const isBuyer = quote.rfq.buyerId === session.user.id

    if (!isSupplier && !isBuyer) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 이미 수락된 제안은 수정 불가
    if (quote.status === 'accepted') {
      return NextResponse.json({ error: '이미 수락된 제안은 수정할 수 없습니다' }, { status: 400 })
    }

    const oldTotalPrice = quote.totalPrice
    const priceDifference = newTotalPrice - oldTotalPrice
    let additionalCredit = 0

    // 금액이 증가한 경우 추가 크레딧 차감 (공급자에게)
    if (priceDifference > 0) {
      additionalCredit = Math.round(priceDifference * 0.03)

      // 공급자 크레딧 확인
      const credit = await prisma.credit.findUnique({
        where: { supplierId: quote.supplierId },
      })

      if (!credit || credit.balance < additionalCredit) {
        return NextResponse.json({
          error: '공급자의 크레딧이 부족합니다',
          required: additionalCredit,
          current: credit?.balance || 0,
        }, { status: 400 })
      }

      // 트랜잭션으로 금액 수정 + 크레딧 차감
      await prisma.$transaction(async (tx) => {
        // 1. 제안 금액 수정
        const newUnitPrice = Math.round(newTotalPrice / quote.rfq.quantity)
        await tx.quote.update({
          where: { id: quoteId },
          data: {
            unitPrice: newUnitPrice,
            totalPrice: newTotalPrice,
          },
        })

        // 2. 추가 크레딧 차감
        const newBalance = credit.balance - additionalCredit
        await tx.credit.update({
          where: { supplierId: quote.supplierId },
          data: { balance: newBalance },
        })

        // 3. 크레딧 로그 생성
        await tx.creditLog.create({
          data: {
            supplierId: quote.supplierId,
            amount: -additionalCredit,
            type: 'use',
            description: `금액 수정 추가 차감 (${oldTotalPrice.toLocaleString()}원 → ${newTotalPrice.toLocaleString()}원)`,
            referenceId: quoteId,
            balanceAfter: newBalance,
          },
        })

        // 4. 채팅방에 시스템 메시지 추가 (선택적)
        if (quote.chatRooms[0]) {
          await tx.chatMessage.create({
            data: {
              chatRoomId: quote.chatRooms[0].id,
              senderId: session.user.id,
              content: `💰 금액이 수정되었습니다: ${oldTotalPrice.toLocaleString()}원 → ${newTotalPrice.toLocaleString()}원`,
            },
          })
        }
      })
    } else {
      // 금액이 감소하거나 동일한 경우 - 크레딧 환불 없음, 금액만 수정
      const newUnitPrice = Math.round(newTotalPrice / quote.rfq.quantity)
      await prisma.quote.update({
        where: { id: quoteId },
        data: {
          unitPrice: newUnitPrice,
          totalPrice: newTotalPrice,
        },
      })

      // 채팅방에 시스템 메시지 추가
      if (quote.chatRooms[0]) {
        await prisma.chatMessage.create({
          data: {
            chatRoomId: quote.chatRooms[0].id,
            senderId: session.user.id,
            content: `💰 금액이 수정되었습니다: ${oldTotalPrice.toLocaleString()}원 → ${newTotalPrice.toLocaleString()}원`,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: '금액이 수정되었습니다',
      oldPrice: oldTotalPrice,
      newPrice: newTotalPrice,
      additionalCredit,
    })
  } catch (error) {
    console.error('Error updating quote price:', error)
    return NextResponse.json({ error: '금액 수정에 실패했습니다' }, { status: 500 })
  }
}
