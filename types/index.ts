// 카테고리 목록 - 현재 육류만 활성화
export const CATEGORIES = [
  '육류',
  '채소',
  '과일',
  '수산물',
  '가공식품',
  '유제품',
  '음료',
  '조미료',
  '기타',
] as const

// 활성화된 카테고리 (현재 육류만)
export const ACTIVE_CATEGORIES = ['육류'] as const

// 카테고리별 상태
export const CATEGORY_STATUS: Record<string, { active: boolean; label: string }> = {
  '육류': { active: true, label: '육류' },
  '채소': { active: false, label: '채소 (추후 서비스 확대)' },
  '과일': { active: false, label: '과일 (추후 서비스 확대)' },
  '수산물': { active: false, label: '수산물 (추후 서비스 확대)' },
  '가공식품': { active: false, label: '가공식품 (추후 서비스 확대)' },
  '유제품': { active: false, label: '유제품 (추후 서비스 확대)' },
  '음료': { active: false, label: '음료 (추후 서비스 확대)' },
  '조미료': { active: false, label: '조미료 (추후 서비스 확대)' },
  '기타': { active: false, label: '기타 (추후 서비스 확대)' },
}

// 단위 목록 (식당에서 주로 사용하는 단위 우선)
export const UNITS = [
  '박스',
  '팩',
  'kg',
  'g',
  '개',
  '병',
  '캔',
  'L',
  'ml',
] as const

// 타입 정의
export type Category = typeof CATEGORIES[number]
export type Unit = typeof UNITS[number]

export type UserRole = 'buyer' | 'supplier' | 'admin'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type RFQStatus = 'open' | 'in_progress' | 'closed' | 'cancelled'
export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
// 새로운 주문 상태 플로우: pending → paid → preparing → shipping → delivered → confirmed → completed
export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'confirmed' | 'completed' | 'cancelled'
export type PaymentMethod = 'escrow' | 'direct'
export type CreditLogType = 'charge' | 'use' | 'refund'

// RFQ 품목 타입
export interface RFQItem {
  id: string
  name: string
  quantity: number
  unit: string
  note?: string
}

export interface Profile {
  id: string
  email: string
  role: UserRole
  company_name: string
  business_number?: string
  contact_name: string
  phone: string
  address?: string
  approval_status: ApprovalStatus
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  // 추가 사업자 정보
  representative_name?: string       // 대표자명
  business_type?: string             // 업종
  business_category?: string         // 업태
  store_address?: string             // 매장/사업장 주소
  store_detail_address?: string      // 상세 주소
  postal_code?: string               // 우편번호
  // 이미지 URL
  profile_image?: string             // 프로필 이미지
  business_license_image?: string    // 사업자등록증 이미지
  store_images?: string[]            // 매장 사진들
  // 추가 연락처
  fax?: string                       // 팩스번호
  website?: string                   // 웹사이트
  introduction?: string              // 회사/매장 소개
}

export interface RFQ {
  id: string
  buyer_id: string
  title: string
  category: Category
  description: string
  quantity: number
  unit: Unit
  desired_price?: number
  budget_min?: number
  budget_max?: number
  items?: RFQItem[]
  delivery_date: string
  delivery_address: string
  status: RFQStatus
  view_count?: number
  created_at: string
  updated_at: string
  // Relations
  buyer?: Profile
  quotes?: Quote[]
  quote_count?: number
}

export interface Quote {
  id: string
  rfq_id: string
  supplier_id: string
  unit_price: number
  total_price: number
  delivery_date: string
  note?: string
  status: QuoteStatus
  accepted_at?: string
  created_at: string
  updated_at: string
  // 제안 옵션 (기본/프리미엄)
  option_type?: QuoteOptionType
  commission_rate?: number       // 적용된 수수료율
  is_premium?: boolean           // 상위 노출 여부
  // Relations
  rfq?: RFQ
  supplier?: Profile
}

export interface ChatRoom {
  id: string
  rfq_id: string
  quote_id: string
  buyer_id: string
  supplier_id: string
  status: 'active' | 'deal_confirmed' | 'closed'
  deal_confirmed_at?: string
  created_at: string
  // Relations
  rfq?: RFQ
  quote?: Quote
  buyer?: Profile
  supplier?: Profile
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  created_at: string
  // Relations
  sender?: Profile
}

export interface Order {
  id: string
  chat_room_id: string
  rfq_id: string
  quote_id: string
  buyer_id: string
  supplier_id: string
  product_amount: number           // 상품 금액
  total_amount: number             // 총 금액 (상품 + 구매자 수수료)
  commission_amount: number        // 기존 호환용
  buyer_fee?: number               // 구매자 수수료 (3.5%)
  supplier_fee?: number            // 공급자 수수료 (3%)
  status: OrderStatus
  payment_method: PaymentMethod
  created_at: string
  updated_at: string
  // Relations
  rfq?: RFQ
  quote?: Quote
  buyer?: Profile
  supplier?: Profile
  chat_room?: ChatRoom
}

export interface Credit {
  id: string
  supplier_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface CreditLog {
  id: string
  supplier_id: string
  amount: number
  type: CreditLogType
  description?: string
  reference_id?: string
  balance_after: number
  created_at: string
}

export interface SupplierAccount {
  id: string
  supplier_id: string
  bank_name: string
  account_number: string
  account_holder: string
  created_at: string
  updated_at: string
}

// ============================================
// 수수료 설정 (관리자가 설정 가능)
// ============================================

// 제안 제출 옵션 타입
export type QuoteOptionType = 'basic' | 'premium'

// 제안 옵션 설정
export interface QuoteOption {
  id: QuoteOptionType
  name: string
  description: string
  commissionRate: number  // 수수료 비율 (%)
  benefits: string[]
  isActive: boolean
}

// 플랫폼 수수료 설정
export interface FeeSettings {
  // 구매자 수수료
  buyer: {
    cardPaymentRate: number      // 카드 결제 수수료 (기본 3%)
    bankTransferRate: number     // 계좌이체 수수료 (기본 0%)
  }
  // 공급자 수수료 (제안 옵션별)
  supplier: {
    basic: number                // 기본 제안 수수료 (기본 3%)
    premium: number              // 프리미엄 제안 수수료 (기본 5%)
  }
  // 채팅 관련 설정
  chat: {
    expiryDays: number           // 채팅 만료일 (기본 3일)
    maxProposalsPerHour: number  // 시간당 최대 제안 수 (0 = 무제한)
  }
  updatedAt: string
  updatedBy?: string
}

// 기본 수수료 설정값
export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  buyer: {
    cardPaymentRate: 3,
    bankTransferRate: 0,
  },
  supplier: {
    basic: 3,
    premium: 5,
  },
  chat: {
    expiryDays: 3,
    maxProposalsPerHour: 0,  // 0 = 무제한 (초기 오픈)
  },
  updatedAt: new Date().toISOString(),
}

// 기본 제안 옵션
export const DEFAULT_QUOTE_OPTIONS: QuoteOption[] = [
  {
    id: 'basic',
    name: '기본',
    description: '일반 노출',
    commissionRate: 3,
    benefits: ['제안 제출', '채팅 기능'],
    isActive: true,
  },
  {
    id: 'premium',
    name: '상위 노출',
    description: '구매자 채팅창에서 우선 표시',
    commissionRate: 5,
    benefits: ['제안 제출', '채팅 기능', '채팅창 상위 노출', '알림 우선 발송'],
    isActive: true,
  },
]
