import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET - 사이트 설정 조회 (공개)
export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' }
    })

    // 설정이 없으면 기본값으로 생성
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          siteName: 'OnTheDeal',
          siteDescription: 'B2B 식자재 거래 플랫폼',
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Site settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
