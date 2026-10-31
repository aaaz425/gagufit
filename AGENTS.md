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

## 작업
- 더 간단한 방법이 있으면 그걸로 - 코드·문서 공통
- 확장이 확실하면 미리 대비 - 구현의 간단함과 충돌 시 확인
- 단계마다 계획 확인 후 코드
- 요청 범위 밖 수정 금지
- 커밋은 요청 시에만
- 문서는 두괄식 개조식, 마침표·군더더기 없이, 대시는 `-`만
