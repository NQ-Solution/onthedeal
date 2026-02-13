import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 공지사항 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 })
    }

    // 비관리자가 미발행 공지에 접근하는 경우
    const session = await getServerSession(authOptions)
    if (!announcement.isPublished && session?.user?.role !== 'admin') {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 })
    }

    // 조회수 증가
    await prisma.announcement.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      announcement: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        isPinned: announcement.isPinned,
        isPublished: announcement.isPublished,
        viewCount: announcement.viewCount + 1,
        publishedAt: announcement.publishedAt?.toISOString() || null,
        createdAt: announcement.createdAt.toISOString(),
        updatedAt: announcement.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Announcement GET error:', error)
    return NextResponse.json({ error: '공지사항 조회에 실패했습니다' }, { status: 500 })
  }
}

// PATCH - 공지사항 수정 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { title, content, category, isPinned, isPublished } = body

    const existing = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 })
    }

    const wasPublished = existing.isPublished
    const nowPublished = isPublished !== undefined ? isPublished : existing.isPublished

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished
      if (isPublished && !existing.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    })

    // 새로 발행된 경우 알림 전송
    if (!wasPublished && nowPublished) {
      await sendAnnouncementNotifications(announcement.id, announcement.title)
    }

    return NextResponse.json({
      success: true,
      announcement: {
        id: announcement.id,
        title: announcement.title,
        category: announcement.category,
        isPublished: announcement.isPublished,
        updatedAt: announcement.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Announcement PATCH error:', error)
    return NextResponse.json({ error: '공지사항 수정에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 공지사항 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { id } = params

    const existing = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: '공지사항을 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: '공지사항이 삭제되었습니다' })
  } catch (error) {
    console.error('Announcement DELETE error:', error)
    return NextResponse.json({ error: '공지사항 삭제에 실패했습니다' }, { status: 500 })
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
