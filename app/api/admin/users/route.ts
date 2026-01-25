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
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}

    if (status) {
      where.approvalStatus = status
    }

    if (role) {
      where.role = role
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        phone: true,
        address: true,
        approvalStatus: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
        _count: {
          select: {
            rfqs: true,
            buyerOrders: true,
            supplierOrders: true,
          }
        }
      }
    })

    // 통계
    const stats = {
      total: await prisma.user.count(),
      pending: await prisma.user.count({ where: { approvalStatus: 'pending' } }),
      approved: await prisma.user.count({ where: { approvalStatus: 'approved' } }),
      buyers: await prisma.user.count({ where: { role: 'buyer' } }),
      suppliers: await prisma.user.count({ where: { role: 'supplier' } }),
    }

    return NextResponse.json({ users, stats })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, rejectionReason } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedById: session.user.id,
        }
      })
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
      }
      await prisma.user.update({
        where: { id: userId },
        data: {
          approvalStatus: 'rejected',
          rejectionReason,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
