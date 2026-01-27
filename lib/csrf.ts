import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-csrf-secret'
const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * CSRF 토큰 생성
 */
export function generateCsrfToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex')
  return `${token}.${signature}`
}

/**
 * CSRF 토큰 검증
 */
export function validateCsrfToken(token: string): boolean {
  if (!token || !token.includes('.')) {
    return false
  }

  const [value, signature] = token.split('.')
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(value)
    .digest('hex')

  // 타이밍 공격 방지
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * 요청에서 CSRF 토큰 가져오기 및 검증
 */
export function verifyCsrfToken(request: Request): boolean {
  // GET, HEAD, OPTIONS 요청은 CSRF 검증 건너뛰기
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Same-origin 체크 (Referer/Origin 검증)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        console.warn('CSRF: Origin mismatch', { origin, host })
        return false
      }
    } catch {
      return false
    }
  } else if (referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost !== host) {
        console.warn('CSRF: Referer mismatch', { referer, host })
        return false
      }
    } catch {
      return false
    }
  }

  // 헤더에서 CSRF 토큰 확인
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  if (headerToken && validateCsrfToken(headerToken)) {
    return true
  }

  // Content-Type이 application/json인 경우 기본적으로 CORS로 보호됨
  const contentType = request.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    // Origin 또는 Referer가 일치하면 허용
    return true
  }

  return false
}

/**
 * API 라우트에서 CSRF 검증 수행
 * 검증 실패 시 null 반환, 성공 시 true 반환
 */
export function checkCsrf(request: Request): { valid: boolean; error?: string } {
  if (!verifyCsrfToken(request)) {
    return { valid: false, error: 'CSRF validation failed' }
  }
  return { valid: true }
}
