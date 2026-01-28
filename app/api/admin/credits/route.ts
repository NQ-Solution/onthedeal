import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// 공급자 목록 및 최근 충전 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 공급자 목록 (크레딧 포함)
    const suppliers = await prisma.user.findMany({
      where: {
        role: 'supplier',
        approvalStatus: 'approved',
      },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactName: true,
        credit: {
          select: {
            balance: true,
          }
        }
      },
      orderBy: { companyName: 'asc' },
    })

    // 최근 충전 내역 (관리자가 충전한 것만)
    const recentLogs = await prisma.creditLog.findMany({
      where: {
        type: 'charge',
        description: {
          contains: '관리자',
        }
      },
      include: {
        supplier: {
          select: {
            companyName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ suppliers, recentLogs })
  } catch (error) {
    console.error('Admin credits error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 크레딧 충전 (관리자)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { supplierId, amount, description } = body

    if (!supplierId || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // 공급자 확인
    const supplier = await prisma.user.findUnique({
      where: { id: supplierId },
      select: { role: true, companyName: true },
    })

    if (!supplier || supplier.role !== 'supplier') {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    // 트랜잭션으로 크레딧 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 기존 크레딧 조회 또는 생성
      let credit = await tx.credit.findUnique({
        where: { supplierId },
      })

      if (!credit) {
        credit = await tx.credit.create({
          data: {
            supplierId,
            balance: 0,
          },
        })
      }

      const newBalance = credit.balance + amount

      // 크레딧 업데이트
      const updatedCredit = await tx.credit.update({
        where: { supplierId },
        data: { balance: newBalance },
      })

      // 크레딧 로그 생성
      const log = await tx.creditLog.create({
        data: {
          supplierId,
          amount,
          type: 'charge',
          description: `[관리자 충전] ${description}`,
          balanceAfter: newBalance,
        },
      })

      // 공급자에게 알림 생성
      await tx.notification.create({
        data: {
          userId: supplierId,
          type: 'system',
          title: '크레딧 충전 완료',
          message: `관리자에 의해 ${amount.toLocaleString()}원이 충전되었습니다. 현재 잔액: ${newBalance.toLocaleString()}원`,
          link: '/supplier/credits',
        },
      })

      return { credit: updatedCredit, log }
    })

    return NextResponse.json({
      success: true,
      message: `${supplier.companyName}에 ${amount.toLocaleString()}원 크레딧이 충전되었습니다.`,
      balance: result.credit.balance,
    })
  } catch (error) {
    console.error('Admin credit charge error:', error)
    return NextResponse.json({ error: 'Failed to charge credit' }, { status: 500 })
  }
}
