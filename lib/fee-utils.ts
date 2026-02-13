import { prisma } from './db'

// 수수료율 조회 (첫 거래 vs 연속 거래)
export async function getCommissionRate(buyerId: string, supplierId: string): Promise<number> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  const firstRate = (settings?.firstTradeCommissionRate ?? 3.0) / 100
  const repeatRate = (settings?.repeatTradeCommissionRate ?? 1.0) / 100

  // 이전 완료된 주문이 있으면 연속 거래
  const previousOrder = await prisma.order.findFirst({
    where: {
      buyerId,
      supplierId,
      status: { in: ['completed', 'confirmed'] }
    }
  })

  return previousOrder ? repeatRate : firstRate
}

// 설정에서 수수료율만 조회
export async function getCommissionRateFromSettings(): Promise<{ firstRate: number; repeatRate: number }> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } })
  return {
    firstRate: (settings?.firstTradeCommissionRate ?? 3.0) / 100,
    repeatRate: (settings?.repeatTradeCommissionRate ?? 1.0) / 100
  }
}
