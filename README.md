# OnTheDeal - B2B 식자재 거래 플랫폼

> **도메인**: onthedeal.com
> **개발사**: (주) 티투알웍스
> **최종 업데이트**: 2026-01-31

---

## 프로젝트 개요

식자재 구매자와 공급자를 직접 연결하는 B2B 거래 플랫폼입니다.

---

## 현재 구현 상태

### 핵심 기능 (구현 완료)

| 기능 | 상태 | 설명 |
|------|------|------|
| 회원가입/로그인 | ✅ 완료 | 구매자/공급자/관리자 역할 구분 |
| 관리자 회원 승인 | ✅ 완료 | 승인/거절/정지 처리 |
| 발주 등록 (구매자) | ✅ 완료 | RFQ 생성, 수정, 삭제 |
| 제안 제출 (공급자) | ✅ 완료 | 크레딧 3% 선차감 |
| 채팅 시스템 | ✅ 완료 | 실시간 협상, 3일 만료 |
| 제안 수락/거절 | ✅ 완료 | 수락 시 주문 생성, 거절 시 환불 |
| 크레딧 충전 요청 | ✅ 완료 | 공급자 신청 → 관리자 승인 |
| 채팅 금액 수정 | ✅ 완료 | 금액 증가 시 추가 크레딧 차감 |
| 알림 시스템 | ✅ 완료 | 이벤트별 알림 생성 |
| Toss 결제 연동 | ✅ 완료 | 결제/취소/웹훅 처리 |

### 수수료 정책

- **제안 제출 시**: 제안가(단가 × 수량)의 **3%** 선차감
- **거래 확정 시**: 선차감 금액이 수수료로 확정
- **미확정/거절 시**: 선차감 금액 **전액 환불**

---

## 사용자별 플로우

### 구매자 (Buyer) - 무료
```
회원가입 → 관리자 승인 → 로그인 → 발주 등록 → 제안 검토 → 채팅/협상 → 제안 수락 → 결제
```

### 공급자 (Supplier) - 크레딧 필요
```
회원가입 → 관리자 승인 → 로그인 → 크레딧 충전 → 발주 확인 → 제안 제출 → 채팅/협상 → 거래 확정
```

### 관리자 (Admin)
```
로그인 → 회원 승인/관리 → 충전 요청 승인 → 거래 모니터링
```

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (JWT 기반) |
| Payment | 토스페이먼츠 |
| 실시간 | Socket.IO (기본 설정) |

---

## 디렉토리 구조

```
onthedeal/
├── app/
│   ├── (admin)/admin/        # 관리자 대시보드
│   │   ├── users/            # 회원 관리
│   │   ├── credits/          # 크레딧 관리 (충전 요청 승인)
│   │   ├── rfqs/             # 발주 관리
│   │   ├── quotes/           # 제안 관리
│   │   ├── orders/           # 주문 관리
│   │   ├── chats/            # 채팅 모니터링
│   │   └── settings/         # 사이트 설정
│   │
│   ├── (dashboard)/
│   │   ├── buyer/            # 구매자 페이지
│   │   │   ├── rfqs/         # 발주 관리 (등록/상세)
│   │   │   ├── quotes/       # 받은 제안 목록
│   │   │   └── orders/       # 주문 관리
│   │   │
│   │   ├── supplier/         # 공급자 페이지
│   │   │   ├── rfqs/         # 발주 목록/상세 (제안 제출)
│   │   │   ├── quotes/       # 내 제안 목록
│   │   │   ├── orders/       # 주문 관리
│   │   │   └── credits/      # 크레딧 관리 (충전 신청)
│   │   │
│   │   ├── chat/             # 채팅 (목록/상세)
│   │   └── notifications/    # 알림
│   │
│   ├── api/                  # REST API
│   │   ├── auth/             # 인증 (회원가입, 로그인)
│   │   ├── rfqs/             # 발주 CRUD
│   │   ├── quotes/           # 제안 (제출/수락/거절/금액수정)
│   │   ├── chat/             # 채팅 (방 목록/메시지)
│   │   ├── orders/           # 주문
│   │   ├── supplier/credits/ # 공급자 크레딧 (조회/충전신청)
│   │   ├── admin/            # 관리자 API
│   │   └── payments/toss/    # 토스 결제
│   │
│   └── checkout/             # 결제 페이지
│
├── components/               # 공통 컴포넌트
│   ├── ui/                   # Button, Input, Card 등
│   └── layout/               # Header, Sidebar, Footer
│
├── lib/                      # 유틸리티
│   ├── auth.ts               # NextAuth 설정
│   ├── db.ts                 # Prisma 클라이언트
│   └── ...
│
├── prisma/
│   └── schema.prisma         # DB 스키마
│
└── types/                    # TypeScript 타입
```

---

## 주요 API 엔드포인트

### 발주 (RFQ)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/rfqs` | 발주 목록 |
| POST | `/api/rfqs` | 발주 등록 |
| GET | `/api/rfqs/[id]` | 발주 상세 |

### 제안 (Quote)
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/quotes` | 제안 목록 |
| POST | `/api/quotes` | 제안 제출 (크레딧 3% 차감) |
| POST | `/api/quotes/[id]/accept` | 제안 수락 |
| POST | `/api/quotes/[id]/reject` | 제안 거절 (크레딧 환불) |
| PATCH | `/api/quotes/[id]/update-price` | 금액 수정 |

### 크레딧
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/supplier/credits` | 잔액 조회 |
| POST | `/api/supplier/credits/request` | 충전 신청 |
| GET | `/api/admin/credits/requests` | 충전 요청 목록 (관리자) |
| POST | `/api/admin/credits/requests` | 충전 승인/반려 (관리자) |

### 채팅
| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/chat/rooms` | 채팅방 목록 |
| GET | `/api/chat/rooms/[id]/messages` | 메시지 조회 |
| POST | `/api/chat/rooms/[id]/messages` | 메시지 전송 |

---

## 데이터베이스 모델

### 핵심 모델

| 모델 | 설명 |
|------|------|
| User | 사용자 (buyer/supplier/admin) |
| RFQ | 발주 요청서 |
| Quote | 제안/견적 |
| ChatRoom | 채팅방 (3일 만료) |
| ChatMessage | 채팅 메시지 |
| Order | 주문 |
| Credit | 공급자 크레딧 잔액 |
| CreditLog | 크레딧 변동 이력 |
| CreditCharge | 크레딧 충전 요청 |
| Notification | 알림 |

### RFQ 필드
- `orderSizeRange`: 평균 거래규모 (50만미만, 50~100만원, 100~300만원, 300만원이상)
- `orderFrequency`: 발주주기 (비정기, 주1회이상, 주2~3회, 월1~2회)
- `referenceImages`: 참고 이미지 (Base64 배열)

---

## 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 구매자 | buyer@test.com | Test1234! |
| 공급자 | supplier@test.com | Test1234! |
| 관리자 | odadmin@onthedeal.com | admin03532 |
| 관리자 | nqadmin@onthedeal.com | admin03532 |

---

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정 (.env.local)
```env
DATABASE_URL=prisma+postgres://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxx
TOSS_SECRET_KEY=test_sk_xxx
```

### 3. DB 설정
```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## 빌드 및 배포

```bash
# 빌드 테스트 (필수)
npm run build

# 의존성 재설치 (문제 발생 시)
rm -rf node_modules package-lock.json && npm install && npm ci
```

---

## 기능 요청 추적 (Feature Requests)

> 아래 목록은 요청된 기능들의 구현 상태를 추적합니다.

### 구현 완료
- [x] 크레딧 차감 기준 통일 (제안가 기준 3%)
- [x] 채팅에서 금액 수정 기능 (금액 증가 시 추가 차감)
- [x] 공급자 충전 요청 → 관리자 승인 시스템
- [x] 발주 목록에서 "구매희망가" → "납품정보(발주주기, 평균발주금액)" 변경

### 대기 중
- [ ] (추가될 기능들은 여기에 기록)

---

## 문의

- **이메일**: support@onthedeal.com
- **개발사**: (주) 티투알웍스

---

## 라이선스

© 2026 (주) 티투알웍스. All rights reserved.
