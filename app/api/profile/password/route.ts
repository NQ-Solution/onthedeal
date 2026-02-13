import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

// PUT - 비밀번호 변경
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요' }, { status: 400 })
    }

    // 비밀번호 강도 검증
    const passwordErrors: string[] = []
    if (newPassword.length < 8) passwordErrors.push('8자 이상')
    if (!/[A-Z]/.test(newPassword)) passwordErrors.push('대문자 포함')
    if (!/[a-z]/.test(newPassword)) passwordErrors.push('소문자 포함')
    if (!/[0-9]/.test(newPassword)) passwordErrors.push('숫자 포함')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) passwordErrors.push('특수문자 포함')

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: `비밀번호 요구사항: ${passwordErrors.join(', ')}` },
        { status: 400 }
      )
    }

    // 현재 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: '현재 비밀번호가 올바르지 않습니다' }, { status: 400 })
    }

    // 새 비밀번호와 기존 비밀번호가 같은지 확인
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json({ error: '새 비밀번호는 현재 비밀번호와 달라야 합니다' }, { status: 400 })
    }

    // 새 비밀번호 해싱 후 저장
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: '비밀번호가 성공적으로 변경되었습니다' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: '비밀번호 변경에 실패했습니다' }, { status: 500 })
  }
}
