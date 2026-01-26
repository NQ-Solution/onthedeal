import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

// 한국 시간대 설정
const TIMEZONE = 'Asia/Seoul'
const LOCALE = 'ko-KR'

// 가격 포맷
export function formatPrice(price: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 숫자 포맷 (천단위 콤마)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(LOCALE).format(num)
}

// 날짜 포맷 (한국 시간대 기준)
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 날짜+시간 포맷 (한국 시간대 기준)
export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 짧은 날짜 포맷 (YYYY-MM-DD, 한국 시간대 기준)
export function formatDateShort(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString(LOCALE, {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 상대 시간 포맷
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
}

// 한국 시간 기준 상대 시간 (분, 시간, 일 단위)
export function formatRelativeTimeKR(date: string | Date): string {
  const d = new Date(date)
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

// 현재 한국 시간 문자열
export function getKoreanTimeNow(): string {
  return new Date().toLocaleString(LOCALE, { timeZone: TIMEZONE })
}

// RFQ 상태 라벨
export function getRFQStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: '진행중',
    in_progress: '협상중',
    closed: '마감',
    cancelled: '취소됨',
  }
  return labels[status] || status
}

// 제안 상태 라벨
export function getQuoteStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '대기중',
    accepted: '수락됨',
    rejected: '거절됨',
    expired: '만료됨',
  }
  return labels[status] || status
}

// 주문 상태 라벨
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '주문 대기',
    confirmed: '주문 확정',
    paid: '결제 완료',
    shipped: '배송중',
    delivered: '배송 완료',
    completed: '거래 완료',
    cancelled: '취소됨',
  }
  return labels[status] || status
}
