# OnTheDeal - B2B 식자재 거래 플랫폼

> **도메인**: onthedeal.com
> **개발사**: NQ Solution (nqsolution.kr)

## 프로젝트 개요
식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼입니다.

## 기술 스택
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM (Prisma Accelerate)
- **Auth**: NextAuth.js (JWT 기반)
- **Payment**: 토스페이먼츠 (Toss Payments)
- **State**: Zustand
- **Form**: React Hook Form + Zod

---

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
```

`.env.local` 파일에 필요한 정보 입력:
```env
# Database (Prisma Accelerate)
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-key-min-32-chars

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 토스페이먼츠 (선택)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxx
TOSS_SECRET_KEY=test_sk_xxx
```

### 3. 데이터베이스 설정
```bash
# 스키마 적용 (개발)
npx prisma db push

# 또는 마이그레이션 (프로덕션)
npx prisma migrate deploy
```

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## 폴더 구조
```
onthedeal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 (로그인, 회원가입)
│   ├── (dashboard)/       # 대시보드
│   │   ├── buyer/         # 구매자 전용
│   │   ├── supplier/      # 공급자 전용
│   │   └── chat/          # 채팅
│   ├── (admin)/           # 관리자 페이지
│   ├── checkout/          # 결제 페이지
│   ├── health/            # 헬스 체크
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── ui/               # 공통 UI
│   └── layout/           # 레이아웃
├── lib/                   # 유틸리티
│   ├── db.ts             # Prisma 클라이언트
│   ├── auth.ts           # NextAuth 설정
│   ├── demo-mode.ts      # 데모 모드 설정
│   ├── toss-payments.ts  # 토스페이먼츠
│   ├── date.ts           # 날짜 유틸 (KST)
│   └── utils/            # 헬퍼 함수
├── prisma/               # Prisma 스키마
└── types/                # TypeScript 타입
```

---

## 핵심 기능

### 구매자 (Buyer)
- 발주서 등록 및 관리
- 받은 제안 비교 및 수락
- 공급자와 실시간 채팅
- 주문 관리 및 결제

### 공급자 (Supplier)
- 진행 중인 발주 조회
- 제안 제출 및 관리
- 구매자와 실시간 채팅
- 크레딧 관리
- 주문 처리

### 관리자 (Admin)
- 회원 승인/거절/관리
- 발주/제안/주문 관리
- 문의 관리
- CMS 페이지 관리
- 시스템 설정

---

## 계정 유형

### 운영 계정
- **관리자**: 실제 인증 필요 (회원가입 불가, DB에서 직접 생성)
- **구매자/공급자**: 회원가입 후 관리자 승인 필요

### 데모 계정 (영업/시연용)
```
구매자: demo-buyer@onthedeal.com / demo1234!
공급자: demo-supplier@onthedeal.com / demo1234!
```
> 데모 계정은 DB에 미리 생성되어 있어야 합니다.

---

## 수수료 정책
- 거래 성사 시 **공급자 크레딧에서 3% 차감**
- 구매자는 수수료 없음

---

## 배포 가이드

### Vercel 배포 (권장)

1. **GitHub 연동**
   - Vercel에서 프로젝트 Import
   - 저장소 선택 및 연결

2. **환경변수 설정** (Vercel 대시보드)
   ```env
   DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=PRODUCTION_KEY
   NEXTAUTH_URL=https://onthedeal.com
   NEXTAUTH_SECRET=production-secure-random-key-min-32-chars
   NEXT_PUBLIC_APP_URL=https://onthedeal.com
   NODE_ENV=production

   # 토스페이먼츠 (실서비스 키)
   NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_xxx
   TOSS_SECRET_KEY=live_sk_xxx
   ```

3. **도메인 연결**
   - Vercel Settings > Domains > `onthedeal.com` 추가
   - DNS 설정 (네임서버 또는 A/CNAME 레코드)

4. **배포 트리거**
   - `main` 브랜치에 push 시 자동 배포
   - 또는 Vercel 대시보드에서 수동 배포

### 배포 후 체크리스트

- [ ] `NEXTAUTH_SECRET` 강력한 랜덤 키로 변경 (32자 이상)
- [ ] `NODE_ENV=production` 확인
- [ ] 토스페이먼츠 라이브 키 설정
- [ ] 헬스 체크 확인 (`/health` 또는 `/api/health`)
- [ ] 관리자 계정 생성 (DB에서 직접)
- [ ] 데모 계정 생성 (buyer/supplier)
- [ ] SSL 인증서 확인 (Vercel 자동)

### 데이터베이스 마이그레이션 (프로덕션)
```bash
# 프로덕션 DB에 스키마 적용
DATABASE_URL="production-url" npx prisma migrate deploy
```

---

## 보안 체크리스트

- [x] 비밀번호 해싱 (bcrypt, 12 rounds)
- [x] JWT 세션 (30일 만료)
- [x] 역할 기반 접근 제어 (RBAC)
- [x] API 인증 체크
- [x] 결제 금액 검증
- [x] 회원가입 시 admin 역할 등록 방지
- [x] 환경변수 파일 gitignore
- [ ] Rate limiting (추후 적용 권장)
- [ ] 웹훅 서명 검증 (토스페이먼츠)

---

## 모니터링

### 헬스 체크
- **URL**: `/health` (대시보드) 또는 `/api/health` (API)
- **확인 항목**: 데이터베이스 연결, 메모리 사용량
- **로깅**: 상태가 `healthy`가 아닐 경우 자동 로그

### 에러 모니터링 (권장)
- Sentry 또는 Vercel Analytics 연동 권장

---

## 시간대 설정
- 모든 날짜/시간은 **한국 시간(KST, Asia/Seoul)** 기준
- `lib/date.ts`의 유틸리티 함수 사용

---

## 문의
- **이메일**: support@onthedeal.com
- **전화**: 02-1234-5678
- **개발사**: NQ Solution (https://nqsolution.kr)

---

## 라이선스
© 2026 NQ Solution. All rights reserved.
