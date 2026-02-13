import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 명세표 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            productAmount: true,
            totalAmount: true,
            commissionAmount: true,
            createdAt: true,
            rfq: {
              select: {
                id: true,
                title: true,
                category: true,
                quantity: true,
                unit: true,
                deliveryDate: true,
                deliveryAddress: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            businessNumber: true,
            representativeName: true,
            address: true,
            storeAddress: true,
            fax: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            businessNumber: true,
            representativeName: true,
            address: true,
            storeAddress: true,
            fax: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: '명세표를 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인: 해당 거래의 구매자/공급자/관리자만 조회 가능
    const userId = session.user.id
    const role = session.user.role
    if (role !== 'admin' && invoice.buyerId !== userId && invoice.supplierId !== userId) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('명세표 상세 조회 오류:', error)
    return NextResponse.json({ error: '명세표 조회에 실패했습니다' }, { status: 500 })
  }
}
