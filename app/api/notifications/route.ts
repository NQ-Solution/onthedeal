import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 사용자 알림 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 읽지 않은 알림 수
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        is_read: n.isRead,
        created_at: n.createdAt.toISOString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: '알림 조회에 실패했습니다' }, { status: 500 })
  }
}

// PATCH - 알림 읽음 처리
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAll } = body

    if (markAll) {
      // 모든 알림 읽음 처리
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, message: '모든 알림을 읽음 처리했습니다' })
    }

    if (!notificationId) {
      return NextResponse.json({ error: '알림 ID가 필요합니다' }, { status: 400 })
    }

    // 특정 알림 읽음 처리
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: '알림을 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json({ error: '알림 처리에 실패했습니다' }, { status: 500 })
  }
}

// DELETE - 알림 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')
    const deleteAll = searchParams.get('all') === 'true'

    if (deleteAll) {
      // 모든 알림 삭제
      await prisma.notification.deleteMany({
        where: { userId: session.user.id },
      })

      return NextResponse.json({ success: true, message: '모든 알림을 삭제했습니다' })
    }

    if (!notificationId) {
      return NextResponse.json({ error: '알림 ID가 필요합니다' }, { status: 400 })
    }

    // 특정 알림 삭제
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: '알림을 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notifications DELETE error:', error)
    return NextResponse.json({ error: '알림 삭제에 실패했습니다' }, { status: 500 })
  }
}
