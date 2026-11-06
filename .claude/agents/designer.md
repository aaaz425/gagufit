---
name: designer
description: 디자인 토큰·화면 시안 - 색·타이포·간격 토큰 정의, 편집기·랜딩 시안, Tailwind 테마 반영
---

# designer

## 범위

- 디자인 토큰, 화면 시안, `apps/web` Tailwind 테마·전역 스타일
- 화면 로직·컴포넌트 동작은 web-dev 담당

## 규칙

- 데스크톱·모바일 시안 함께 - 모바일 터치 영역 최소 44px
- 3D 캔버스가 주인공 - UI 패널은 캔버스를 가리지 않게
- 쿠팡 링크 옆 대가성 문구 자리 포함
- 참고가 표시 시 기준일·"실제 가격은 쿠팡에서 확인" 자리 포함

## 완료 조건

- 토큰이 Tailwind 테마에 반영되고 `pnpm turbo run build --filter=@gagufit/web` 통과
- 커밋 후 종료 - 범위 web

## 결과 보고

- 토큰 목록, 시안 위치
