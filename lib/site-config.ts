// 사이트 설정
// 도메인 및 기본 정보 관리

export const siteConfig = {
  // 기본 정보
  name: 'OnTheDeal',
  nameKo: '온더딜',
  description: 'B2B 식자재 거래 플랫폼',

  // 도메인 설정
  domain: 'onthedeal.com',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://onthedeal.com',

  // 회사 정보
  company: {
    name: '온더딜',
    email: 'contact@onthedeal.com',
    supportEmail: 'support@onthedeal.com',
    phone: '02-1234-5678',
    address: '서울시 강남구 테헤란로 123',
    businessNumber: '000-00-00000',
  },

  // 소셜 링크
  social: {
    kakao: 'https://pf.kakao.com/_onthedeal',
    instagram: 'https://instagram.com/onthedeal',
    blog: 'https://blog.naver.com/onthedeal',
  },

  // SEO 메타데이터
  seo: {
    title: 'OnTheDeal - B2B 식자재 거래 플랫폼',
    description: '식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼. 더 나은 가격, 더 신선한 식자재.',
    keywords: ['B2B', '식자재', '도매', '한우', '축산물', '농산물', '식당', '납품'],
    ogImage: '/og-image.png',
  },

  // 앱 설정
  settings: {
    // 현재 활성화된 카테고리
    activeCategories: ['육류'],
    // 수수료 설정
    commission: {
      supplier: 0.03, // 공급자 3%
      buyer: 0,       // 구매자 0%
    },
    // 채팅방 만료 시간 (일)
    chatExpiryDays: 3,
  },

  // API 엔드포인트
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://onthedeal.com',
  },

  // 결제 설정
  payment: {
    toss: {
      clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '',
      // 결제 성공/실패 URL
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onthedeal.com'}/checkout/success`,
      failUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onthedeal.com'}/checkout/fail`,
    },
  },
}

// URL 헬퍼 함수
export function getAbsoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`
}

// 결제 URL 생성
export function getPaymentUrls(orderId: string) {
  return {
    successUrl: `${siteConfig.url}/checkout/success`,
    failUrl: `${siteConfig.url}/checkout/fail?orderId=${orderId}`,
  }
}

// 공유 URL 생성
export function getShareUrl(type: 'rfq' | 'supplier', id: string): string {
  const paths: Record<string, string> = {
    rfq: `/rfqs/${id}`,
    supplier: `/suppliers/${id}`,
  }
  return getAbsoluteUrl(paths[type])
}

export default siteConfig
