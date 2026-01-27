import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 현재 사용자 프로필 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        phone: true,
        storeAddress: true,
        approvalStatus: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: '프로필 조회에 실패했습니다' }, { status: 500 })
  }
}

// PUT - 프로필 업데이트
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { contactName, phone, companyName, businessNumber, storeAddress } = body

    // 입력값 검증
    if (contactName && typeof contactName !== 'string') {
      return NextResponse.json({ error: '담당자명이 올바르지 않습니다' }, { status: 400 })
    }

    if (phone && typeof phone !== 'string') {
      return NextResponse.json({ error: '연락처가 올바르지 않습니다' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(contactName !== undefined && { contactName }),
        ...(phone !== undefined && { phone }),
        ...(companyName !== undefined && { companyName }),
        ...(businessNumber !== undefined && { businessNumber }),
        ...(storeAddress !== undefined && { storeAddress }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        companyName: true,
        businessNumber: true,
        contactName: true,
        phone: true,
        storeAddress: true,
        approvalStatus: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: '프로필 업데이트에 실패했습니다' }, { status: 500 })
  }
}
