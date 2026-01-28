// 중앙 집중식 Mock 데이터
// 모든 페이지에서 일관된 더미 데이터 사용

import { Profile, RFQ, Quote, Order, ChatRoom, ChatMessage, Credit, CreditLog } from '@/types'

// ============================================
// 사용자 (Profiles)
// ============================================

export const mockBuyers: Profile[] = [
  {
    id: 'buyer-001',
    email: 'buyer@tastyrestaurant.com',
    role: 'buyer',
    company_name: '맛있는식당',
    business_number: '123-45-67890',
    contact_name: '김민준',
    phone: '010-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    representative_name: '김민준',
    business_type: '음식점업',
    business_category: '한식',
    store_address: '서울시 강남구 테헤란로 123',
    approval_status: 'approved',
    created_at: '2024-12-01',
    updated_at: '2024-12-01',
  },
  {
    id: 'buyer-002',
    email: 'buyer2@goodfood.com',
    role: 'buyer',
    company_name: '좋은음식점',
    business_number: '234-56-78901',
    contact_name: '이서연',
    phone: '010-2345-6789',
    address: '서울시 서초구 강남대로 456',
    representative_name: '이서연',
    business_type: '음식점업',
    business_category: '양식',
    store_address: '서울시 서초구 강남대로 456',
    approval_status: 'approved',
    created_at: '2024-12-05',
    updated_at: '2024-12-05',
  },
]

export const mockSuppliers: Profile[] = [
  {
    id: 'supplier-001',
    email: 'supplier@premiumhanwoo.com',
    role: 'supplier',
    company_name: '프리미엄한우농장',
    business_number: '987-65-43210',
    contact_name: '박준혁',
    phone: '010-9876-5432',
    address: '강원도 횡성군 청일면 농장로 456',
    representative_name: '박준혁',
    business_type: '도소매업',
    business_category: '축산물',
    store_address: '강원도 횡성군 청일면 농장로 456',
    approval_status: 'approved',
    created_at: '2024-11-15',
    updated_at: '2024-11-15',
  },
  {
    id: 'supplier-002',
    email: 'supplier2@jejumeat.com',
    role: 'supplier',
    company_name: '제주명품축산',
    business_number: '876-54-32109',
    contact_name: '최수현',
    phone: '010-8765-4321',
    address: '제주시 애월읍 축산로 789',
    representative_name: '최수현',
    business_type: '도소매업',
    business_category: '축산물',
    store_address: '제주시 애월읍 축산로 789',
    approval_status: 'approved',
    created_at: '2024-11-20',
    updated_at: '2024-11-20',
  },
  {
    id: 'supplier-003',
    email: 'supplier3@cleanmeat.com',
    role: 'supplier',
    company_name: '청정미트',
    business_number: '765-43-21098',
    contact_name: '정하윤',
    phone: '010-7654-3210',
    address: '충북 충주시 축산단지로 123',
    representative_name: '정하윤',
    business_type: '도소매업',
    business_category: '축산물',
    store_address: '충북 충주시 축산단지로 123',
    approval_status: 'approved',
    created_at: '2024-11-25',
    updated_at: '2024-11-25',
  },
]

// 현재 로그인된 사용자 (개발 모드)
export const mockCurrentUser = {
  buyer: mockBuyers[0],
  supplier: mockSuppliers[0],
}

// ============================================
// 발주 (RFQs)
// ============================================

export const mockRFQs: RFQ[] = [
  {
    id: 'rfq-001',
    buyer_id: 'buyer-001',
    title: '한우 등심 1++ 등급 대량 구매',
    category: '육류',
    description: '프리미엄 한우 등심 1++ 등급으로 50kg 필요합니다. 신선도가 중요하며, 진공포장 필수입니다. 마블링 좋은 것으로 부탁드립니다.',
    quantity: 50,
    unit: 'kg',
    budget_min: 500000,
    budget_max: 700000,
    items: [
      { id: 'item-1', name: '한우 등심 1++', quantity: 30, unit: 'kg', note: '마블링 좋은 것' },
      { id: 'item-2', name: '한우 채끝 1++', quantity: 20, unit: 'kg', note: '균일한 두께' },
    ],
    delivery_date: '2025-02-15',
    delivery_address: '서울시 강남구 테헤란로 123',
    status: 'open',
    view_count: 45,
    quote_count: 3,
    created_at: '2025-01-20',
    updated_at: '2025-01-20',
    buyer: mockBuyers[0],
  },
  {
    id: 'rfq-002',
    buyer_id: 'buyer-001',
    title: '제주흑돼지 오겹살 구매',
    category: '육류',
    description: '제주 흑돼지 오겹살 30kg 필요합니다. 도축 후 3일 이내 제품으로 부탁드립니다.',
    quantity: 30,
    unit: 'kg',
    budget_min: 300000,
    budget_max: 450000,
    items: [
      { id: 'item-1', name: '제주흑돼지 오겹살', quantity: 30, unit: 'kg', note: '도축 3일 이내' },
    ],
    delivery_date: '2025-02-18',
    delivery_address: '서울시 강남구 테헤란로 123',
    status: 'open',
    view_count: 32,
    quote_count: 2,
    created_at: '2025-01-22',
    updated_at: '2025-01-22',
    buyer: mockBuyers[0],
  },
  {
    id: 'rfq-003',
    buyer_id: 'buyer-002',
    title: '한우 갈비살 대량 주문',
    category: '육류',
    description: '한우 갈비살 1등급 이상 40kg 필요합니다. 두께 균일하게 손질 부탁드립니다.',
    quantity: 40,
    unit: 'kg',
    budget_min: 800000,
    budget_max: 1000000,
    items: [
      { id: 'item-1', name: '한우 갈비살 1등급', quantity: 40, unit: 'kg', note: '두께 균일하게' },
    ],
    delivery_date: '2025-02-20',
    delivery_address: '서울시 서초구 강남대로 456',
    status: 'open',
    view_count: 28,
    quote_count: 4,
    created_at: '2025-01-23',
    updated_at: '2025-01-23',
    buyer: mockBuyers[1],
  },
  {
    id: 'rfq-004',
    buyer_id: 'buyer-001',
    title: '돼지 삼겹살 주문',
    category: '육류',
    description: '국내산 돼지 삼겹살 20kg 필요합니다.',
    quantity: 20,
    unit: 'kg',
    budget_min: 150000,
    budget_max: 200000,
    items: [
      { id: 'item-1', name: '국내산 삼겹살', quantity: 20, unit: 'kg' },
    ],
    delivery_date: '2025-02-10',
    delivery_address: '서울시 강남구 테헤란로 123',
    status: 'in_progress',
    view_count: 56,
    quote_count: 5,
    created_at: '2025-01-15',
    updated_at: '2025-01-18',
    buyer: mockBuyers[0],
  },
  {
    id: 'rfq-005',
    buyer_id: 'buyer-002',
    title: '닭가슴살 대량 구매',
    category: '육류',
    description: '신선 닭가슴살 100kg 필요합니다. 냉장 상태로 배송 부탁드립니다.',
    quantity: 100,
    unit: 'kg',
    budget_min: 400000,
    budget_max: 500000,
    items: [
      { id: 'item-1', name: '신선 닭가슴살', quantity: 100, unit: 'kg', note: '냉장 배송' },
    ],
    delivery_date: '2025-02-12',
    delivery_address: '서울시 서초구 강남대로 456',
    status: 'closed',
    view_count: 72,
    quote_count: 6,
    created_at: '2025-01-10',
    updated_at: '2025-01-20',
    buyer: mockBuyers[1],
  },
]

// ============================================
// 제안 (Quotes)
// ============================================

export const mockQuotes: Quote[] = [
  {
    id: 'quote-001',
    rfq_id: 'rfq-001',
    supplier_id: 'supplier-001',
    unit_price: 12000,
    total_price: 600000,
    delivery_date: '2025-02-14',
    note: '최상급 한우 1++ 등급으로 준비하겠습니다. 신선도 보장합니다.',
    status: 'pending',
    option_type: 'basic',
    commission_rate: 3,
    created_at: '2025-01-21',
    updated_at: '2025-01-21',
    supplier: mockSuppliers[0],
  },
  {
    id: 'quote-002',
    rfq_id: 'rfq-001',
    supplier_id: 'supplier-002',
    unit_price: 11500,
    total_price: 575000,
    delivery_date: '2025-02-15',
    note: '제주에서 직송하는 최고급 한우입니다.',
    status: 'pending',
    option_type: 'premium',
    commission_rate: 5,
    is_premium: true,
    created_at: '2025-01-21',
    updated_at: '2025-01-21',
    supplier: mockSuppliers[1],
  },
  {
    id: 'quote-003',
    rfq_id: 'rfq-002',
    supplier_id: 'supplier-001',
    unit_price: 13000,
    total_price: 390000,
    delivery_date: '2025-02-17',
    note: '제주 흑돼지 산지 직송으로 최상의 신선도 보장합니다.',
    status: 'accepted',
    accepted_at: '2025-01-23',
    option_type: 'basic',
    commission_rate: 3,
    created_at: '2025-01-22',
    updated_at: '2025-01-23',
    supplier: mockSuppliers[0],
  },
  {
    id: 'quote-004',
    rfq_id: 'rfq-003',
    supplier_id: 'supplier-003',
    unit_price: 22000,
    total_price: 880000,
    delivery_date: '2025-02-19',
    note: '청정 지역에서 키운 한우 갈비살입니다.',
    status: 'pending',
    option_type: 'basic',
    commission_rate: 3,
    created_at: '2025-01-24',
    updated_at: '2025-01-24',
    supplier: mockSuppliers[2],
  },
  {
    id: 'quote-005',
    rfq_id: 'rfq-004',
    supplier_id: 'supplier-002',
    unit_price: 8500,
    total_price: 170000,
    delivery_date: '2025-02-09',
    note: '신선한 국내산 삼겹살입니다.',
    status: 'accepted',
    accepted_at: '2025-01-17',
    option_type: 'basic',
    commission_rate: 3,
    created_at: '2025-01-16',
    updated_at: '2025-01-17',
    supplier: mockSuppliers[1],
  },
]

// ============================================
// 주문 (Orders)
// ============================================

export const mockBuyerOrders: Order[] = [
  {
    id: 'order-001',
    chat_room_id: 'chat-001',
    rfq_id: 'rfq-002',
    quote_id: 'quote-003',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    product_amount: 390000,
    total_amount: 403650,  // 390000 * 1.035
    commission_amount: 13650,
    buyer_fee: 13650,
    supplier_fee: 11700,
    status: 'preparing',
    payment_method: 'escrow',
    created_at: '2025-01-23',
    updated_at: '2025-01-24',
    rfq: mockRFQs[1],
    supplier: mockSuppliers[0],
  },
  {
    id: 'order-002',
    chat_room_id: 'chat-002',
    rfq_id: 'rfq-004',
    quote_id: 'quote-005',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-002',
    product_amount: 170000,
    total_amount: 175950,
    commission_amount: 5950,
    buyer_fee: 5950,
    supplier_fee: 5100,
    status: 'shipping',
    payment_method: 'escrow',
    created_at: '2025-01-17',
    updated_at: '2025-01-20',
    rfq: mockRFQs[3],
    supplier: mockSuppliers[1],
  },
  {
    id: 'order-003',
    chat_room_id: 'chat-003',
    rfq_id: 'rfq-005',
    quote_id: 'quote-006',
    buyer_id: 'buyer-002',
    supplier_id: 'supplier-003',
    product_amount: 450000,
    total_amount: 465750,
    commission_amount: 15750,
    buyer_fee: 15750,
    supplier_fee: 13500,
    status: 'delivered',
    payment_method: 'escrow',
    created_at: '2025-01-20',
    updated_at: '2025-01-24',
  },
  {
    id: 'order-004',
    chat_room_id: 'chat-004',
    rfq_id: 'rfq-006',
    quote_id: 'quote-007',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    product_amount: 520000,
    total_amount: 538200,
    commission_amount: 18200,
    buyer_fee: 18200,
    supplier_fee: 15600,
    status: 'completed',
    payment_method: 'escrow',
    created_at: '2025-01-10',
    updated_at: '2025-01-18',
  },
]

export const mockSupplierOrders: Order[] = [
  {
    id: 'order-001',
    chat_room_id: 'chat-001',
    rfq_id: 'rfq-002',
    quote_id: 'quote-003',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    product_amount: 390000,
    total_amount: 403650,
    commission_amount: 13650,
    buyer_fee: 13650,
    supplier_fee: 11700,
    status: 'preparing',
    payment_method: 'escrow',
    created_at: '2025-01-23',
    updated_at: '2025-01-24',
    buyer: mockBuyers[0],
  },
  {
    id: 'order-004',
    chat_room_id: 'chat-004',
    rfq_id: 'rfq-006',
    quote_id: 'quote-007',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    product_amount: 520000,
    total_amount: 538200,
    commission_amount: 18200,
    buyer_fee: 18200,
    supplier_fee: 15600,
    status: 'completed',
    payment_method: 'escrow',
    created_at: '2025-01-10',
    updated_at: '2025-01-18',
    buyer: mockBuyers[0],
  },
]

// ============================================
// 채팅 (Chat Rooms & Messages)
// ============================================

export const mockChatRooms: ChatRoom[] = [
  {
    id: 'chat-001',
    rfq_id: 'rfq-002',
    quote_id: 'quote-003',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    status: 'deal_confirmed',
    deal_confirmed_at: '2025-01-23T14:30:00',
    created_at: '2025-01-22T10:00:00',
    rfq: mockRFQs[1],
    quote: mockQuotes[2],
    buyer: mockBuyers[0],
    supplier: mockSuppliers[0],
  },
  {
    id: 'chat-002',
    rfq_id: 'rfq-001',
    quote_id: 'quote-001',
    buyer_id: 'buyer-001',
    supplier_id: 'supplier-001',
    status: 'active',
    created_at: '2025-01-21T15:00:00',
    rfq: mockRFQs[0],
    quote: mockQuotes[0],
    buyer: mockBuyers[0],
    supplier: mockSuppliers[0],
  },
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-001',
    chat_room_id: 'chat-001',
    sender_id: 'buyer-001',
    content: '안녕하세요, 제안 잘 받았습니다. 품질 보장해주실 수 있나요?',
    created_at: '2025-01-22T10:05:00',
    sender: mockBuyers[0],
  },
  {
    id: 'msg-002',
    chat_room_id: 'chat-001',
    sender_id: 'supplier-001',
    content: '네, 안녕하세요! 저희 농장은 HACCP 인증을 받았고, 최상급 품질만 취급합니다.',
    created_at: '2025-01-22T10:10:00',
    sender: mockSuppliers[0],
  },
  {
    id: 'msg-003',
    chat_room_id: 'chat-001',
    sender_id: 'buyer-001',
    content: '좋습니다. 배송일 조정이 가능할까요? 2월 17일로 부탁드려도 될까요?',
    created_at: '2025-01-22T10:15:00',
    sender: mockBuyers[0],
  },
  {
    id: 'msg-004',
    chat_room_id: 'chat-001',
    sender_id: 'supplier-001',
    content: '네, 2월 17일 배송 가능합니다. 오전 배송으로 진행해드릴게요.',
    created_at: '2025-01-22T10:20:00',
    sender: mockSuppliers[0],
  },
  {
    id: 'msg-005',
    chat_room_id: 'chat-001',
    sender_id: 'buyer-001',
    content: '감사합니다. 그럼 진행하겠습니다!',
    created_at: '2025-01-22T10:25:00',
    sender: mockBuyers[0],
  },
]

// ============================================
// 크레딧 (Credits)
// ============================================

export const mockCredit: Credit = {
  id: 'credit-001',
  supplier_id: 'supplier-001',
  balance: 250000,
  created_at: '2024-12-01',
  updated_at: '2025-01-24',
}

export const mockCreditLogs: CreditLog[] = [
  {
    id: 'log-001',
    supplier_id: 'supplier-001',
    amount: 100000,
    type: 'charge',
    description: '크레딧 충전',
    balance_after: 100000,
    created_at: '2024-12-15',
  },
  {
    id: 'log-002',
    supplier_id: 'supplier-001',
    amount: 200000,
    type: 'charge',
    description: '크레딧 충전',
    balance_after: 300000,
    created_at: '2025-01-05',
  },
  {
    id: 'log-003',
    supplier_id: 'supplier-001',
    amount: -15000,
    type: 'use',
    description: '제안 제출 - 한우 등심 1++ 등급 대량 구매',
    reference_id: 'quote-001',
    balance_after: 285000,
    created_at: '2025-01-21',
  },
  {
    id: 'log-004',
    supplier_id: 'supplier-001',
    amount: -9000,
    type: 'use',
    description: '제안 제출 - 제주흑돼지 오겹살 구매',
    reference_id: 'quote-003',
    balance_after: 276000,
    created_at: '2025-01-22',
  },
  {
    id: 'log-005',
    supplier_id: 'supplier-001',
    amount: -11700,
    type: 'use',
    description: '거래 확정 수수료 - 제주흑돼지 오겹살',
    reference_id: 'order-001',
    balance_after: 264300,
    created_at: '2025-01-23',
  },
  {
    id: 'log-006',
    supplier_id: 'supplier-001',
    amount: 15000,
    type: 'refund',
    description: '제안 만료 환불 - 한우 등심 1++ 등급 대량 구매',
    reference_id: 'quote-001',
    balance_after: 279300,
    created_at: '2025-01-24',
  },
]

// ============================================
// 공급자 계좌 정보
// ============================================

export const mockSupplierAccount = {
  id: 'account-001',
  supplier_id: 'supplier-001',
  bank_name: '국민은행',
  account_number: '123456-78-901234',
  account_holder: '프리미엄한우농장',
  created_at: '2024-12-01',
  updated_at: '2024-12-01',
}

// ============================================
// 관리자용 데이터
// ============================================

export const mockAllUsers = [...mockBuyers, ...mockSuppliers]

export const mockPendingUsers: Profile[] = [
  {
    id: 'pending-001',
    email: 'newbuyer@email.com',
    role: 'buyer',
    company_name: '새로운식당',
    business_number: '111-22-33333',
    contact_name: '신입자',
    phone: '010-1111-2222',
    approval_status: 'pending',
    created_at: '2025-01-24',
    updated_at: '2025-01-24',
  },
  {
    id: 'pending-002',
    email: 'newsupplier@email.com',
    role: 'supplier',
    company_name: '새축산농장',
    business_number: '444-55-66666',
    contact_name: '공급신입',
    phone: '010-3333-4444',
    approval_status: 'pending',
    created_at: '2025-01-23',
    updated_at: '2025-01-23',
  },
]

// ============================================
// 통계 데이터
// ============================================

export const mockStats = {
  totalRFQs: 1234,
  activeSuppliers: 567,
  completedDeals: 8901,
  totalVolume: 1250000000, // 12.5억
}
