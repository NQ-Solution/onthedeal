import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

// DELETE - 회원 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // 자기 자신은 삭제 불가
    if (id === session.user.id) {
      return NextResponse.json({ error: '자기 자신은 삭제할 수 없습니다.' }, { status: 400 })
    }

    // 관련 데이터 삭제 (cascade로 처리되지 않는 것들)
    await prisma.$transaction(async (tx) => {
      // 1. 먼저 관련 주문 ID 조회
      const orders = await tx.order.findMany({
        where: { OR: [{ buyerId: id }, { supplierId: id }] },
        select: { id: true }
      })
      const orderIds = orders.map(o => o.id)

      // 2. 주문 로그 삭제
      if (orderIds.length > 0) {
        await tx.orderLog.deleteMany({ where: { orderId: { in: orderIds } } })
      }

      // 3. 주문 삭제
      await tx.order.deleteMany({ where: { OR: [{ buyerId: id }, { supplierId: id }] } })

      // 4. 채팅 메시지 삭제 (채팅방 ID 기반)
      const chatRooms = await tx.chatRoom.findMany({
        where: { OR: [{ buyerId: id }, { supplierId: id }] },
        select: { id: true }
      })
      const chatRoomIds = chatRooms.map(c => c.id)
      if (chatRoomIds.length > 0) {
        await tx.chatMessage.deleteMany({ where: { chatRoomId: { in: chatRoomIds } } })
      }

      // 5. 채팅방 삭제
      await tx.chatRoom.deleteMany({ where: { OR: [{ buyerId: id }, { supplierId: id }] } })

      // 6. 제안 삭제
      await tx.quote.deleteMany({ where: { supplierId: id } })

      // 7. RFQ 삭제
      await tx.rFQ.deleteMany({ where: { buyerId: id } })

      // 8. 크레딧 관련 삭제
      await tx.creditLog.deleteMany({ where: { supplierId: id } })
      await tx.credit.deleteMany({ where: { supplierId: id } })
      await tx.creditCharge.deleteMany({ where: { supplierId: id } })

      // 9. 공급자 계좌 삭제
      await tx.supplierAccount.deleteMany({ where: { supplierId: id } })

      // 10. 알림 삭제
      await tx.notification.deleteMany({ where: { userId: id } })

      // 11. 사용자 삭제
      await tx.user.delete({ where: { id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json({ error: '회원 삭제 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

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
