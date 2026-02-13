import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST - 명세표 발행
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId가 필요합니다' }, { status: 400 })
    }

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        buyer: {
          select: {
            id: true,
            companyName: true,
          },
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
          },
        },
        invoice: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 확인
    const userId = session.user.id
    const role = session.user.role
    if (role !== 'admin' && order.buyerId !== userId && order.supplierId !== userId) {
      return NextResponse.json({ error: '권한이 없습니다' }, { status: 403 })
    }

    // 완료/확인된 주문만 명세표 발행 가능
    if (!['confirmed', 'completed', 'delivered'].includes(order.status)) {
      return NextResponse.json({ error: '완료된 주문에 대해서만 명세표를 발행할 수 있습니다' }, { status: 400 })
    }

    // 이미 명세표가 있는지 확인
    if (order.invoice) {
      return NextResponse.json({ error: '이미 명세표가 발행되었습니다', invoice: order.invoice }, { status: 409 })
    }

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

    // 연속거래 여부 확인: 같은 구매자-공급자 간 이전 완료된 주문이 있는지
    const previousOrderCount = await prisma.order.count({
      where: {
        buyerId: order.buyerId,
        supplierId: order.supplierId,
        id: { not: order.id },
        status: { in: ['confirmed', 'completed', 'delivered'] },
      },
    })
    const isRepeatTrade = previousOrderCount > 0

    // 수수료 정보 가져오기
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
        unitPrice: order.quote.unitPrice,
        amount: item.quantity ? item.quantity * order.quote.unitPrice : order.quote.totalPrice,
      }))
    } else {
      items = [{
        name: order.rfq.title,
        unit: order.rfq.unit,
        quantity: order.rfq.quantity,
        unitPrice: order.quote.unitPrice,
        amount: order.quote.totalPrice,
      }]
    }

    // 명세표 생성
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
      include: {
        buyer: {
          select: {
            companyName: true,
          },
        },
        supplier: {
          select: {
            companyName: true,
          },
        },
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('명세표 발행 오류:', error)
    return NextResponse.json({ error: '명세표 발행에 실패했습니다' }, { status: 500 })
  }
}
