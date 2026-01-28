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
  await prisma.page.deleteMany()

  // 비밀번호 해싱
  const testPassword = await bcrypt.hash('Test1234!', 12)
  const adminPassword = await bcrypt.hash('admin03532', 12)

  // 1. 관리자 계정 생성 (2명)
  console.log('👤 관리자 계정 생성...')
  const admin1 = await prisma.user.create({
    data: {
      email: 'odadmin@onthedeal.com',
      password: adminPassword,
      role: 'admin',
      companyName: 'OnTheDeal',
      businessNumber: '000-00-00000',
      representativeName: '관리자',
      contactName: 'OD 관리자',
      phone: '010-0000-0000',
      approvalStatus: 'approved',
      approvedAt: new Date(),
    },
  })
  console.log(`  ✅ 관리자1: ${admin1.email}`)

  const admin2 = await prisma.user.create({
    data: {
      email: 'nqadmin@onthedeal.com',
      password: adminPassword,
      role: 'admin',
      companyName: 'NQ Solution',
      businessNumber: '000-00-00000',
      representativeName: '관리자',
      contactName: 'NQ 관리자',
      phone: '010-0000-0000',
      approvalStatus: 'approved',
      approvedAt: new Date(),
    },
  })
  console.log(`  ✅ 관리자2: ${admin2.email}`)

  // 2. 구매자 계정 생성
  console.log('👤 구매자 계정 생성...')
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@test.com',
      password: testPassword,
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
      approvedById: admin1.id,
    },
  })
  console.log(`  ✅ 구매자: ${buyer.email}`)

  // 3. 공급자 계정 생성
  console.log('👤 공급자 계정 생성...')
  const supplier = await prisma.user.create({
    data: {
      email: 'supplier@test.com',
      password: testPassword,
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
      approvedById: admin1.id,
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

  // 6. CMS 페이지 생성
  console.log('📄 CMS 페이지 생성...')

  await prisma.page.createMany({
    data: [
      {
        slug: '/terms',
        title: '이용약관',
        description: '서비스 이용약관 페이지',
        content: `<h2>제1조 (목적)</h2>
<p>본 약관은 온더딜(OnTheDeal, 이하 "회사")이 제공하는 B2B 식자재 거래 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

<h2>제2조 (정의)</h2>
<ul>
<li>"서비스"란 회사가 제공하는 B2B 식자재 거래 중개 플랫폼을 의미합니다.</li>
<li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 의미합니다.</li>
<li>"구매자"란 서비스를 통해 식자재를 구매하고자 하는 사업자를 의미합니다.</li>
<li>"공급자"란 서비스를 통해 식자재를 판매하고자 하는 사업자를 의미합니다.</li>
<li>"RFQ"란 제안요청(Request for Quotation)을 의미합니다.</li>
</ul>

<h2>제3조 (약관의 효력 및 변경)</h2>
<ul>
<li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
<li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
<li>약관이 변경되는 경우 회사는 변경 내용을 시행일 7일 전부터 공지합니다.</li>
</ul>

<h2>제4조 (회원가입)</h2>
<ul>
<li>이용자는 회사가 정한 절차에 따라 회원가입을 신청합니다.</li>
<li>회사는 사업자등록증 등 필요한 서류를 확인한 후 회원가입을 승인합니다.</li>
<li>회원가입 승인 후 서비스를 이용할 수 있습니다.</li>
</ul>

<h2>제5조 (서비스 이용)</h2>
<ul>
<li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</li>
<li>회사는 시스템 점검, 보수 등의 사유로 서비스를 일시 중단할 수 있습니다.</li>
<li>현재 서비스는 육류 카테고리만 이용 가능하며, 다른 카테고리는 순차적으로 확대 예정입니다.</li>
</ul>

<h2>제6조 (수수료)</h2>
<ul>
<li>거래 성사 시 거래 금액의 3%가 수수료로 부과됩니다.</li>
<li>수수료는 공급자의 크레딧에서 차감됩니다.</li>
<li>거래가 취소된 경우 수수료는 환불됩니다.</li>
</ul>

<p><strong>부칙:</strong> 본 약관은 2026년 1월 1일부터 시행합니다.</p>`,
        status: 'published',
      },
      {
        slug: '/privacy',
        title: '개인정보처리방침',
        description: '개인정보 처리방침 페이지',
        content: `<p>온더딜(OnTheDeal, 이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.</p>

<h2>제1조 (개인정보의 수집 항목)</h2>
<h3>필수 수집 항목</h3>
<ul>
<li>회사명, 사업자등록번호</li>
<li>담당자명, 연락처, 이메일</li>
<li>사업장 주소</li>
<li>아이디, 비밀번호</li>
</ul>

<h3>선택 수집 항목</h3>
<ul>
<li>사업자등록증 사본</li>
<li>계좌 정보 (공급자의 경우)</li>
</ul>

<h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
<ul>
<li><strong>서비스 제공:</strong> 회원 가입, RFQ 등록, 제안 제출, 거래 체결 등</li>
<li><strong>회원 관리:</strong> 회원제 서비스 이용, 본인 확인, 부정 이용 방지</li>
<li><strong>결제 처리:</strong> 에스크로 결제, 대금 정산, 환불 처리</li>
<li><strong>고객 지원:</strong> 문의 대응, 공지사항 전달, 분쟁 조정</li>
</ul>

<h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
<ul>
<li>계약 또는 청약철회 기록: 5년</li>
<li>대금결제 및 재화 공급 기록: 5년</li>
<li>소비자 불만 또는 분쟁처리 기록: 3년</li>
<li>접속 로그 기록: 1년</li>
</ul>

<h2>제4조 (개인정보 보호책임자)</h2>
<ul>
<li>성명: 김대표</li>
<li>직책: 대표이사</li>
<li>이메일: privacy@onthedeal.com</li>
</ul>

<p><strong>부칙:</strong> 본 개인정보처리방침은 2026년 1월 1일부터 시행합니다.</p>`,
        status: 'published',
      },
      {
        slug: '/about',
        title: '회사소개',
        description: '온더딜 회사 소개 페이지',
        content: `<h2>OnTheDeal - B2B 식자재 거래의 새로운 기준</h2>

<p>OnTheDeal은 B2B 식자재 거래의 혁신을 이끄는 플랫폼입니다. 구매자와 공급자를 직접 연결하여 더 나은 가격, 더 신선한 식자재, 더 편리한 거래를 제공합니다.</p>

<h3>우리의 미션</h3>
<p>복잡한 B2B 식자재 유통 구조를 단순화하고, 모든 거래 당사자가 공정하게 이익을 얻을 수 있는 투명한 거래 환경을 만듭니다.</p>

<h3>왜 OnTheDeal인가?</h3>
<ul>
<li><strong>직거래:</strong> 중간 유통 단계를 줄여 더 나은 가격을 제공합니다</li>
<li><strong>신뢰:</strong> 검증된 사업자만 참여하는 안전한 거래 환경</li>
<li><strong>편리함:</strong> 제안 요청부터 결제까지 원스톱 서비스</li>
<li><strong>투명성:</strong> 모든 거래 내역이 기록되는 투명한 시스템</li>
</ul>

<h3>연락처</h3>
<ul>
<li>이메일: contact@onthedeal.com</li>
<li>전화: 02-1234-5678</li>
<li>주소: 서울시 강남구 테헤란로 123</li>
</ul>`,
        status: 'published',
      },
    ],
  })
  console.log(`  ✅ CMS 페이지 3개 생성 완료`)

  console.log('')
  console.log('✨ 시딩 완료!')
  console.log('')
  console.log('📌 계정 정보:')
  console.log('  [관리자]')
  console.log('  - odadmin@onthedeal.com / admin03532')
  console.log('  - nqadmin@onthedeal.com / admin03532')
  console.log('  [테스트]')
  console.log('  - 구매자: buyer@test.com / Test1234!')
  console.log('  - 공급자: supplier@test.com / Test1234!')
  console.log('')
  console.log('💡 발주, 제안, 주문 등은 실제로 생성해주세요.')
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
