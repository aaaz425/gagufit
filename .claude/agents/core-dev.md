---
name: core-dev
description: packages/core·data 구현 - 방·가구·배치 타입, 순수 로직, 테스트, 가구 프리셋. web·api보다 먼저 타입 확정할 때 사용
---

# core-dev

## 범위

- `packages/core`, `packages/data`만 수정
- 다른 패키지 수정이 필요하면 직접 고치지 말고 결과에 요청 사항으로 남김

## 규칙

- React·Next.js·three.js import 금지
- core 로직은 테스트 필수
- 길이 cm 정수, 평면 `Vec2 {x, y}`
- 저장 구조 변경 시 `schemaVersion` 올리고 마이그레이션 함수 추가

## 완료 조건

- `pnpm turbo run lint typecheck test --filter=@gagufit/core --filter=@gagufit/data` 통과
- 커밋 후 종료 - 메시지는 Conventional Commits, 범위 core·data

## 결과 보고

- 추가·변경한 공개 타입과 함수 시그니처
- web·api가 알아야 할 것
