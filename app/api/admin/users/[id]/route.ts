import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        // 사업자 정보
        companyName: true,
        businessNumber: true,
        representativeName: true,
        businessType: true,
        businessCategory: true,
        // 담당자 정보
        contactName: true,
        phone: true,
        fax: true,
        // 주소 정보
        postalCode: true,
        storeAddress: true,
        storeDetailAddress: true,
        address: true,
        // 추가 정보
        website: true,
        introduction: true,
        // 이미지
        profileImage: true,
        businessLicenseImage: true,
        storeImages: true,
        // 승인 상태
        approvalStatus: true,
        approvedAt: true,
        rejectionReason: true,
        createdAt: true,
        _count: {
          select: {
            rfqs: true,
            quotes: true,
            buyerOrders: true,
            supplierOrders: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin user detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
