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

    // 실시간 알림 데이터 조회
    const [pendingUsers, pendingInquiries, recentOrders, recentRFQs] = await Promise.all([
      // 승인 대기 회원
      prisma.user.findMany({
        where: { approvalStatus: 'pending' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          companyName: true,
          createdAt: true,
        }
      }),
      // 미답변 문의
      prisma.inquiry.findMany({
        where: { status: 'pending' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          subject: true,
          createdAt: true,
        }
      }),
      // 최근 주문
      prisma.order.findMany({
        where: { status: { in: ['pending', 'paid'] } },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          rfq: { select: { title: true } }
        }
      }),
      // 최근 발주
      prisma.rFQ.findMany({
        where: { status: 'open' },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
        }
      })
    ])

    // 알림 형태로 변환
    const notifications: Array<{
      id: string
      type: 'user' | 'inquiry' | 'order' | 'rfq'
      message: string
      createdAt: string
      link: string
    }> = []

    // 승인 대기 회원
    pendingUsers.forEach(user => {
      notifications.push({
        id: `user-${user.id}`,
        type: 'user',
        message: `새로운 회원가입: ${user.companyName}`,
        createdAt: user.createdAt.toISOString(),
        link: '/admin/users?status=pending'
      })
    })

    // 미답변 문의
    pendingInquiries.forEach(inquiry => {
      notifications.push({
        id: `inquiry-${inquiry.id}`,
        type: 'inquiry',
        message: `새로운 문의: ${inquiry.subject}`,
        createdAt: inquiry.createdAt.toISOString(),
        link: '/admin/inquiries?status=pending'
      })
    })

    // 처리 대기 주문
    recentOrders.forEach(order => {
      const statusLabel = order.status === 'pending' ? '대기' : '결제완료'
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        message: `주문 ${statusLabel}: ${order.rfq.title}`,
        createdAt: order.createdAt.toISOString(),
        link: '/admin/orders'
      })
    })

    // 시간순 정렬
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 총 알림 수
    const totalCount = pendingUsers.length + pendingInquiries.length

    return NextResponse.json({
      notifications: notifications.slice(0, 5),
      totalCount,
    })
  } catch (error) {
    console.error('Admin notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
