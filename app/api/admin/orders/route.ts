import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { rfq: { title: { contains: search, mode: 'insensitive' } } },
        { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
        { supplier: { companyName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: { select: { title: true } },
        buyer: { select: { companyName: true } },
        supplier: { select: { companyName: true } },
      }
    })

    const stats = {
      total: await prisma.order.count(),
      pending: await prisma.order.count({ where: { status: { in: ['pending', 'paid', 'preparing', 'shipping'] } } }),
      completed: await prisma.order.count({ where: { status: 'completed' } }),
      totalRevenue: await prisma.order.aggregate({
        where: { status: 'completed' },
        _sum: { commissionAmount: true }
      })
    }

    return NextResponse.json({ orders, stats })
  } catch (error) {
    console.error('Admin orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, status } = await request.json()
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 유효한 주문 상태값 검증
    const validStatuses = ['pending', 'paid', 'preparing', 'shipping', 'delivered', 'confirmed', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin order update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
