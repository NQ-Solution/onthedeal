import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 크레딧 잔액 및 내역 조회
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: '공급자만 접근 가능합니다' }, { status: 403 })
    }

    // 크레딧 잔액 조회
    const credit = await prisma.credit.findUnique({
      where: { supplierId: session.user.id },
    })

    // 크레딧 로그 조회 (최근 50건)
    const logs = await prisma.creditLog.findMany({
      where: { supplierId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      balance: credit?.balance || 0,
      logs,
    })
  } catch (error) {
    console.error('크레딧 조회 오류:', error)
    return NextResponse.json({ error: '크레딧 조회에 실패했습니다' }, { status: 500 })
  }
}
