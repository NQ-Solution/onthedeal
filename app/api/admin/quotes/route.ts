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
        { rfq: { buyer: { companyName: { contains: search, mode: 'insensitive' } } } },
        { supplier: { companyName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: {
          select: { title: true, buyer: { select: { companyName: true } } }
        },
        supplier: { select: { companyName: true, email: true } },
      }
    })

    const stats = {
      total: await prisma.quote.count(),
      pending: await prisma.quote.count({ where: { status: 'pending' } }),
      accepted: await prisma.quote.count({ where: { status: 'accepted' } }),
      totalAmount: await prisma.quote.aggregate({ _sum: { totalPrice: true } })
    }

    return NextResponse.json({ quotes, stats })
  } catch (error) {
    console.error('Admin quotes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quoteId = request.nextUrl.searchParams.get('id')
    if (!quoteId) {
      return NextResponse.json({ error: 'Missing quote ID' }, { status: 400 })
    }

    await prisma.quote.delete({ where: { id: quoteId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin quote delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
