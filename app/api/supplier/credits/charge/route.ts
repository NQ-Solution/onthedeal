import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkIdempotency, setIdempotencyResult } from '@/lib/idempotency'

// 크레딧 충전 (PG 연동 전 테스트 모드)
export async function POST(request: NextRequest) {
  try {
    // 멱등성 키 확인 (중복 충전 방지)
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

    // 공급자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'supplier') {
      return NextResponse.json({ error: '공급자만 충전 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { amount } = body

    // 금액 검증
    if (!amount || typeof amount !== 'number' || amount < 100000) {
      return NextResponse.json({ error: '최소 충전 금액은 100,000원입니다' }, { status: 400 })
    }

    if (amount > 10000000) {
      return NextResponse.json({ error: '1회 최대 충전 금액은 10,000,000원입니다' }, { status: 400 })
    }

    // PG 연동 여부 확인 (환경 변수로 체크)
    const isPGConnected = !!(process.env.TOSS_CLIENT_KEY && process.env.TOSS_SECRET_KEY)

    if (!isPGConnected) {
      // 테스트 모드: 실제 결제 없이 크레딧 충전 처리
      // 트랜잭션으로 크레딧 업데이트 및 로그 생성
      const result = await prisma.$transaction(async (tx) => {
        // 기존 크레딧 조회 또는 생성
        let credit = await tx.credit.findUnique({
          where: { supplierId: session.user.id },
        })

        if (!credit) {
          credit = await tx.credit.create({
            data: {
              supplierId: session.user.id,
              balance: 0,
            },
          })
        }

        const newBalance = credit.balance + amount

        // 크레딧 업데이트
        const updatedCredit = await tx.credit.update({
          where: { supplierId: session.user.id },
          data: { balance: newBalance },
        })

        // 크레딧 로그 생성
        const log = await tx.creditLog.create({
          data: {
            supplierId: session.user.id,
            amount: amount,
            type: 'charge',
            description: `[테스트] 크레딧 충전 ${amount.toLocaleString()}원`,
            balanceAfter: newBalance,
          },
        })

        return { credit: updatedCredit, log }
      })

      return NextResponse.json({
        success: true,
        testMode: true,
        message: '테스트 모드로 충전되었습니다. 실제 결제는 PG 연동 후 가능합니다.',
        balance: result.credit.balance,
        chargedAmount: amount,
      })
    }

    // TODO: 실제 PG 연동 시 Toss Payments 결제 처리
    // 1. 클라이언트에서 결제 위젯 호출
    // 2. 결제 성공 후 paymentKey로 결제 승인 요청
    // 3. 승인 성공 시 크레딧 충전

    return NextResponse.json({
      error: 'PG 결제 연동이 필요합니다',
      pgReady: true,
    }, { status: 400 })

  } catch (error) {
    console.error('크레딧 충전 오류:', error)
    return NextResponse.json({ error: '크레딧 충전에 실패했습니다' }, { status: 500 })
  }
}
