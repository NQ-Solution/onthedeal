import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 만료된 채팅방 처리 및 크레딧 환불
// 이 API는 cron job으로 주기적으로 호출되어야 합니다
// Vercel Cron 또는 외부 cron 서비스 사용 권장
export async function GET(request: NextRequest) {
  // 간단한 인증 (프로덕션에서는 더 강력한 인증 필요)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'default-cron-secret'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // 만료된 active 상태의 채팅방 조회
    const expiredChatRooms = await prisma.chatRoom.findMany({
      where: {
        status: 'active',
        expiresAt: {
          lt: now,
        },
      },
      include: {
        quote: {
          include: {
            rfq: {
              select: {
                id: true,
                title: true,
                budgetMin: true,
              },
            },
          },
        },
      },
    })

    let processedCount = 0
    let refundedAmount = 0

    for (const chatRoom of expiredChatRooms) {
      const quote = chatRoom.quote

      // pending 상태의 제안만 환불 처리
      if (quote.status === 'pending') {
        // 선차감된 금액 계산 (제안 제출 시 totalPrice 기준으로 차감되었으므로 동일하게 계산)
        const refundAmount = Math.round(quote.totalPrice * ((quote.commissionRate ?? 3.0) / 100))

        await prisma.$transaction(async (tx) => {
          // 1. 채팅방 상태 업데이트
          await tx.chatRoom.update({
            where: { id: chatRoom.id },
            data: { status: 'expired' },
          })

          // 2. 제안 상태 업데이트
          await tx.quote.update({
            where: { id: quote.id },
            data: { status: 'expired' },
          })

          // 3. 공급자 크레딧 환불
          const credit = await tx.credit.findUnique({
            where: { supplierId: quote.supplierId },
          })

          if (credit) {
            const newBalance = credit.balance + refundAmount
            await tx.credit.update({
              where: { supplierId: quote.supplierId },
              data: { balance: newBalance },
            })

            // 4. 크레딧 로그 생성
            await tx.creditLog.create({
              data: {
                supplierId: quote.supplierId,
                amount: refundAmount,
                type: 'refund',
                description: `채팅 만료 환불 (${quote.rfq.title})`,
                referenceId: quote.id,
                balanceAfter: newBalance,
              },
            })

            // 5. 알림 생성 - 공급자에게
            await tx.notification.create({
              data: {
                userId: quote.supplierId,
                type: 'chat_expired',
                title: '채팅방이 만료되었습니다',
                message: `"${quote.rfq.title}" 채팅방이 만료되어 선차감 크레딧 ${refundAmount.toLocaleString()}원이 환불되었습니다.`,
                link: '/supplier/credits',
              },
            })

            // 6. 알림 생성 - 구매자에게
            await tx.notification.create({
              data: {
                userId: chatRoom.buyerId,
                type: 'chat_expired',
                title: '채팅방이 만료되었습니다',
                message: `"${quote.rfq.title}" 채팅방이 만료되었습니다. 새로운 공급자의 제안을 확인해보세요.`,
                link: '/buyer/rfqs',
              },
            })
          }

          refundedAmount += refundAmount
        })

        processedCount++
      } else {
        // pending이 아닌 경우 채팅방만 만료 처리
        await prisma.chatRoom.update({
          where: { id: chatRoom.id },
          data: { status: 'expired' },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${processedCount}개의 만료된 채팅방 처리 완료`,
      data: {
        processedCount,
        refundedAmount,
        totalExpiredRooms: expiredChatRooms.length,
      },
    })
  } catch (error) {
    console.error('Error processing expired chats:', error)
    return NextResponse.json(
      { error: '만료된 채팅방 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST도 동일하게 처리 (일부 cron 서비스는 POST 사용)
export async function POST(request: NextRequest) {
  return GET(request)
}
