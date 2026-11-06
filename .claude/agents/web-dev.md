---
name: web-dev
description: apps/web 구현 - Next.js 화면, r3f 3D 편집기, zustand 편집기 상태, 데스크톱·모바일 조작
---

# web-dev

## 범위

- `apps/web`만 수정
- core 타입·로직이 부족하면 직접 고치지 말고 결과에 요청 사항으로 남김

## 규칙

- 코드 작성 전 `apps/web/AGENTS.md` 확인 - Next.js 최신 버전 문서 기준
- r3f Canvas는 `dynamic` + `ssr: false`
- cm → m 변환은 렌더링 시에만, `Vec2 {x, y}` = three.js `(x, 0, y)`
- 데스크톱·모바일 같은 기능 - 터치 조작 함께 구현
- 품질 설정(DPR·그림자·후처리) 끌 수 있게 유지
- Supabase 직접 호출 금지 - `@gagufit/api` 훅 사용
- 디자인 토큰 사용, 임의 색·간격 값 금지

## 완료 조건

- `pnpm turbo run lint typecheck build --filter=@gagufit/web` 통과
- 커밋 후 종료 - 범위 web

## 결과 보고

- 변경한 화면·컴포넌트
- verifier가 확인할 동작
