import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - 크레딧 충전 요청 (입금 완료 신청)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // 공급자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyName: true },
    })

    if (user?.role !== 'supplier') {
      return NextResponse.json({ error: '공급자만 충전 요청 가능합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { amount } = body

    // 금액 검증
    if (!amount || typeof amount !== 'number' || amount < 100000) {
      return NextResponse.json({ error: '최소 충전 금액은 100,000원입니다' }, { status: 400 })
    }

    if (amount > 10000000) {
      return NextResponse.json({ error: '1회 최대 충전 금액은 10,000,000원입니다' }, { status: 400 })
    }

    // 이미 대기 중인 동일 금액 요청이 있는지 확인
    const existingPending = await prisma.creditCharge.findFirst({
      where: {
        supplierId: session.user.id,
        amount,
        status: 'pending',
      },
    })

    if (existingPending) {
      return NextResponse.json({
        error: '동일 금액의 대기 중인 요청이 있습니다',
        existingRequest: existingPending,
      }, { status: 400 })
    }

    // 충전 요청 생성
    const chargeRequest = await prisma.creditCharge.create({
      data: {
        supplierId: session.user.id,
        amount,
        status: 'pending',
        paymentMethod: 'bank_transfer',
      },
    })

    // 관리자에게 알림 생성 (모든 관리자에게)
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        type: 'system',
        title: '크레딧 충전 요청',
        message: `${user.companyName}에서 ${amount.toLocaleString()}원 충전 요청이 있습니다.`,
        link: '/admin/credits',
      })),
    })

    return NextResponse.json({
      success: true,
      message: '충전 요청이 접수되었습니다. 입금 확인 후 크레딧이 충전됩니다.',
      request: chargeRequest,
    })
  } catch (error) {
    console.error('크레딧 충전 요청 오류:', error)
    return NextResponse.json({ error: '충전 요청에 실패했습니다' }, { status: 500 })
  }
}

// GET - 내 충전 요청 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const requests = await prisma.creditCharge.findMany({
      where: { supplierId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('충전 요청 조회 오류:', error)
    return NextResponse.json({ error: '조회에 실패했습니다' }, { status: 500 })
  }
}
