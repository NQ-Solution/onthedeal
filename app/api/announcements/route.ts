import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 공지사항 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isAdmin = session?.user?.role === 'admin'
    const status = searchParams.get('status') || '' // admin only: published, draft

    // 기본 조건: 비관리자는 발행된 공지만
    const where: any = {}

    if (!isAdmin) {
      where.isPublished = true
    } else if (status === 'published') {
      where.isPublished = true
    } else if (status === 'draft') {
      where.isPublished = false
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' }
    }

    if (category) {
      where.category = category
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.announcement.count({ where }),
    ])

    return NextResponse.json({
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        category: a.category,
        isPinned: a.isPinned,
        isPublished: a.isPublished,
        viewCount: a.viewCount,
        publishedAt: a.publishedAt?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Announcements GET error:', error)
    return NextResponse.json({ error: '공지사항 조회에 실패했습니다' }, { status: 500 })
  }
}

// POST - 공지사항 생성 (관리자 전용)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, category, isPinned, isPublished } = body

    if (!title || !content) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요' }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category: category || 'general',
        isPinned: isPinned || false,
        isPublished: isPublished || false,
        authorId: session.user.id,
        publishedAt: isPublished ? new Date() : null,
      },
    })

    // 발행 시 모든 사용자에게 알림 전송
    if (isPublished) {
      await sendAnnouncementNotifications(announcement.id, announcement.title)
    }

    return NextResponse.json({
      success: true,
      announcement: {
        id: announcement.id,
        title: announcement.title,
        category: announcement.category,
        isPublished: announcement.isPublished,
        createdAt: announcement.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Announcements POST error:', error)
    return NextResponse.json({ error: '공지사항 생성에 실패했습니다' }, { status: 500 })
  }
}

// 모든 사용자에게 공지사항 알림 전송
async function sendAnnouncementNotifications(announcementId: string, title: string) {
  try {
    const users = await prisma.user.findMany({
      where: { approvalStatus: 'approved' },
      select: { id: true },
    })

    if (users.length === 0) return

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: 'announcement' as const,
        title: '새 공지사항',
        message: title,
        link: `/announcements/${announcementId}`,
      })),
    })
  } catch (error) {
    console.error('Failed to send announcement notifications:', error)
  }
}
