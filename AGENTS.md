# AGENTS.md

3D 방 배치 시뮬레이터

## 스택

- pnpm + Turborepo 모노레포
- Next.js App Router, TypeScript, Tailwind
- r3f + drei
- zustand 편집기 상태, TanStack Query 서버 상태
- Supabase 익명 로그인 → 카카오 linkIdentity
- Vercel 시작, AWS 이전 가능하게 유지

## 구조

```
apps/web         Next.js, 편집기
apps/mobile      Expo WebView 예정
packages/core    순수 TS 타입·로직
packages/data    가구 프리셋, 방 템플릿
packages/api     Supabase 호출, Query 훅
packages/config  공용 설정
supabase/        마이그레이션 SQL
```

## 규칙

- core에서 React·Next.js·three.js import 금지, 테스트 필수
- api에서 React DOM·Next.js import 금지 - 앱에서도 사용
- Supabase 호출은 api에서만
- DB 변경은 `supabase/migrations` SQL로만
- 저장 구조 변경 시 `schemaVersion` 올리고 마이그레이션 추가
- Vercel 전용 기능·Edge 런타임 금지
- 길이 cm 정수, 렌더링 시에만 m 변환
- 평면 `Vec2 {x, y}` = three.js `(x, 0, y)`, `rotation` = `rotation.y`
- 가격 출처 구분 - 판매처 참고가(`offers[].price` + `checkedAt`), 사용자 입력가(배치 가구별), 견적은 사용자 입력 우선
- 참고가 표시 시 기준일·"실제 가격은 쿠팡에서 확인" 함께
- 품질 설정(DPR·그림자·후처리) 끌 수 있게 유지 - 저사양 노트북
- 쿠팡 링크 옆 대가성 문구 필수, 크롤링 금지
- 화면은 `DESIGN.md` 토큰·컴포넌트 기준 - 시안 `docs/design/gagufit.pen`

## 코드

- 주석은 코드로 안 보이는 것만 - 단위, 좌표 규칙, 저장 데이터 주의, 이유
  - 한 줄로 짧게, 마침표 없이
  - 공통 규칙(단위·좌표)은 한 곳에만 - 반복 금지
- 목록 데이터는 id를 키로 쓰는 객체 - 빠진 항목은 타입 검사로 잡기
- 테스트는 공개 동작과 경계 값만
  - 타입이 보장하는 것, 데이터 값 나열 검사 금지
  - 같은 종류 실패 경우는 대표 하나

## 작업

- 더 간단한 방법이 있으면 그걸로 - 코드·문서 공통
- 확장이 확실하면 미리 대비 - 구현의 간단함과 충돌 시 확인
- 기능마다 계획 한 번 확인 후 PR 초안까지 진행 - `/feature`
- 요청 범위 밖 수정 금지
- 커밋은 요청 없이 - 논리적 변경 하나 단위로
- 커밋·PR 제목: Conventional Commits, 범위는 패키지명(web, core 등), 한국어
- 브랜치: main 직접 푸시 금지, `feat/*` `fix/*` `chore/*` → PR → squash merge
- PR은 초안 확인 후 생성, 머지는 사용자만 - `/pr`
- PR 본문은 변경 핵심만, 부연·파일 경로 나열 없이
- ADR은 되돌리기 어려운 구조 결정만 - `/adr`

## 문서

- 두괄식 개조식, 마침표·군더더기 없이, 대시는 `-`만
- 문서는 성격 하나만 - PRD에 데이터 모델 등 섞지 않기
- 평이한 표현으로 짧게 - 과한 수식어·낯선 단어 금지
- 문서 안 존댓말 금지

## 에이전트

- `.claude/agents` - core-dev, web-dev, api-dev, designer, verifier, reviewer
- 메인 세션은 PM - 분배·병합·중계, 병렬 작업은 worktree
