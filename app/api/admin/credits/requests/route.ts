import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 대기 중인 충전 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.creditCharge.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    })

    // Get supplier info for each request
    const requestsWithSupplier = await Promise.all(
      requests.map(async (req) => {
        const supplier = await prisma.user.findUnique({
          where: { id: req.supplierId },
          select: {
            id: true,
            email: true,
            companyName: true,
            contactName: true,
            credit: { select: { balance: true } },
          },
        })
        return { ...req, supplier }
      })
    )

    return NextResponse.json(requestsWithSupplier)
  } catch (error) {
    console.error('Admin credit requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - 충전 요청 승인/거절
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requestId, action, note } = body

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // 충전 요청 조회
    const chargeRequest = await prisma.creditCharge.findUnique({
      where: { id: requestId },
    })

    if (!chargeRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (chargeRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    const supplier = await prisma.user.findUnique({
      where: { id: chargeRequest.supplierId },
      select: { companyName: true },
    })

    if (action === 'approve') {
      // 승인: 크레딧 충전 + 요청 상태 업데이트
      const result = await prisma.$transaction(async (tx) => {
        // 기존 크레딧 조회 또는 생성
        let credit = await tx.credit.findUnique({
          where: { supplierId: chargeRequest.supplierId },
        })

        if (!credit) {
          credit = await tx.credit.create({
            data: {
              supplierId: chargeRequest.supplierId,
              balance: 0,
            },
          })
        }

        const newBalance = credit.balance + chargeRequest.amount

        // 크레딧 업데이트
        const updatedCredit = await tx.credit.update({
          where: { supplierId: chargeRequest.supplierId },
          data: { balance: newBalance },
        })

        // 크레딧 로그 생성
        await tx.creditLog.create({
          data: {
            supplierId: chargeRequest.supplierId,
            amount: chargeRequest.amount,
            type: 'charge',
            description: `[관리자 승인] 계좌이체 충전${note ? ` - ${note}` : ''}`,
            referenceId: chargeRequest.id,
            balanceAfter: newBalance,
          },
        })

        // 요청 상태 업데이트
        await tx.creditCharge.update({
          where: { id: requestId },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        })

        // 공급자에게 알림
        await tx.notification.create({
          data: {
            userId: chargeRequest.supplierId,
            type: 'system',
            title: '크레딧 충전 완료',
            message: `${chargeRequest.amount.toLocaleString()}원이 충전되었습니다. 현재 잔액: ${newBalance.toLocaleString()}원`,
            link: '/supplier/credits',
          },
        })

        return { updatedCredit }
      })

      return NextResponse.json({
        success: true,
        message: `${supplier?.companyName}에 ${chargeRequest.amount.toLocaleString()}원 충전 완료`,
        balance: result.updatedCredit.balance,
      })
    } else {
      // 거절
      await prisma.$transaction(async (tx) => {
        // 요청 상태 업데이트
        await tx.creditCharge.update({
          where: { id: requestId },
          data: {
            status: 'cancelled',
            completedAt: new Date(),
          },
        })

        // 공급자에게 알림
        await tx.notification.create({
          data: {
            userId: chargeRequest.supplierId,
            type: 'system',
            title: '크레딧 충전 요청 반려',
            message: `${chargeRequest.amount.toLocaleString()}원 충전 요청이 반려되었습니다.${note ? ` 사유: ${note}` : ''}`,
            link: '/supplier/credits',
          },
        })
      })

      return NextResponse.json({
        success: true,
        message: '충전 요청이 반려되었습니다.',
      })
    }
  } catch (error) {
    console.error('Admin credit request process error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
