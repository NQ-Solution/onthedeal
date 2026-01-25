import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: 공개 페이지 조회 (slug로)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 })
    }

    const page = await prisma.page.findUnique({
      where: { slug },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // 초안 상태인 페이지는 공개하지 않음
    if (page.status === 'draft') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Failed to fetch page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
