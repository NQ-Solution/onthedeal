import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// RFQ 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        quotes: {
          select: {
            id: true,
            supplierId: true,
          },
        },
      },
    })

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ를 찾을 수 없습니다' }, { status: 404 })
    }

    // 타겟팅된 RFQ 접근 제어: 타겟 공급자 또는 구매자만 조회 가능
    if (rfq.isTargeted && rfq.targetSupplierId) {
      const isTargetSupplier = rfq.targetSupplierId === session.user.id
      const isBuyer = rfq.buyerId === session.user.id
      const isAdmin = session.user.role === 'admin'

      if (!isTargetSupplier && !isBuyer && !isAdmin) {
        return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
      }
    }

    // 조회수 증가 (본인 발주가 아닌 경우만)
    if (rfq.buyerId !== session.user.id) {
      await prisma.rFQ.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json(rfq)
  } catch (error) {
    console.error('RFQ 상세 조회 오류:', error)
    return NextResponse.json({ error: 'RFQ 조회에 실패했습니다' }, { status: 500 })
  }
}

// RFQ 수정 (구매자 본인만)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
    })

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ를 찾을 수 없습니다' }, { status: 404 })
    }

    if (rfq.buyerId !== session.user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()

    const updatedRfq = await prisma.rFQ.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        quantity: body.quantity,
        unit: body.unit,
        desiredPrice: body.desiredPrice,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
        deliveryAddress: body.deliveryAddress,
      },
    })

    return NextResponse.json(updatedRfq)
  } catch (error) {
    console.error('RFQ 수정 오류:', error)
    return NextResponse.json({ error: 'RFQ 수정에 실패했습니다' }, { status: 500 })
  }
}

// RFQ 삭제 또는 상태 변경
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: params.id },
    })

    if (!rfq) {
      return NextResponse.json({ error: 'RFQ를 찾을 수 없습니다' }, { status: 404 })
    }

    if (rfq.buyerId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: '삭제 권한이 없습니다' }, { status: 403 })
    }

    // 실제 삭제 대신 상태를 cancelled로 변경
    await prisma.rFQ.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true, message: 'RFQ가 취소되었습니다' })
  } catch (error) {
    console.error('RFQ 삭제 오류:', error)
    return NextResponse.json({ error: 'RFQ 삭제에 실패했습니다' }, { status: 500 })
  }
}
