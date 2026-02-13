import { NextResponse } from 'next/server'
import { getCommissionRateFromSettings } from '@/lib/fee-utils'

// GET - 수수료율 조회 (프론트엔드 미리보기용)
export async function GET() {
  try {
    const { firstRate, repeatRate } = await getCommissionRateFromSettings()
    return NextResponse.json({
      firstRate: firstRate * 100,
      repeatRate: repeatRate * 100,
    })
  } catch (error) {
    return NextResponse.json({ firstRate: 3.0, repeatRate: 1.0 })
  }
}
