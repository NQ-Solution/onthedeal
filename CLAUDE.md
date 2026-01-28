# OnTheDeal 프로젝트 Claude 설정

## 프로젝트 개요
B2B 식자재 거래 플랫폼 - Next.js 14 + Prisma + PostgreSQL

## 빌드 및 배포 규칙

### Git Push 전 필수 확인사항
1. **npm ci 테스트 필수**: push 전에 반드시 `npm ci`가 정상 동작하는지 확인
2. **package-lock.json 동기화**: 의존성 변경 시 `rm -rf node_modules package-lock.json && npm install` 후 `npm ci` 테스트
3. **빌드 테스트**: `npm run build`가 성공하는지 확인

### 의존성 관리
- preact@10.11.3은 next-auth 의존성으로 명시적 추가됨 (삭제 금지)
- 새 패키지 설치 후 반드시 npm ci 테스트 수행

## 코드 규칙

### 테스트 계정 정보
- 구매자: buyer@test.com / Test1234!
- 공급자: supplier@test.com / Test1234!
- 관리자: odadmin@onthedeal.com, nqadmin@onthedeal.com / admin03532

### API 라우트
- 인증 필요한 API는 `getServerSession(authOptions)` 사용
- 동적 렌더링 필요 시 `export const dynamic = 'force-dynamic'` 추가

### 용어
- RFQ 대신 "발주" 사용
- 한국어 UI 우선

## 병렬 작업 설정

### 동시 실행 가능한 작업
- 여러 파일 읽기/검색
- 독립적인 API 테스트
- 타입 검사와 린트 동시 실행

### 순차 실행 필요한 작업
- npm install → npm ci 테스트 → git push
- DB 스키마 변경 → prisma generate → 빌드
- 파일 수정 → 빌드 테스트 → 커밋

## 자주 사용하는 명령어

```bash
# 의존성 재설치 (문제 발생 시)
rm -rf node_modules package-lock.json && npm install && npm ci

# 빌드 테스트
npm run build

# DB 시딩
npx prisma db seed

# Prisma 스키마 동기화
npx prisma generate
npx prisma db push
```

## 주의사항
- package-lock.json 수동 편집 금지
- node_modules 커밋 금지
- .env 파일 커밋 금지

## 코드 리뷰 체크리스트 (필수)

### 폼 제출 및 버튼 핸들러
- **모든 handleSubmit/onClick 핸들러가 실제 API를 호출하는지 확인**
- alert만 띄우거나 시뮬레이션만 하는 코드 금지
- mock 데이터 사용 시 TODO 주석으로 명시

### 크레딧 시스템
- **크레딧 차감은 제안 제출 시 1회만** (이중/삼중 차감 금지)
- 제안 수락 시: 선차감된 크레딧 유지, 미선정 공급자는 환불
- 제안 거절 시: 크레딧 환불 처리
- 채팅방 만료 시: 크레딧 환불 처리 (cron API: /api/cron/expire-chats)

### 알림 시스템
- 모든 중요 이벤트에 알림 생성 확인:
  - 제안 제출 → 구매자/공급자 알림
  - 제안 수락/거절 → 공급자 알림 + 크레딧 변동 알림
  - 크레딧 충전 → 공급자 알림
  - 주문 상태 변경 → 양쪽 알림
  - 채팅방 만료 → 양쪽 알림
- 알림에 적절한 link 경로 포함

### API 응답
- 성공 시: 의미있는 데이터 반환
- 실패 시: 명확한 에러 메시지 + 필요한 정보 (예: 필요 크레딧, 현재 크레딧)

### 페이지별 확인
- buyer/rfqs/[id] - 실제 API로 제안 수락/거절
- supplier/rfqs/[id] - 실제 API로 제안 제출
- contact - 실제 API로 문의 접수
- 모든 새 발주/제안/주문 생성 페이지 - 실제 API 호출

## 크레딧 흐름 정리

```
1. 공급자 제안 제출
   └─ 크레딧 3% 선차감 (quotes POST)
   └─ 채팅방 생성 (3일 만료)

2-A. 구매자가 수락
   └─ 선차감 크레딧 유지 (추가 차감 없음)
   └─ 미선정 공급자들 크레딧 환불
   └─ 주문 생성

2-B. 구매자가 거절
   └─ 공급자 크레딧 환불

2-C. 3일 후 만료 (cron)
   └─ 공급자 크레딧 환불
   └─ 채팅방 상태 expired로 변경
```

## Cron 작업
- `/api/cron/expire-chats`: 만료된 채팅방 처리 + 크레딧 환불
- 환경변수: CRON_SECRET 설정 필요
- Vercel Cron 또는 외부 서비스로 주기적 호출 필요
