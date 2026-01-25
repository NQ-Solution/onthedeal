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
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ]
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const stats = {
      total: await prisma.inquiry.count(),
      pending: await prisma.inquiry.count({ where: { status: 'pending' } }),
      inProgress: await prisma.inquiry.count({ where: { status: 'in_progress' } }),
      resolved: await prisma.inquiry.count({ where: { status: 'resolved' } })
    }

    return NextResponse.json({ inquiries, stats })
  } catch (error) {
    console.error('Admin inquiries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inquiryId, response, status } = await request.json()
    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
    }

    const data: any = {}
    if (status) data.status = status
    if (response) {
      data.response = response
      data.respondedAt = new Date()
      data.respondedBy = session.user.id
      data.status = 'resolved'
    }

    await prisma.inquiry.update({
      where: { id: inquiryId },
      data
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin inquiry update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inquiryId = request.nextUrl.searchParams.get('id')
    if (!inquiryId) {
      return NextResponse.json({ error: 'Missing inquiry ID' }, { status: 400 })
    }

    await prisma.inquiry.delete({ where: { id: inquiryId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin inquiry delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
