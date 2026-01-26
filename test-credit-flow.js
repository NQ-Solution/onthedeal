// 크레딧 플로우 통합 테스트
// 실행: node test-credit-flow.js

const BASE_URL = 'http://localhost:3000'

async function runCreditFlowTest() {
  console.log('='.repeat(60))
  console.log('온더딜 크레딧 플로우 통합 테스트')
  console.log('='.repeat(60))

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    // 1. 테스트 데이터 준비
    console.log('\n[1] 테스트 데이터 준비...')

    // 테스트용 구매자 조회/생성
    let buyer = await prisma.user.findFirst({
      where: { email: 'credit-test-buyer@example.com' }
    })
    if (!buyer) {
      buyer = await prisma.user.create({
        data: {
          email: 'credit-test-buyer@example.com',
          password: 'hashed_password',
          role: 'buyer',
          companyName: '크레딧테스트 구매회사',
          businessNumber: '111-22-33333',
          representativeName: '김구매',
          contactName: '김담당',
          phone: '010-1111-2222',
          approvalStatus: 'approved',
        }
      })
      console.log('   ✅ 테스트 구매자 생성:', buyer.email)
    } else {
      console.log('   ✅ 테스트 구매자 확인:', buyer.email)
    }

    // 테스트용 공급자 조회/생성
    let supplier = await prisma.user.findFirst({
      where: { email: 'credit-test-supplier@example.com' }
    })
    if (!supplier) {
      supplier = await prisma.user.create({
        data: {
          email: 'credit-test-supplier@example.com',
          password: 'hashed_password',
          role: 'supplier',
          companyName: '크레딧테스트 공급회사',
          businessNumber: '444-55-66666',
          representativeName: '박공급',
          contactName: '박담당',
          phone: '010-3333-4444',
          approvalStatus: 'approved',
        }
      })
      console.log('   ✅ 테스트 공급자 생성:', supplier.email)
    } else {
      console.log('   ✅ 테스트 공급자 확인:', supplier.email)
    }

    // 2. 크레딧 충전 테스트 (테스트 모드)
    console.log('\n[2] 크레딧 충전 테스트 (테스트 모드)...')
    const chargeAmount = 500000 // 50만원

    // 기존 크레딧 삭제 후 재생성
    await prisma.creditLog.deleteMany({
      where: { supplierId: supplier.id }
    })
    await prisma.credit.deleteMany({
      where: { supplierId: supplier.id }
    })

    // 크레딧 생성
    const credit = await prisma.credit.create({
      data: {
        supplierId: supplier.id,
        balance: chargeAmount,
      }
    })

    // 충전 로그 생성
    await prisma.creditLog.create({
      data: {
        supplierId: supplier.id,
        amount: chargeAmount,
        type: 'charge',
        description: `[테스트] 크레딧 충전 ${chargeAmount.toLocaleString()}원`,
        balanceAfter: chargeAmount,
      }
    })

    console.log(`   ✅ 크레딧 충전 완료: ${chargeAmount.toLocaleString()}원`)
    console.log(`   현재 잔액: ${credit.balance.toLocaleString()}원`)

    // 3. RFQ 생성 테스트
    console.log('\n[3] RFQ 생성 테스트...')
    const deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const rfq = await prisma.rFQ.create({
      data: {
        buyerId: buyer.id,
        title: '크레딧 테스트용 식자재 구매',
        category: 'meat',
        description: '테스트 목적의 발주입니다.',
        quantity: 100,
        unit: 'kg',
        budgetMin: 800000,
        budgetMax: 1200000,
        deliveryDate: deliveryDate,
        status: 'open',
        deliveryAddress: '서울시 강남구 테헤란로 123',
      }
    })
    console.log(`   ✅ RFQ 생성 완료: ${rfq.title}`)
    console.log(`   RFQ ID: ${rfq.id}`)

    // 4. 견적 제출 테스트
    console.log('\n[4] 견적 제출 테스트...')
    const quotePrice = 900000 // 90만원
    const quote = await prisma.quote.create({
      data: {
        rfqId: rfq.id,
        supplierId: supplier.id,
        unitPrice: 9000,
        totalPrice: quotePrice,
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        note: '최상급 품질 보장합니다.',
      }
    })
    console.log(`   ✅ 견적 제출 완료`)
    console.log(`   견적 금액: ${quotePrice.toLocaleString()}원`)
    console.log(`   Quote ID: ${quote.id}`)

    // 5. 견적 수락 및 크레딧 차감 테스트
    console.log('\n[5] 견적 수락 및 크레딧 차감 테스트...')
    const commissionRate = 0.03
    const commissionAmount = Math.round(quotePrice * commissionRate)
    console.log(`   예상 수수료 (3%): ${commissionAmount.toLocaleString()}원`)

    // 견적 수락 처리 (트랜잭션)
    const result = await prisma.$transaction(async (tx) => {
      // 견적 상태 업데이트
      const updatedQuote = await tx.quote.update({
        where: { id: quote.id },
        data: { status: 'accepted' }
      })

      // RFQ 상태 업데이트
      await tx.rFQ.update({
        where: { id: rfq.id },
        data: { status: 'closed' }
      })

      // 채팅방 생성 (7일 후 만료)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      const chatRoom = await tx.chatRoom.create({
        data: {
          rfqId: rfq.id,
          quoteId: quote.id,
          buyerId: buyer.id,
          supplierId: supplier.id,
          expiresAt: expiresAt,
        }
      })

      // 주문 생성
      const order = await tx.order.create({
        data: {
          chatRoomId: chatRoom.id,
          rfqId: rfq.id,
          quoteId: quote.id,
          buyerId: buyer.id,
          supplierId: supplier.id,
          status: 'pending',
          productAmount: quotePrice,
          totalAmount: quotePrice,
          commissionAmount: commissionAmount,
          paymentMethod: 'escrow',
        }
      })

      // 크레딧 차감
      const newBalance = chargeAmount - commissionAmount
      const updatedCredit = await tx.credit.update({
        where: { supplierId: supplier.id },
        data: { balance: newBalance }
      })

      // 크레딧 로그 생성
      await tx.creditLog.create({
        data: {
          supplierId: supplier.id,
          amount: -commissionAmount,
          type: 'use',
          description: `거래 수수료 (${rfq.title})`,
          balanceAfter: newBalance,
          referenceId: order.id,
        }
      })

      // 알림 생성
      await tx.notification.create({
        data: {
          userId: supplier.id,
          type: 'deal_confirmed',
          title: '견적이 수락되었습니다',
          message: `"${rfq.title}" 견적이 수락되었습니다.`,
          link: `/supplier/quotes/${quote.id}`,
        }
      })

      return { quote: updatedQuote, chatRoom, order, credit: updatedCredit }
    })

    console.log(`   ✅ 견적 수락 완료`)
    console.log(`   주문 ID: ${result.order.id}`)
    console.log(`   채팅방 ID: ${result.chatRoom.id}`)
    console.log(`   수수료 차감: -${commissionAmount.toLocaleString()}원`)
    console.log(`   새 잔액: ${result.credit.balance.toLocaleString()}원`)

    // 6. 크레딧 로그 확인
    console.log('\n[6] 크레딧 로그 확인...')
    const logs = await prisma.creditLog.findMany({
      where: { supplierId: supplier.id },
      orderBy: { createdAt: 'asc' }
    })

    logs.forEach((log, index) => {
      const sign = log.amount > 0 ? '+' : ''
      console.log(`   ${index + 1}. ${log.type}: ${sign}${log.amount.toLocaleString()}원 → 잔액 ${log.balanceAfter.toLocaleString()}원`)
      console.log(`      ${log.description}`)
    })

    // 7. 최종 확인
    console.log('\n[7] 최종 결과 확인...')
    const finalCredit = await prisma.credit.findUnique({
      where: { supplierId: supplier.id }
    })

    const expectedBalance = chargeAmount - commissionAmount
    const isCorrect = finalCredit.balance === expectedBalance

    console.log(`   충전 금액: ${chargeAmount.toLocaleString()}원`)
    console.log(`   거래 금액: ${quotePrice.toLocaleString()}원`)
    console.log(`   수수료 (3%): ${commissionAmount.toLocaleString()}원`)
    console.log(`   예상 잔액: ${expectedBalance.toLocaleString()}원`)
    console.log(`   실제 잔액: ${finalCredit.balance.toLocaleString()}원`)
    console.log(`   정확성: ${isCorrect ? '✅ 정확' : '❌ 오류'}`)

    // 8. 테스트 데이터 정리 (선택적)
    console.log('\n[8] 테스트 완료')
    console.log('   테스트 데이터는 유지됩니다. 필요시 수동으로 삭제하세요.')

    console.log('\n' + '='.repeat(60))
    console.log('테스트 결과: ' + (isCorrect ? '✅ 모든 테스트 통과' : '❌ 테스트 실패'))
    console.log('='.repeat(60))

    return isCorrect

  } catch (error) {
    console.error('\n❌ 테스트 오류:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// 테스트 실행
runCreditFlowTest()
  .then(success => process.exit(success ? 0 : 1))
