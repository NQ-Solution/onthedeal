import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 공급자 크레딧 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'supplier') {
      return NextResponse.json({ error: '공급자만 접근 가능합니다' }, { status: 403 })
    }

    // 크레딧 조회 (없으면 생성)
    let credit = await prisma.credit.findUnique({
      where: { supplierId: session.user.id },
    })

    if (!credit) {
      credit = await prisma.credit.create({
        data: {
          supplierId: session.user.id,
          balance: 0,
        },
      })
    }

    // 크레딧 로그 조회
    const logs = await prisma.creditLog.findMany({
      where: { supplierId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      balance: credit.balance,
      logs,
    })
  } catch (error) {
    console.error('Credit GET error:', error)
    return NextResponse.json({ error: '크레딧 조회에 실패했습니다' }, { status: 500 })
  }
}
