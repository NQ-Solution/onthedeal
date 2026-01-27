import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - 사이트 설정 조회 (공개 - 푸터용 정보만 반환)
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
      // 공개적으로 필요한 필드만 선택 (민감 정보 제외)
      select: {
        siteName: true,
        siteDescription: true,
        contactEmail: true,
        contactPhone: true,
        ceoName: true,
        businessNumber: true,
        businessAddress: true,
        // 아래 필드는 민감 정보로 제외
        // adminAlertEmail: false,
        // bankName: false,
        // bankAccount: false,
        // bankHolder: false,
      }
    })

    // 설정이 없으면 기본값 반환
    if (!settings) {
      return NextResponse.json({
        siteName: 'OnTheDeal',
        siteDescription: 'B2B 식자재 거래 플랫폼',
        contactEmail: null,
        contactPhone: null,
        ceoName: null,
        businessNumber: null,
        businessAddress: null,
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Site settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
