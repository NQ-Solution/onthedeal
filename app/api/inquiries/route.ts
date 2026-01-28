import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 공개 문의 접수 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, phone, subject, message } = body

    // 필수 필드 검증
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 문의 생성
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'pending',
      },
    })

    // 관리자에게 알림 생성 (관리자 사용자들 조회)
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: 'system' as const,
          title: '새 문의가 접수되었습니다',
          message: `${name}님이 "${subject}" 문의를 접수했습니다.`,
          link: '/admin/inquiries',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: '문의가 접수되었습니다.',
      data: { id: inquiry.id },
    })
  } catch (error) {
    console.error('문의 접수 오류:', error)
    return NextResponse.json(
      { error: '문의 접수에 실패했습니다.' },
      { status: 500 }
    )
  }
}
