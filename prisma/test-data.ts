import { PrismaClient, RFQStatus, QuoteStatus, ChatRoomStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 테스트 데이터 생성 시작...')

  // 기존 사용자 찾기
  const buyer = await prisma.user.findFirst({
    where: { role: 'buyer', approvalStatus: 'approved' }
  })

  const supplier = await prisma.user.findFirst({
    where: { role: 'supplier', approvalStatus: 'approved' }
  })

  if (!buyer || !supplier) {
    console.error('❌ 구매자 또는 공급자가 없습니다. 먼저 seed를 실행해주세요.')
    return
  }

  console.log(`  구매자: ${buyer.email}`)
  console.log(`  공급자: ${supplier.email}`)

  // 공급자 크레딧 확인/충전
  let credit = await prisma.credit.findUnique({
    where: { supplierId: supplier.id }
  })

  if (!credit) {
    credit = await prisma.credit.create({
      data: {
        supplierId: supplier.id,
        balance: 500000
      }
    })
  } else if (credit.balance < 100000) {
    credit = await prisma.credit.update({
      where: { supplierId: supplier.id },
      data: { balance: 500000 }
    })
  }
  console.log(`  공급자 크레딧: ${credit.balance.toLocaleString()}원`)

  // 테스트 RFQ 데이터
  const rfqData = [
    {
      title: '한우 등심 20kg 구매',
      category: '육류',
      description: '1++ 등급 한우 등심이 필요합니다. 스테이크 용으로 2cm 두께 슬라이스 가능하신 분 연락주세요.',
      quantity: 20,
      unit: 'kg',
      budgetMin: 800000,
      budgetMax: 1200000,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      deliveryAddress: '서울시 강남구 테헤란로 123',
      status: RFQStatus.open,
      orderSizeRange: '100~300만원',
      orderFrequency: '주 1회',
    },
    {
      title: '돼지 삼겹살 50kg 긴급',
      category: '육류',
      description: '이번 주말 행사용으로 삼겹살이 급히 필요합니다. 국내산 우선, 수입산도 가능.',
      quantity: 50,
      unit: 'kg',
      budgetMin: 400000,
      budgetMax: 600000,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      deliveryAddress: '서울시 마포구 홍대입구역 근처',
      status: RFQStatus.open,
      orderSizeRange: '50~100만원',
      orderFrequency: '월 2회',
    },
    {
      title: '닭가슴살 100kg 정기 거래',
      category: '육류',
      description: '헬스장 운영 중입니다. 매주 닭가슴살 100kg 정기 거래 희망합니다. 장기 거래 가능하신 분.',
      quantity: 100,
      unit: 'kg',
      budgetMin: 500000,
      budgetMax: 700000,
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
      deliveryAddress: '경기도 성남시 분당구',
      status: RFQStatus.open,
      orderSizeRange: '50~100만원',
      orderFrequency: '주 1회',
    },
    {
      title: '소고기 갈비 30kg',
      category: '육류',
      description: 'LA갈비용 소갈비가 필요합니다. 미국산 또는 호주산.',
      quantity: 30,
      unit: 'kg',
      budgetMin: 600000,
      budgetMax: 900000,
      deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10일 후
      deliveryAddress: '서울시 송파구 잠실동',
      status: RFQStatus.open,
      orderSizeRange: '100~300만원',
      orderFrequency: '월 1회',
    },
    {
      title: '오리고기 40kg',
      category: '육류',
      description: '훈제오리용 생오리가 필요합니다. 국내산 선호.',
      quantity: 40,
      unit: 'kg',
      budgetMin: 300000,
      budgetMax: 500000,
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14일 후
      deliveryAddress: '인천시 남동구',
      status: RFQStatus.open,
      orderSizeRange: '50만원 미만',
      orderFrequency: '월 2회',
    },
  ]

  console.log('\n📝 RFQ 생성 중...')
  const createdRfqs = []

  for (const data of rfqData) {
    const rfq = await prisma.rFQ.create({
      data: {
        ...data,
        buyerId: buyer.id,
      }
    })
    createdRfqs.push(rfq)
    console.log(`  ✅ ${rfq.title}`)
  }

  // 일부 RFQ에 제안 추가
  console.log('\n💬 제안 생성 중...')

  // 첫 번째 RFQ에 제안 2개 (하나는 수락 테스트용)
  const rfq1 = createdRfqs[0]
  const quote1 = await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier.id,
      unitPrice: 45000,
      totalPrice: 45000 * rfq1.quantity,
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      note: '1++ 등급 최상품으로 준비해드리겠습니다. 당일 도축 신선육입니다.',
      status: QuoteStatus.pending,
      attachments: [],
    }
  })
  console.log(`  ✅ ${rfq1.title} - 제안1: ${quote1.totalPrice.toLocaleString()}원`)

  // 제안에 대한 채팅방 생성
  const chatRoom1 = await prisma.chatRoom.create({
    data: {
      rfqId: rfq1.id,
      quoteId: quote1.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      status: ChatRoomStatus.active,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }
  })

  // 크레딧 차감 (제안 수수료)
  const commission1 = Math.round(quote1.totalPrice * 0.03)
  await prisma.credit.update({
    where: { supplierId: supplier.id },
    data: { balance: { decrement: commission1 } }
  })
  await prisma.creditLog.create({
    data: {
      supplierId: supplier.id,
      amount: -commission1,
      type: 'use',
      description: `제안 제출 - ${rfq1.title}`,
      referenceId: quote1.id,
      balanceAfter: credit.balance - commission1,
    }
  })

  // 두 번째 RFQ에 제안 (이미 수락된 상태)
  const rfq2 = createdRfqs[1]
  const quote2 = await prisma.quote.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier.id,
      unitPrice: 9000,
      totalPrice: 9000 * rfq2.quantity,
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      note: '국내산 삼겹살 최저가로 공급합니다.',
      status: 'accepted',
      acceptedAt: new Date(),
      attachments: [],
    }
  })
  console.log(`  ✅ ${rfq2.title} - 제안 (수락됨): ${quote2.totalPrice.toLocaleString()}원`)

  // RFQ 상태를 closed로 변경
  await prisma.rFQ.update({
    where: { id: rfq2.id },
    data: { status: 'closed' }
  })

  // 수락된 제안의 채팅방 (거래확정 상태)
  const chatRoom2 = await prisma.chatRoom.create({
    data: {
      rfqId: rfq2.id,
      quoteId: quote2.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      status: 'deal_confirmed',
      dealConfirmedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  })

  // 주문 생성
  await prisma.order.create({
    data: {
      chatRoomId: chatRoom2.id,
      rfqId: rfq2.id,
      quoteId: quote2.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      status: 'preparing',
      productAmount: quote2.totalPrice,
      totalAmount: quote2.totalPrice,
      commissionAmount: Math.round(quote2.totalPrice * 0.03),
      supplierFee: Math.round(quote2.totalPrice * 0.03),
      paymentMethod: 'direct',
    }
  })

  // 세 번째 RFQ - 입금 확인 대기 상태
  const rfq3 = createdRfqs[2]
  const quote3 = await prisma.quote.create({
    data: {
      rfqId: rfq3.id,
      supplierId: supplier.id,
      unitPrice: 5500,
      totalPrice: 5500 * rfq3.quantity,
      deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      note: '무항생제 닭가슴살입니다. 정기 거래 시 추가 할인 가능합니다.',
      status: 'accepted',
      acceptedAt: new Date(),
      attachments: [],
    }
  })
  console.log(`  ✅ ${rfq3.title} - 제안 (입금대기): ${quote3.totalPrice.toLocaleString()}원`)

  await prisma.rFQ.update({
    where: { id: rfq3.id },
    data: { status: 'closed' }
  })

  const chatRoom3 = await prisma.chatRoom.create({
    data: {
      rfqId: rfq3.id,
      quoteId: quote3.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      status: 'payment_requested',
      dealConfirmedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.order.create({
    data: {
      chatRoomId: chatRoom3.id,
      rfqId: rfq3.id,
      quoteId: quote3.id,
      buyerId: buyer.id,
      supplierId: supplier.id,
      status: 'payment_pending',
      productAmount: quote3.totalPrice,
      totalAmount: quote3.totalPrice,
      commissionAmount: Math.round(quote3.totalPrice * 0.03),
      supplierFee: Math.round(quote3.totalPrice * 0.03),
      paymentMethod: 'direct',
    }
  })

  // 알림 생성
  console.log('\n🔔 알림 생성 중...')
  await prisma.notification.createMany({
    data: [
      {
        userId: buyer.id,
        type: 'new_quote',
        title: '새 제안이 도착했습니다',
        message: `"${rfq1.title}"에 새로운 제안이 도착했습니다.`,
        link: '/buyer/quotes',
      },
      {
        userId: supplier.id,
        type: 'deal_confirmed',
        title: '제안이 수락되었습니다',
        message: `"${rfq2.title}" 제안이 수락되었습니다.`,
        link: '/supplier/orders',
      },
    ]
  })

  console.log('\n✨ 테스트 데이터 생성 완료!')
  console.log('\n📌 생성된 데이터:')
  console.log(`  - RFQ: ${createdRfqs.length}개`)
  console.log(`  - 제안: 3개 (대기 1, 수락 2)`)
  console.log(`  - 채팅방: 3개`)
  console.log(`  - 주문: 2개`)
  console.log('\n💡 테스트 시나리오:')
  console.log('  1. 대기중인 제안 수락 테스트 → 첫 번째 RFQ')
  console.log('  2. 거래확정 후 입금 요청 테스트 → 두 번째 RFQ')
  console.log('  3. 입금 확인 대기 테스트 → 세 번째 RFQ')
  console.log('  4. 새 RFQ에 제안 제출 테스트 → 네,다섯번째 RFQ')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
