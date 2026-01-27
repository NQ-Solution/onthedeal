/**
 * 간단한 인메모리 Rate Limiter
 * 프로덕션 환경에서는 Redis 기반으로 교체 권장
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// 주기적으로 만료된 항목 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 60000) // 1분마다 정리

interface RateLimitConfig {
  /** 최대 요청 수 */
  maxRequests: number
  /** 윈도우 시간 (밀리초) */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Rate limit 체크
 * @param identifier - 고유 식별자 (IP, 사용자 ID 등)
 * @param config - Rate limit 설정
 * @returns Rate limit 결과
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // 새 엔트리 또는 윈도우 만료
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(identifier, newEntry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // 기존 윈도우 내 요청
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit 설정 프리셋
 */
export const RATE_LIMITS = {
  // 로그인: 15분에 5회
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  // 회원가입: 1시간에 3회
  register: { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  // API 일반: 1분에 60회
  api: { maxRequests: 60, windowMs: 60 * 1000 },
  // 결제 관련: 1분에 10회
  payment: { maxRequests: 10, windowMs: 60 * 1000 },
}

/**
 * 클라이언트 IP 가져오기
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  return 'unknown'
}

/**
 * Rate limit 응답 헤더 생성
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  }
}
