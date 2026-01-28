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
