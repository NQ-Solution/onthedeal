import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크
    const clientIp = getClientIp(request)
    const rateLimitResult = checkRateLimit(`register:${clientIp}`, RATE_LIMITS.register)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers: rateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const {
      email,
      password,
      role,
      companyName,
      businessNumber,
      representativeName,
      businessType,
      businessCategory,
      contactName,
      phone,
      fax,
      postalCode,
      storeAddress,
      storeDetailAddress,
      website,
      introduction,
    } = body

    // 필수 필드 검증
    if (!email || !password || !companyName || !contactName || !phone) {
      return NextResponse.json(
        { error: '필수 정보를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 역할 검증 - admin 역할 등록 방지
    if (role && role !== 'buyer' && role !== 'supplier') {
      return NextResponse.json(
        { error: '올바른 역할을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 비밀번호 강도 검증
    const passwordErrors: string[] = []

    if (password.length < 8) {
      passwordErrors.push('8자 이상')
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push('대문자 포함')
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push('소문자 포함')
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push('숫자 포함')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordErrors.push('특수문자 포함')
    }

    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: `비밀번호 요구사항: ${passwordErrors.join(', ')}` },
        { status: 400 }
      )
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'buyer',
        companyName,
        businessNumber,
        representativeName,
        businessType,
        businessCategory,
        contactName,
        phone,
        fax,
        postalCode,
        storeAddress,
        storeDetailAddress,
        website,
        introduction,
        approvalStatus: 'pending',
      },
    })

    // 공급자인 경우 크레딧 계정 생성
    if (role === 'supplier') {
      await prisma.credit.create({
        data: {
          supplierId: user.id,
          balance: 0,
        },
      })
    }

    return NextResponse.json({
      message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',
      userId: user.id,
    })
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
