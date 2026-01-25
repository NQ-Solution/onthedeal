import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 시딩 시작...')

  // 기존 데이터 삭제 (개발 환경에서만)
  console.log('🗑️  기존 데이터 정리...')
  await prisma.creditLog.deleteMany()
  await prisma.credit.deleteMany()
  await prisma.creditCharge.deleteMany()
  await prisma.supplierAccount.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.orderLog.deleteMany()
  await prisma.order.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.chatRoom.deleteMany()
  await prisma.quote.deleteMany()
  await prisma.rFQ.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.user.deleteMany()

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('test1234', 12)

  // 1. 관리자 계정 생성
  console.log('👤 관리자 계정 생성...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      companyName: 'OnTheDeal 관리자',
      businessNumber: '000-00-00000',
      representativeName: '관리자',
      contactName: '관리자',
      phone: '010-0000-0000',
      approvalStatus: 'approved',
      approvedAt: new Date(),
    },
  })
  console.log(`  ✅ 관리자: ${admin.email}`)

  // 2. 구매자 계정 생성
  console.log('👤 구매자 계정 생성...')
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@test.com',
      password: hashedPassword,
      role: 'buyer',
      companyName: '맛있는 식당',
      businessNumber: '123-45-67890',
      representativeName: '김구매',
      businessType: '음식점업',
      businessCategory: '한식',
      contactName: '김구매',
      phone: '010-1234-5678',
      postalCode: '06234',
      storeAddress: '서울시 강남구 테헤란로 123',
      storeDetailAddress: '1층',
      introduction: '신선한 식자재로 맛있는 음식을 만드는 식당입니다.',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  })
  console.log(`  ✅ 구매자: ${buyer.email}`)

  // 3. 공급자 계정 생성
  console.log('👤 공급자 계정 생성...')
  const supplier = await prisma.user.create({
    data: {
      email: 'supplier@test.com',
      password: hashedPassword,
      role: 'supplier',
      companyName: '신선농산',
      businessNumber: '234-56-78901',
      representativeName: '이공급',
      businessType: '도소매업',
      businessCategory: '농산물',
      contactName: '이공급',
      phone: '010-2345-6789',
      postalCode: '13494',
      storeAddress: '경기도 성남시 분당구 판교로 456',
      storeDetailAddress: '물류센터',
      website: 'https://example.com',
      introduction: '전국 각지의 신선한 농산물을 공급합니다. 당일 수확, 당일 배송!',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedById: admin.id,
    },
  })
  console.log(`  ✅ 공급자: ${supplier.email}`)

  // 4. 공급자 크레딧 계정 생성
  console.log('💰 공급자 크레딧 계정 생성...')
  await prisma.credit.create({
    data: {
      supplierId: supplier.id,
      balance: 100000, // 10만 크레딧 지급
    },
  })

  // 크레딧 지급 로그
  await prisma.creditLog.create({
    data: {
      supplierId: supplier.id,
      amount: 100000,
      type: 'charge',
      description: '테스트용 초기 크레딧 지급',
      balanceAfter: 100000,
    },
  })

  // 5. 공급자 계좌 정보 생성
  console.log('🏦 공급자 계좌 정보 생성...')
  await prisma.supplierAccount.create({
    data: {
      supplierId: supplier.id,
      bankName: '신한은행',
      accountNumber: '110-123-456789',
      accountHolder: '이공급',
    },
  })

  // 6. 샘플 RFQ 생성
  console.log('📋 샘플 RFQ 생성...')
  const rfq1 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      title: '유기농 양파 50kg 견적 요청',
      category: '채소류',
      description: '식당에서 사용할 유기농 양파 50kg이 필요합니다. 신선하고 크기가 균일한 것으로 부탁드립니다.',
      quantity: 50,
      unit: 'kg',
      desiredPrice: 100000,
      budgetMin: 80000,
      budgetMax: 120000,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
      deliveryAddress: '서울시 강남구 테헤란로 123 맛있는 식당',
      status: 'open',
    },
  })

  const rfq2 = await prisma.rFQ.create({
    data: {
      buyerId: buyer.id,
      title: '국내산 한우 등심 10kg',
      category: '육류',
      description: '1++ 등급 한우 등심이 필요합니다. 냉장 상태로 배송 부탁드립니다.',
      quantity: 10,
      unit: 'kg',
      desiredPrice: 800000,
      budgetMin: 700000,
      budgetMax: 900000,
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
      deliveryAddress: '서울시 강남구 테헤란로 123 맛있는 식당',
      status: 'open',
    },
  })

  console.log(`  ✅ RFQ 2개 생성 완료`)

  // 7. 샘플 견적 생성
  console.log('📝 샘플 견적 생성...')
  const quote1 = await prisma.quote.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier.id,
      unitPrice: 1800,
      totalPrice: 90000,
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      note: '유기농 인증 양파입니다. 산지 직송으로 신선하게 배송해 드립니다.',
      status: 'pending',
    },
  })
  console.log(`  ✅ 견적 1개 생성 완료`)

  console.log('')
  console.log('✨ 시딩 완료!')
  console.log('')
  console.log('📌 테스트 계정 정보:')
  console.log('  - 관리자: admin@test.com / test1234')
  console.log('  - 구매자: buyer@test.com / test1234')
  console.log('  - 공급자: supplier@test.com / test1234')
  console.log('')
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
