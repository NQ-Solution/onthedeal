/**
 * 한국 시간대(KST) 날짜/시간 유틸리티
 * 모든 날짜는 Asia/Seoul 시간대 기준으로 표시됩니다.
 */

const TIMEZONE = 'Asia/Seoul'
const LOCALE = 'ko-KR'

/**
 * 날짜를 한국 시간대로 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * 날짜와 시간을 한국 시간대로 포맷팅 (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 날짜와 시간을 한국 시간대로 상세 포맷팅 (YYYY년 MM월 DD일 HH:MM:SS)
 */
export function formatDateTimeFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/**
 * 시간만 한국 시간대로 포맷팅 (HH:MM)
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(LOCALE, {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 상대적 시간 표시 (몇 분 전, 몇 시간 전 등)
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return '방금 전'
  if (diffMin < 60) return `${diffMin}분 전`
  if (diffHour < 24) return `${diffHour}시간 전`
  if (diffDay < 7) return `${diffDay}일 전`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}개월 전`
  return `${Math.floor(diffDay / 365)}년 전`
}

/**
 * 채팅 시간 포맷팅 (오늘이면 시간만, 아니면 날짜+시간)
 */
export function formatChatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  // 한국 시간대로 날짜 비교
  const dateStr = d.toLocaleDateString(LOCALE, { timeZone: TIMEZONE })
  const todayStr = now.toLocaleDateString(LOCALE, { timeZone: TIMEZONE })

  if (dateStr === todayStr) {
    return formatTime(d)
  }

  // 올해인 경우 연도 생략
  const yearNow = now.toLocaleDateString(LOCALE, { timeZone: TIMEZONE, year: 'numeric' })
  const yearDate = d.toLocaleDateString(LOCALE, { timeZone: TIMEZONE, year: 'numeric' })

  if (yearNow === yearDate) {
    return d.toLocaleString(LOCALE, {
      timeZone: TIMEZONE,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return formatDateTime(d)
}

/**
 * 현재 한국 시간 가져오기
 */
export function getKoreanTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }))
}

/**
 * 현재 한국 시간 문자열
 */
export function getKoreanTimeString(): string {
  return new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE })
}

/**
 * D-Day 계산 (한국 시간 기준)
 */
export function getDDay(targetDate: Date | string): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const now = new Date()

  // 한국 시간대로 날짜만 비교
  const targetDateOnly = new Date(target.toLocaleDateString('en-US', { timeZone: TIMEZONE }))
  const nowDateOnly = new Date(now.toLocaleDateString('en-US', { timeZone: TIMEZONE }))

  const diffMs = targetDateOnly.getTime() - nowDateOnly.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * D-Day 문자열 포맷팅
 */
export function formatDDay(targetDate: Date | string): string {
  const dday = getDDay(targetDate)
  if (dday === 0) return 'D-Day'
  if (dday > 0) return `D-${dday}`
  return `D+${Math.abs(dday)}`
}
