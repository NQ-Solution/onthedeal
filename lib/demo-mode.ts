/**
 * 서비스 모드 설정
 *
 * DEMO_MODE = false : 정식 서비스 운영
 * - 회원가입, 로그인, 결제 등 모든 기능 정상 동작
 * - 관리자는 실제 인증 필요
 * - 구매자/공급자 데모 계정으로 체험 가능
 */

// 정식 서비스 모드 (데모 모드 해제)
export const DEMO_MODE = false

// 데모 계정 정보 (체험용)
// 실제 DB에 이 계정들을 생성해야 합니다
export const DEMO_ACCOUNTS = {
  buyer: {
    email: 'demo-buyer@onthedeal.com',
    password: 'demo1234!',
    name: '데모구매자',
    role: 'buyer' as const,
  },
  supplier: {
    email: 'demo-supplier@onthedeal.com',
    password: 'demo1234!',
    name: '데모공급자',
    role: 'supplier' as const,
  },
}

// 데모 계정 여부 확인
export function isDemoAccount(email: string): boolean {
  return email === DEMO_ACCOUNTS.buyer.email ||
         email === DEMO_ACCOUNTS.supplier.email
}

// 안내 메시지
export const MESSAGES = {
  // 회원가입
  registerSuccess: '회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.',

  // 승인 관련
  pendingApproval: '승인 대기 중인 계정입니다. 관리자 승인 후 로그인 가능합니다.',
  rejectedAccount: '승인이 거절된 계정입니다. 관리자에게 문의해주세요.',

  // 데모 계정 안내
  demoAccountInfo: '데모 계정으로 로그인하면 서비스를 체험할 수 있습니다.',
}

// 데모 메시지 (데모 모드용)
export const DEMO_MESSAGES = {
  register: '현재 데모 버전입니다. 서비스 정식 오픈 후 회원가입이 가능합니다.',
  login: '데모 계정으로 로그인하면 서비스를 체험할 수 있습니다.',
}
