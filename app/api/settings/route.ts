import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// 동적 렌더링 강제 (DB에서 실시간 데이터 로드)
export const dynamic = 'force-dynamic'

// GET - 사이트 설정 조회 (공개 - 푸터용 정보만 반환)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      // 공개적으로 필요한 필드 선택 (관리자 알림 이메일만 제외)
      select: {
        siteName: true,
        siteDescription: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        ceoName: true,
        businessNumber: true,
        businessAddress: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        businessDays: true,
        // 입금 계좌 정보 (공급자 크레딧 충전에 필요)
        bankName: true,
        bankAccount: true,
        bankHolder: true,
        // adminAlertEmail은 제외
      }
    })

    // 설정이 없으면 기본값 반환
    if (!settings) {
      return NextResponse.json({
        siteName: 'OnTheDeal',
        siteDescription: 'B2B 식자재 거래 플랫폼',
        contactEmail: null,
        contactPhone: null,
        address: null,
        ceoName: null,
        businessNumber: null,
        businessAddress: null,
        businessHoursStart: null,
        businessHoursEnd: null,
        businessDays: null,
        bankName: null,
        bankAccount: null,
        bankHolder: null,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Site settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
