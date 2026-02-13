import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
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
        quote: {
          select: {
            id: true,
            unitPrice: true,
            totalPrice: true,
            deliveryDate: true,
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            bankName: true,
            bankAccount: true,
            bankHolder: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인: 해당 주문의 구매자/공급자/관리자만 조회 가능
    const userId = session.user.id
    const role = session.user.role
    if (role !== 'admin' && order.buyerId !== userId && order.supplierId !== userId) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('주문 상세 조회 오류:', error)
    return NextResponse.json({ error: '주문 조회에 실패했습니다' }, { status: 500 })
  }
}

// PATCH - 주문 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: '상태값이 필요합니다' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        rfq: {
          select: {
            title: true,
            category: true,
            quantity: true,
            unit: true,
            items: true,
          },
        },
        quote: {
          select: {
            unitPrice: true,
            totalPrice: true,
          },
        },
        invoice: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    const userId = session.user.id
    const role = session.user.role

    // 권한 및 상태 전환 검증
    if (role === 'buyer') {
      // 구매자: 배송완료 -> 수령확인만 가능
      if (order.buyerId !== userId) {
        return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
      }
      if (order.status !== 'delivered' || status !== 'confirmed') {
        return NextResponse.json({ error: '수령 확인만 가능합니다' }, { status: 400 })
      }
    } else if (role === 'supplier') {
      // 공급자: 배송준비→배송중, 배송중→배송완료 가능
      if (order.supplierId !== userId) {
        return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
      }
      const allowedTransitions = [
        { from: 'preparing', to: 'shipping' },
        { from: 'shipping', to: 'delivered' },
      ]
      const isAllowed = allowedTransitions.some(t => t.from === order.status && t.to === status)
      if (!isAllowed) {
        return NextResponse.json({ error: '허용되지 않는 상태 전환입니다' }, { status: 400 })
      }
    } else if (role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // 상태 변경 알림 생성
    const statusMessages: Record<string, string> = {
      shipping: '배송이 시작되었습니다',
      delivered: '납품이 완료되었습니다',
      confirmed: '구매자가 수령을 확인했습니다',
    }

    const message = statusMessages[status]
    if (message) {
      // 상대방에게 알림
      const notifyUserId = role === 'buyer' ? order.supplierId : order.buyerId
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'order_update',
          title: '주문 상태 변경',
          message: `"${order.rfq?.title}" 주문: ${message}`,
          link: role === 'buyer' ? '/supplier/orders' : '/buyer/orders',
        },
      })
    }

    // 주문이 confirmed 또는 completed로 변경되면 명세표 자동 발행
    if (['confirmed', 'completed'].includes(status) && !order.invoice) {
      try {
        // 명세표 번호 생성: INV-YYYYMMDD-XXXX
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const todayCount = await prisma.invoice.count({
          where: {
            createdAt: {
              gte: dayStart,
              lt: dayEnd,
            },
          },
        })
        const seqNumber = String(todayCount + 1).padStart(4, '0')
        const invoiceNumber = `INV-${dateStr}-${seqNumber}`

        // 연속거래 여부 확인
        const previousOrderCount = await prisma.order.count({
          where: {
            buyerId: order.buyerId,
            supplierId: order.supplierId,
            id: { not: order.id },
            status: { in: ['confirmed', 'completed', 'delivered'] },
          },
        })
        const isRepeatTrade = previousOrderCount > 0

        // 수수료 정보
        const settings = await prisma.siteSettings.findUnique({
          where: { id: 'default' },
        })
        const commissionRate = isRepeatTrade
          ? (settings?.repeatTradeCommissionRate ?? 1.0)
          : (settings?.firstTradeCommissionRate ?? 3.0)

        const productAmount = order.productAmount
        const commissionAmount = order.commissionAmount || Math.round(productAmount * commissionRate / 100)
        const totalAmount = order.totalAmount

        // 품목 데이터 구성
        const rfqItems = order.rfq.items as any[] | null
        let items
        if (rfqItems && Array.isArray(rfqItems) && rfqItems.length > 0) {
          items = rfqItems.map((item: any) => ({
            name: item.name || order.rfq.title,
            unit: item.unit || order.rfq.unit,
            quantity: item.quantity || order.rfq.quantity,
            unitPrice: order.quote!.unitPrice,
            amount: item.quantity ? item.quantity * order.quote!.unitPrice : order.quote!.totalPrice,
          }))
        } else {
          items = [{
            name: order.rfq.title,
            unit: order.rfq.unit,
            quantity: order.rfq.quantity,
            unitPrice: order.quote!.unitPrice,
            amount: order.quote!.totalPrice,
          }]
        }

        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
            orderId: order.id,
            buyerId: order.buyerId,
            supplierId: order.supplierId,
            items,
            productAmount,
            commissionRate,
            commissionAmount,
            totalAmount,
            isRepeatTrade,
            status: 'issued',
          },
        })

        // 명세표 발행 알림 (구매자)
        await prisma.notification.create({
          data: {
            userId: order.buyerId,
            type: 'invoice_issued',
            title: '명세표 발행',
            message: `"${order.rfq?.title}" 거래 명세표가 발행되었습니다.`,
            link: `/invoices/${invoice.id}`,
          },
        })

        // 명세표 발행 알림 (공급자)
        await prisma.notification.create({
          data: {
            userId: order.supplierId,
            type: 'invoice_issued',
            title: '명세표 발행',
            message: `"${order.rfq?.title}" 거래 명세표가 발행되었습니다.`,
            link: `/invoices/${invoice.id}`,
          },
        })
      } catch (invoiceError) {
        // 명세표 발행 실패는 주문 상태 변경을 롤백하지 않음 (로그만 남김)
        console.error('명세표 자동 발행 오류:', invoiceError)
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('주문 상태 업데이트 오류:', error)
    return NextResponse.json({ error: '주문 상태 업데이트에 실패했습니다' }, { status: 500 })
  }
}
