import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 명세표 목록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const role = session.user.role

    let whereClause = {}
    if (role === 'buyer') {
      whereClause = { buyerId: userId }
    } else if (role === 'supplier') {
      whereClause = { supplierId: userId }
    }
    // admin: no filter, returns all

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            businessNumber: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            businessNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('명세표 목록 조회 오류:', error)
    return NextResponse.json({ error: '명세표 목록 조회에 실패했습니다' }, { status: 500 })
  }
}
