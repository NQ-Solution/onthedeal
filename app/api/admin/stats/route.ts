import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 통계 데이터 조회
    const [
      totalUsers,
      pendingUsers,
      buyerCount,
      supplierCount,
      totalRFQs,
      openRFQs,
      totalQuotes,
      totalOrders,
      completedOrders,
      pendingInquiries,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { approvalStatus: 'pending' } }),
      prisma.user.count({ where: { role: 'buyer' } }),
      prisma.user.count({ where: { role: 'supplier' } }),
      prisma.rFQ.count(),
      prisma.rFQ.count({ where: { status: 'open' } }),
      prisma.quote.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.inquiry.count({ where: { status: 'pending' } }),
    ])

    // 오늘 가입한 사용자 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } }
    })

    // 최근 활동 (최근 가입, RFQ, 주문 등)
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
      }
    })

    const recentRFQs = await prisma.rFQ.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      }
    })

    // 승인 대기 회원 목록
    const pendingApprovals = await prisma.user.findMany({
      where: { approvalStatus: 'pending' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        pendingUsers,
        buyerCount,
        supplierCount,
        newUsersToday,
        totalRFQs,
        openRFQs,
        totalQuotes,
        totalOrders,
        completedOrders,
        pendingInquiries,
      },
      recentUsers,
      recentRFQs,
      pendingApprovals,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
