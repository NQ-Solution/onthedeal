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

    const chatRooms = await prisma.chatRoom.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: { select: { title: true } },
        buyer: { select: { companyName: true } },
        supplier: { select: { companyName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true }
        },
        _count: { select: { messages: true } }
      }
    })

    const stats = {
      total: await prisma.chatRoom.count(),
      active: await prisma.chatRoom.count({ where: { status: 'active' } }),
      dealConfirmed: await prisma.chatRoom.count({ where: { status: 'deal_confirmed' } }),
      totalMessages: await prisma.chatMessage.count()
    }

    return NextResponse.json({ chatRooms, stats })
  } catch (error) {
    console.error('Admin chats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatId = request.nextUrl.searchParams.get('id')
    if (!chatId) {
      return NextResponse.json({ error: 'Missing chat ID' }, { status: 400 })
    }

    await prisma.chatRoom.delete({ where: { id: chatId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin chat delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
