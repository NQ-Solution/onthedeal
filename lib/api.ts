'use client'

import { signOut } from 'next-auth/react'

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * 전역 API fetch 래퍼
 * - 401 에러 시 자동으로 로그인 페이지로 리다이렉트
 * - 세션 만료 처리
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const { skipAuth, ...fetchOptions } = options

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    // 401 Unauthorized - 세션 만료
    if (res.status === 401 && !skipAuth) {
      console.warn('[API] 세션 만료 - 로그아웃 처리')
      await signOut({ redirect: false })
      window.location.href = '/login?expired=true'
      return { error: '세션이 만료되었습니다. 다시 로그인해주세요.', status: 401 }
    }

    // 403 Forbidden
    if (res.status === 403) {
      return { error: '접근 권한이 없습니다.', status: 403 }
    }

    // 성공 응답
    if (res.ok) {
      try {
        const data = await res.json()
        return { data, status: res.status }
      } catch {
        // JSON 파싱 실패 (빈 응답 등)
        return { data: undefined, status: res.status }
      }
    }

    // 기타 에러 응답
    try {
      const errorData = await res.json()
      return {
        error: errorData.error || errorData.message || '요청 처리에 실패했습니다.',
        status: res.status
      }
    } catch {
      return { error: '요청 처리에 실패했습니다.', status: res.status }
    }
  } catch (error) {
    console.error('[API] 네트워크 오류:', error)
    return { error: '네트워크 오류가 발생했습니다.', status: 0 }
  }
}

/**
 * 크레딧 잔액 조회
 */
export async function fetchCreditBalance(): Promise<number | null> {
  const { data, error } = await apiFetch<{ balance: number }>('/api/credits')
  if (error) {
    console.error('[API] 크레딧 조회 실패:', error)
    return null
  }
  return data?.balance ?? null
}

/**
 * 세션 유효성 확인
 */
export async function checkSession(): Promise<boolean> {
  const { status } = await apiFetch('/api/auth/session', { skipAuth: true })
  return status === 200
}
