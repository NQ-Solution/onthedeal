import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// 간단한 인메모리 Rate Limiter (미들웨어용)
const loginAttempts = new Map<string, { count: number; resetTime: number }>()

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15분
  const maxAttempts = 5

  const entry = loginAttempts.get(ip)

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (entry.count >= maxAttempts) {
    return false
  }

  entry.count++
  return true
}

// 주기적으로 만료된 항목 정리
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    loginAttempts.forEach((entry, key) => {
      if (now > entry.resetTime) {
        loginAttempts.delete(key)
      }
    })
  }, 60000)
}

// CSRF 보호: Origin/Referer 검증
function verifyCsrf(request: Request): boolean {
  const method = request.method.toUpperCase()

  // GET, HEAD, OPTIONS는 CSRF 검증 불필요
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  // Origin 헤더 검증
  if (origin) {
    try {
      const originHost = new URL(origin).host
      return originHost === host
    } catch {
      return false
    }
  }

  // Referer 헤더 검증 (Origin이 없는 경우)
  if (referer) {
    try {
      const refererHost = new URL(referer).host
      return refererHost === host
    } catch {
      return false
    }
  }

  // Origin과 Referer 둘 다 없는 경우 (same-origin 요청일 수 있음)
  // Content-Type이 application/json이면 허용 (CORS로 보호됨)
  const contentType = request.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return true
  }

  return false
}

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // 로그인 Rate Limiting (POST /api/auth/callback/credentials)
    if (pathname.includes('/api/auth/callback/credentials') && request.method === 'POST') {
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'

      if (!checkLoginRateLimit(ip)) {
        return NextResponse.json(
          { error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.' },
          { status: 429 }
        )
      }
    }

    // API 라우트에 대한 CSRF 보호 (인증된 내부 API는 세션으로 보호되므로 제외)
    const csrfExemptPaths = [
      '/api/auth/',
      '/api/payments/toss/webhook',
      '/api/health',
      '/api/rfqs',
      '/api/quotes',
      '/api/orders',
      '/api/chat',
      '/api/notifications',
      '/api/profile',
      '/api/supplier',
      '/api/inquiries',
      '/api/cron',
    ]
    const isCsrfExempt = csrfExemptPaths.some(path => pathname.startsWith(path))

    if (pathname.startsWith('/api/') && !isCsrfExempt) {
      if (!verifyCsrf(request)) {
        return NextResponse.json(
          { error: 'CSRF validation failed' },
          { status: 403 }
        )
      }
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
          pathname.startsWith('/admintest') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/api/settings') ||
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
