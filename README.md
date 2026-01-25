# OnTheDeal - B2B 식자재 거래 플랫폼

## 프로젝트 개요
식자재 구매자와 공급자를 연결하는 B2B 거래 플랫폼입니다.

## 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State**: Zustand
- **Form**: React Hook Form + Zod

## 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열어 Supabase 정보를 입력하세요:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase 설정
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. (선택) 크레딧 시스템: `supabase/schema_phase2.sql` 실행
4. Project Settings → API에서 URL과 anon key 복사

### 4. 개발 서버 실행
```bash
npm run dev
```

## 폴더 구조
```
onthedeal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   ├── (dashboard)/       # 대시보드 페이지
│   │   ├── buyer/         # 구매자 전용
│   │   ├── supplier/      # 공급자 전용
│   │   └── chat/          # 채팅
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── ui/               # 공통 UI 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                   # 유틸리티
│   ├── supabase/         # Supabase 클라이언트
│   └── utils/            # 헬퍼 함수
├── types/                # TypeScript 타입
└── supabase/             # DB 스키마
```

## 핵심 기능

### 구매자 (Buyer)
- RFQ(견적요청서) 등록
- 받은 견적 확인 및 수락
- 공급자와 채팅
- 주문 관리

### 공급자 (Supplier)
- 진행 중인 RFQ 조회
- 견적 제출
- 구매자와 채팅
- 크레딧 관리
- 주문 처리

## 수수료 정책
- 거래 성사 시 3% 수수료
- 크레딧 1개 = 1,000원
