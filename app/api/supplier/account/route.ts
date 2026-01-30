import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 공급자 계좌 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'supplier') {
      return NextResponse.json({ error: '공급자만 접근 가능합니다' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        bankName: true,
        bankAccount: true,
        bankHolder: true,
      },
    })

    return NextResponse.json({
      bankName: user?.bankName || '',
      accountNumber: user?.bankAccount || '',
      accountHolder: user?.bankHolder || '',
    })
  } catch (error) {
    console.error('Account GET error:', error)
    return NextResponse.json({ error: '계좌 정보 조회에 실패했습니다' }, { status: 500 })
  }
}

// PUT - 공급자 계좌 정보 저장
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    if (session.user.role !== 'supplier') {
      return NextResponse.json({ error: '공급자만 접근 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { bankName, accountNumber, accountHolder } = body

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bankName: bankName || null,
        bankAccount: accountNumber || null,
        bankHolder: accountHolder || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account PUT error:', error)
    return NextResponse.json({ error: '계좌 정보 저장에 실패했습니다' }, { status: 500 })
  }
}
