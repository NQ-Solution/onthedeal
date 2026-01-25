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

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { buyer: { companyName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            companyName: true,
            email: true,
          }
        },
        _count: {
          select: {
            quotes: true,
          }
        }
      }
    })

    // 통계
    const stats = {
      total: await prisma.rFQ.count(),
      open: await prisma.rFQ.count({ where: { status: 'open' } }),
      inProgress: await prisma.rFQ.count({ where: { status: 'in_progress' } }),
      closed: await prisma.rFQ.count({ where: { status: 'closed' } }),
      totalQuotes: await prisma.quote.count(),
    }

    return NextResponse.json({ rfqs, stats })
  } catch (error) {
    console.error('Admin RFQs error:', error)
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
    const { rfqId, status } = body

    if (!rfqId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin RFQ update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const rfqId = searchParams.get('id')

    if (!rfqId) {
      return NextResponse.json({ error: 'Missing RFQ ID' }, { status: 400 })
    }

    await prisma.rFQ.delete({
      where: { id: rfqId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin RFQ delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
