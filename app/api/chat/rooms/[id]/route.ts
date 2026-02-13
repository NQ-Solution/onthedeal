import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - 채팅방 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const roomId = params.id

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            category: true,
            quantity: true,
            unit: true,
            description: true,
            deliveryDate: true,
            deliveryAddress: true,
            referenceImages: true,
          },
        },
        quote: {
          select: {
            id: true,
            unitPrice: true,
            totalPrice: true,
            deliveryDate: true,
            status: true,
            note: true,
            attachments: true,
          },
        },
        buyer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
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
        orders: {
          select: {
            id: true,
            status: true,
            productAmount: true,
            commissionAmount: true,
            totalAmount: true,
            invoice: {
              select: {
                id: true,
                invoiceNumber: true,
                status: true,
              },
            },
          },
          take: 1,
        },
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 참여자만 조회 가능
    if (chatRoom.buyerId !== session.user.id && chatRoom.supplierId !== session.user.id) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    const order = chatRoom.orders?.[0] || null

    return NextResponse.json({
      id: chatRoom.id,
      status: chatRoom.status,
      createdAt: chatRoom.createdAt.toISOString(),
      expiresAt: chatRoom.expiresAt.toISOString(),
      dealConfirmedAt: chatRoom.dealConfirmedAt?.toISOString() || null,
      rfq: chatRoom.rfq,
      quote: chatRoom.quote,
      buyer: chatRoom.buyer,
      supplier: chatRoom.supplier,
      currentUserId: session.user.id,
      currentUserRole: session.user.role,
      orderId: order?.id || null,
      orderStatus: order?.status || null,
      orderSummary: order ? {
        productAmount: order.productAmount,
        commissionAmount: order.commissionAmount,
        totalAmount: order.totalAmount,
      } : null,
      invoice: order?.invoice || null,
    })
  } catch (error) {
    console.error('Error fetching chat room:', error)
    return NextResponse.json(
      { error: '채팅방 정보를 불러오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST - 거래 상태 변경 (입금요청, 입금확인, 납품완료)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const roomId = params.id
    const body = await request.json()
    const { action } = body

    const validActions = ['confirm_deal', 'request_payment', 'confirm_payment', 'complete_delivery', 'start_shipping', 'confirm_receipt']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: {
        quote: true,
        rfq: true,
        buyer: { select: { companyName: true } },
        supplier: { select: { companyName: true } },
      },
    })

    if (!chatRoom) {
      return NextResponse.json({ error: '채팅방을 찾을 수 없습니다' }, { status: 404 })
    }

    // 권한 및 상태 검증
    const isBuyer = chatRoom.buyerId === session.user.id
    const isSupplier = chatRoom.supplierId === session.user.id

    if (!isBuyer && !isSupplier) {
      return NextResponse.json({ error: '접근 권한이 없습니다' }, { status: 403 })
    }

    // 액션별 처리
    switch (action) {
      // 기존 거래 확정 (하위 호환성 유지)
      case 'confirm_deal':
        return handleConfirmDeal(chatRoom, session.user.id, isBuyer)

      // 구매자: 입금 확인 요청
      case 'request_payment':
        if (!isBuyer) {
          return NextResponse.json({ error: '구매자만 입금 확인을 요청할 수 있습니다' }, { status: 403 })
        }
        // deal_confirmed (제안 수락 후) 또는 active 상태에서 입금 요청 가능
        if (chatRoom.status !== 'active' && chatRoom.status !== 'deal_confirmed') {
          return NextResponse.json({ error: '거래 확정 후에만 입금 요청이 가능합니다' }, { status: 400 })
        }
        return handleRequestPayment(chatRoom)

      // 판매자: 입금 확인 완료
      case 'confirm_payment':
        if (!isSupplier) {
          return NextResponse.json({ error: '판매자만 입금을 확인할 수 있습니다' }, { status: 403 })
        }
        if (chatRoom.status !== 'payment_requested') {
          return NextResponse.json({ error: '입금 요청 상태에서만 확인이 가능합니다' }, { status: 400 })
        }
        return handleConfirmPayment(chatRoom)

      // 판매자: 배송 시작
      case 'start_shipping':
        if (!isSupplier) {
          return NextResponse.json({ error: '판매자만 배송 시작을 처리할 수 있습니다' }, { status: 403 })
        }
        if (chatRoom.status !== 'payment_confirmed') {
          return NextResponse.json({ error: '입금 확인 후에만 배송 시작이 가능합니다' }, { status: 400 })
        }
        return handleStartShipping(chatRoom)

      // 판매자: 납품 완료
      case 'complete_delivery':
        if (!isSupplier) {
          return NextResponse.json({ error: '판매자만 납품 완료를 처리할 수 있습니다' }, { status: 403 })
        }
        // 입금 확인 완료 후에만 납품 완료 가능
        if (chatRoom.status !== 'payment_confirmed') {
          return NextResponse.json({ error: '입금 확인 후에만 납품 완료가 가능합니다' }, { status: 400 })
        }
        return handleCompleteDelivery(chatRoom)

      // 구매자: 수령 확인
      case 'confirm_receipt':
        if (!isBuyer) {
          return NextResponse.json({ error: '구매자만 수령 확인을 할 수 있습니다' }, { status: 403 })
        }
        if (chatRoom.status !== 'delivery_completed') {
          return NextResponse.json({ error: '납품 완료 후에만 수령 확인이 가능합니다' }, { status: 400 })
        }
        return handleConfirmReceipt(chatRoom)

      default:
        return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing chat room action:', error)
    return NextResponse.json(
      { error: '처리에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// 기존 거래 확정 핸들러 (하위 호환성)
async function handleConfirmDeal(chatRoom: any, userId: string, isBuyer: boolean) {
  if (!isBuyer) {
    return NextResponse.json({ error: '구매자만 거래를 확정할 수 있습니다' }, { status: 403 })
  }

  if (chatRoom.status === 'deal_confirmed' || chatRoom.status === 'delivery_completed') {
    return NextResponse.json({ error: '이미 확정된 거래입니다' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedRoom = await tx.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        status: 'deal_confirmed',
        dealConfirmedAt: new Date(),
      },
    })

    const existingOrder = await tx.order.findFirst({
      where: { chatRoomId: chatRoom.id },
    })

    if (!existingOrder && chatRoom.quote) {
      await tx.order.create({
        data: {
          chatRoomId: chatRoom.id,
          rfqId: chatRoom.rfqId,
          quoteId: chatRoom.quoteId!,
          buyerId: chatRoom.buyerId,
          supplierId: chatRoom.supplierId,
          status: 'preparing',
          productAmount: chatRoom.quote.totalPrice,
          totalAmount: chatRoom.quote.totalPrice,
          commissionAmount: Math.round(chatRoom.quote.totalPrice * ((chatRoom.quote.commissionRate ?? 3.0) / 100)),
          supplierFee: Math.round(chatRoom.quote.totalPrice * ((chatRoom.quote.commissionRate ?? 3.0) / 100)),
          paymentMethod: 'direct',
        },
      })
    }

    await tx.notification.create({
      data: {
        userId: chatRoom.supplierId,
        type: 'deal_confirmed',
        title: '거래가 확정되었습니다',
        message: `"${chatRoom.rfq?.title}" 거래가 확정되었습니다. 배송을 준비해주세요.`,
        link: '/supplier/orders',
      },
    })

    return updatedRoom
  })

  return NextResponse.json({
    success: true,
    message: '거래가 확정되었습니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
      dealConfirmedAt: result.dealConfirmedAt?.toISOString(),
    },
  })
}

// 구매자: 입금 확인 요청
async function handleRequestPayment(chatRoom: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 채팅방 상태 업데이트
    const updatedRoom = await tx.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        status: 'payment_requested',
      },
    })

    // 주문 생성 또는 업데이트
    let order = await tx.order.findFirst({
      where: { chatRoomId: chatRoom.id },
    })

    if (!order && chatRoom.quote) {
      order = await tx.order.create({
        data: {
          chatRoomId: chatRoom.id,
          rfqId: chatRoom.rfqId,
          quoteId: chatRoom.quoteId!,
          buyerId: chatRoom.buyerId,
          supplierId: chatRoom.supplierId,
          status: 'payment_pending',
          productAmount: chatRoom.quote.totalPrice,
          totalAmount: chatRoom.quote.totalPrice,
          commissionAmount: Math.round(chatRoom.quote.totalPrice * ((chatRoom.quote.commissionRate ?? 3.0) / 100)),
          supplierFee: Math.round(chatRoom.quote.totalPrice * ((chatRoom.quote.commissionRate ?? 3.0) / 100)),
          paymentMethod: 'direct',
        },
      })
    } else if (order) {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'payment_pending' },
      })
    }

    // 시스템 메시지 생성
    await tx.chatMessage.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: chatRoom.buyerId,
        senderType: 'system',
        senderName: '시스템',
        content: `${chatRoom.buyer?.companyName}님이 입금 확인을 요청했습니다.`,
      },
    })

    // 판매자에게 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.supplierId,
        type: 'payment_request',
        title: '입금 확인 요청',
        message: `"${chatRoom.rfq?.title}" 거래에서 구매자가 입금 확인을 요청했습니다.`,
        link: `/chat/${chatRoom.id}`,
      },
    })

    return updatedRoom
  })

  return NextResponse.json({
    success: true,
    message: '입금 확인 요청이 완료되었습니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
    },
  })
}

// 판매자: 입금 확인 완료
async function handleConfirmPayment(chatRoom: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 채팅방 상태 업데이트
    const updatedRoom = await tx.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        status: 'payment_confirmed',
      },
    })

    // 주문 상태 업데이트
    await tx.order.updateMany({
      where: { chatRoomId: chatRoom.id },
      data: { status: 'preparing' },
    })

    // 시스템 메시지 생성
    await tx.chatMessage.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: chatRoom.supplierId,
        senderType: 'system',
        senderName: '시스템',
        content: `${chatRoom.supplier?.companyName}님이 입금을 확인했습니다. 납품이 진행됩니다.`,
      },
    })

    // 구매자에게 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.buyerId,
        type: 'payment_confirmed',
        title: '입금 확인 완료',
        message: `"${chatRoom.rfq?.title}" 거래에서 판매자가 입금을 확인했습니다. 납품이 진행됩니다.`,
        link: `/chat/${chatRoom.id}`,
      },
    })

    return updatedRoom
  })

  return NextResponse.json({
    success: true,
    message: '입금 확인이 완료되었습니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
    },
  })
}

// 판매자: 납품 완료
async function handleCompleteDelivery(chatRoom: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 채팅방 상태 업데이트
    const updatedRoom = await tx.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        status: 'delivery_completed',
      },
    })

    // 주문 상태: delivered (수령 확인 대기)
    await tx.order.updateMany({
      where: { chatRoomId: chatRoom.id },
      data: { status: 'delivered' },
    })

    // 시스템 메시지 생성
    await tx.chatMessage.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: chatRoom.supplierId,
        senderType: 'system',
        senderName: '시스템',
        content: `${chatRoom.supplier?.companyName}님이 납품을 완료했습니다. 구매자의 수령 확인을 기다리고 있습니다.`,
      },
    })

    // 구매자에게 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.buyerId,
        type: 'delivery_completed',
        title: '납품 완료',
        message: `"${chatRoom.rfq?.title}" 납품이 완료되었습니다. 수령 확인을 해주세요.`,
        link: `/buyer/orders`,
      },
    })

    // 판매자에게 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.supplierId,
        type: 'delivery_completed',
        title: '납품 완료',
        message: `"${chatRoom.rfq?.title}" 납품이 완료되었습니다. 구매자의 수령 확인을 기다리고 있습니다.`,
        link: `/supplier/orders`,
      },
    })

    return updatedRoom
  })

  return NextResponse.json({
    success: true,
    message: '납품이 완료되었습니다. 구매자의 수령 확인을 기다립니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
    },
  })
}

// 판매자: 배송 시작
async function handleStartShipping(chatRoom: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 주문 상태: preparing → shipping
    await tx.order.updateMany({
      where: { chatRoomId: chatRoom.id },
      data: { status: 'shipping' },
    })

    // 시스템 메시지 생성
    await tx.chatMessage.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: chatRoom.supplierId,
        senderType: 'system',
        senderName: '시스템',
        content: `배송이 시작되었습니다.`,
      },
    })

    // 구매자에게 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.buyerId,
        type: 'order_update',
        title: '배송 시작',
        message: `"${chatRoom.rfq?.title}" 배송이 시작되었습니다.`,
        link: `/buyer/orders`,
      },
    })

    return chatRoom
  })

  return NextResponse.json({
    success: true,
    message: '배송이 시작되었습니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
    },
  })
}

// 구매자: 수령 확인
async function handleConfirmReceipt(chatRoom: any) {
  const result = await prisma.$transaction(async (tx) => {
    // 채팅방 상태: delivery_completed → closed
    const updatedRoom = await tx.chatRoom.update({
      where: { id: chatRoom.id },
      data: {
        status: 'closed',
      },
    })

    // 주문 상태: delivered → confirmed
    const orders = await tx.order.findMany({
      where: { chatRoomId: chatRoom.id },
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

    await tx.order.updateMany({
      where: { chatRoomId: chatRoom.id },
      data: { status: 'confirmed' },
    })

    // 시스템 메시지 생성
    await tx.chatMessage.create({
      data: {
        chatRoomId: chatRoom.id,
        senderId: chatRoom.buyerId,
        senderType: 'system',
        senderName: '시스템',
        content: `${chatRoom.buyer?.companyName}님이 수령을 확인했습니다. 거래가 완료되었습니다.`,
      },
    })

    // 명세표 자동 생성
    for (const order of orders) {
      if (order.invoice) continue

      try {
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
        const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

        const todayCount = await tx.invoice.count({
          where: {
            createdAt: { gte: dayStart, lt: dayEnd },
          },
        })
        const seqNumber = String(todayCount + 1).padStart(4, '0')
        const invoiceNumber = `INV-${dateStr}-${seqNumber}`

        const previousOrderCount = await tx.order.count({
          where: {
            buyerId: order.buyerId,
            supplierId: order.supplierId,
            id: { not: order.id },
            status: { in: ['confirmed', 'completed', 'delivered'] },
          },
        })
        const isRepeatTrade = previousOrderCount > 0

        const settings = await tx.siteSettings.findUnique({
          where: { id: 'default' },
        })
        const commissionRate = isRepeatTrade
          ? (settings?.repeatTradeCommissionRate ?? 1.0)
          : (settings?.firstTradeCommissionRate ?? 3.0)

        const productAmount = order.productAmount
        const commissionAmount = order.commissionAmount || Math.round(productAmount * commissionRate / 100)
        const totalAmount = order.totalAmount

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

        const invoice = await tx.invoice.create({
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
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'invoice_issued',
            title: '명세표 발행',
            message: `"${chatRoom.rfq?.title}" 거래 명세표가 발행되었습니다.`,
            link: `/invoices/${invoice.id}`,
          },
        })

        // 명세표 발행 알림 (공급자)
        await tx.notification.create({
          data: {
            userId: order.supplierId,
            type: 'invoice_issued',
            title: '명세표 발행',
            message: `"${chatRoom.rfq?.title}" 거래 명세표가 발행되었습니다.`,
            link: `/invoices/${invoice.id}`,
          },
        })
      } catch (invoiceError) {
        console.error('명세표 자동 발행 오류:', invoiceError)
      }
    }

    // 양쪽에 거래 완료 알림
    await tx.notification.create({
      data: {
        userId: chatRoom.buyerId,
        type: 'deal_completed',
        title: '거래 완료',
        message: `"${chatRoom.rfq?.title}" 거래가 완료되었습니다.`,
        link: `/buyer/orders`,
      },
    })

    await tx.notification.create({
      data: {
        userId: chatRoom.supplierId,
        type: 'deal_completed',
        title: '거래 완료',
        message: `"${chatRoom.rfq?.title}" 거래가 완료되었습니다.`,
        link: `/supplier/orders`,
      },
    })

    return updatedRoom
  })

  return NextResponse.json({
    success: true,
    message: '수령 확인이 완료되었습니다. 거래가 완료되었습니다.',
    chatRoom: {
      id: result.id,
      status: result.status,
    },
  })
}
