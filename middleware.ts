import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // 개발 모드에서는 인증 체크 건너뛰기
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }

    // 관리자 페이지 접근 권한 체크
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // 구매자 페이지 접근 권한 체크
    if (pathname.startsWith('/buyer')) {
      if (token?.role !== 'buyer' && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // 공급자 페이지 접근 권한 체크
    if (pathname.startsWith('/supplier')) {
      if (token?.role !== 'supplier' && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 개발 모드에서는 항상 허용
        if (process.env.NODE_ENV === 'development') {
          return true
        }

        // 공개 페이지 허용
        if (
          pathname === '/' ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/register') ||
          pathname.startsWith('/forgot-password') ||
          pathname.startsWith('/about') ||
          pathname.startsWith('/contact') ||
          pathname.startsWith('/terms') ||
          pathname.startsWith('/privacy') ||
          pathname.startsWith('/health') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/_next') ||
          pathname.startsWith('/favicon')
        ) {
          return true
        }

        // 그 외 페이지는 토큰 필요
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
