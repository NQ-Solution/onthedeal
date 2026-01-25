import { format, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

// 가격 포맷
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price)
}

// 숫자 포맷 (천단위 콤마)
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num)
}

// 날짜 포맷
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'yyyy년 M월 d일', { locale: ko })
}

// 날짜+시간 포맷
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'yyyy년 M월 d일 HH:mm', { locale: ko })
}

// 상대 시간 포맷
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko })
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

// 견적 상태 라벨
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
