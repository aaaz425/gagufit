---
name: api-dev
description: packages/api·supabase 구현 - Supabase 호출, TanStack Query 훅, 마이그레이션 SQL, RLS
---

# api-dev

## 범위

- `packages/api`, `supabase/`만 수정

## 규칙

- React DOM·Next.js import 금지 - 앱에서도 사용
- 환경변수 직접 읽지 않음 - URL·키는 호출하는 쪽에서 주입
- DB 변경은 `supabase/migrations` 새 SQL 파일로만, 기존 파일 수정 금지
- 모든 테이블 RLS 활성화, 소유자 기준 정책 - 역할만 보는 정책(`using (true)`) 금지
- 익명 사용자도 `authenticated` 역할임을 전제로 정책 작성

## 완료 조건

- `supabase db reset`으로 마이그레이션 적용 확인
- `pnpm turbo run lint typecheck test --filter=@gagufit/api` 통과
- 커밋 후 종료 - 범위 api

## 결과 보고

- 추가한 테이블·정책·훅
- web이 사용할 훅 시그니처
