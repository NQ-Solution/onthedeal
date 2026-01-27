/**
 * 멱등성 키 관리
 * 금융 작업의 중복 처리 방지
 * 프로덕션에서는 Redis 사용 권장
 */

interface IdempotencyEntry {
  result: any
  createdAt: number
  expiresAt: number
}

const idempotencyStore = new Map<string, IdempotencyEntry>()

// 기본 만료 시간: 24시간
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

// 주기적으로 만료된 항목 정리
setInterval(() => {
  const now = Date.now()
  idempotencyStore.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      idempotencyStore.delete(key)
    }
  })
}, 60000) // 1분마다 정리

/**
 * 멱등성 키 확인 및 캐시된 결과 반환
 * @param key - 멱등성 키 (클라이언트에서 제공)
 * @returns 캐시된 결과 또는 null
 */
export function getIdempotencyResult(key: string): any | null {
  const entry = idempotencyStore.get(key)
  if (!entry) {
    return null
  }

  if (Date.now() > entry.expiresAt) {
    idempotencyStore.delete(key)
    return null
  }

  return entry.result
}

/**
 * 멱등성 키와 결과 저장
 * @param key - 멱등성 키
 * @param result - 저장할 결과
 * @param ttlMs - 만료 시간 (밀리초)
 */
export function setIdempotencyResult(
  key: string,
  result: any,
  ttlMs: number = DEFAULT_TTL_MS
): void {
  const now = Date.now()
  idempotencyStore.set(key, {
    result,
    createdAt: now,
    expiresAt: now + ttlMs,
  })
}

/**
 * 멱등성 키 검증 및 처리 헬퍼
 * @param request - HTTP 요청
 * @param headerName - 멱등성 키 헤더 이름
 * @returns { key, cachedResult } 또는 null (키가 없는 경우)
 */
export function checkIdempotency(
  request: Request,
  headerName: string = 'x-idempotency-key'
): { key: string; cachedResult: any | null } | null {
  const key = request.headers.get(headerName)

  if (!key) {
    return null
  }

  const cachedResult = getIdempotencyResult(key)
  return { key, cachedResult }
}

/**
 * 멱등성 키로 응답 생성
 */
export function idempotentResponse(
  key: string,
  data: any,
  status: number = 200
): Response {
  // 결과 캐시
  setIdempotencyResult(key, { data, status })

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': key,
    },
  })
}
