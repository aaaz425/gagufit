---
version: "1"
name: gagufit
description: 원룸 가구 배치 시뮬레이터 - 친근한 소비자 앱, 편집기에서는 방과 가구가 주인공
colors:
  primary: "#0B7D61"
  primary-hover: "#096A52"
  primary-soft: "#E6F4EF"
  ink: "#1F2328"
  ink-muted: "#5B616E"
  ink-subtle: "#8A909C"
  canvas: "#FFFFFF"
  surface: "#F8F6F2"
  border: "#E9E5DF"
  danger: "#C8343A"
  danger-soft: "#FCEBEC"
  scene-floor: "#F1E8DA"
  scene-wall: "#3D3A36"
  scene-grid: "#E2D7C6"
  scene-furniture: "#D4C3AA"
typography:
  font-family: "Pretendard Variable, Pretendard, -apple-system, system-ui, sans-serif"
  display:
    { fontSize: 40px, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.8px }
  title-lg:
    { fontSize: 28px, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.4px }
  title:
    { fontSize: 20px, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.2px }
  body: { fontSize: 16px, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }
  body-sm:
    { fontSize: 14px, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 }
  label: { fontSize: 14px, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 }
  caption:
    { fontSize: 12px, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 }
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  section: 64px
shadow:
  raised: "0 1px 2px rgba(31,35,40,0.06), 0 2px 8px rgba(31,35,40,0.06)"
  floating: "0 4px 12px rgba(31,35,40,0.08), 0 12px 32px rgba(31,35,40,0.12)"
  selection: "0 0 0 4px rgba(11,125,97,0.2)"
---

# gagufit DESIGN

확정 - 하이파이 시안은 `docs/design/gagufit.pen`의 H 화면

## 성격

- 자취 준비생이 부담 없이 쓰는 친근한 소비자 앱
- 따뜻한 크림 바탕, 딥 그린 브랜드색 하나, 단정한 모서리(8·12px), 넉넉한 여백
- 편집기에서는 UI가 물러나고 방과 가구가 주인공 - 브랜드색은 버튼·선택 표시에만
- 치수를 믿고 쓰는 도구 - 숫자는 또렷하게, 단위 항상 표기

## 색

- `primary` - 주요 버튼, 선택된 가구 외곽선, 활성 탭, 링크
- `primary-soft` - 선택 항목 배경, 활성 칩
- `ink` 본문, `ink-muted` 보조 문구·저장 상태, `ink-subtle` 비활성·placeholder 전용
- `canvas` 기본 배경, `surface` 패널·카드 영역 구분, `border` 구분선
- `danger` - 겹침·벽 밖 이탈 경고, 삭제
  - 경고 외의 장식에 빨간 계열 금지 - 경고가 묻힘
- `scene-*` - 2D 탑뷰·3D 씬 기본색
  - 3D는 three.js 재질에 같은 값 사용 - 웹 코드 상수로 공유
- 대비 - 본문·버튼 글자 4.5:1 이상, `primary` 위 흰 글자 5.1:1
  - 가구 위 `primary` 선은 3:1 미만 - 선택 표시는 편집기 규칙대로 보완
- 토큰은 역할 이름으로만 사용 - 다크 모드는 나중에 값만 추가

## 글꼴

- Pretendard 하나로 전체 - npm `pretendard` 자체 호스팅, dynamic subset, CDN 금지
  - Pencil 시안은 Google Fonts만 돼서 Noto Sans KR로 대신 표시
- `display`·`title-lg` 랜딩 전용, 앱 화면은 `title` 이하
- 입력창 글자 16px 이상 - iOS 확대 방지
- 치수·각도·가격 숫자는 `tabular-nums`, 단위 붙여 표기 - `120 × 60 cm`, `90°`

## 아이콘

- Lucide(`lucide-react`)만 사용, 선 굵기 기본 2
- 크기 - 버튼 안 20px, 작은 툴바·칩 16px
- 아이콘만 있는 버튼은 `aria-label` 필수

## 간격·모양

- 4px 단위
- 모서리 - 버튼·입력 `sm`, 카드·패널 `md`, 바텀시트 위쪽·모달 `lg`, 칩·배지·선택 툴바 `full`
- 그림자 - 카드 `raised`, 캔버스 위 툴바·바텀시트·모달 `floating`
  - 패널은 그림자 없이 `border`로 구분
- 터치 대상 44px 이상

## 컴포넌트

- 버튼
  - 높이 44px, 데스크톱 보조 버튼만 36px 허용
  - primary - `primary` 배경 흰 글자, 화면당 하나
  - secondary - `canvas` 배경 `border` 외곽선
  - ghost - 배경 없음, 아이콘 버튼·툴바
  - danger - 삭제 확인에만
- 입력 - `canvas` 배경, `border` 외곽선, 포커스 시 `primary` 2px
  - 치수 입력은 오른쪽에 단위 고정 표시
- 로고 - `primary` 바탕 `sm` 사각형 안 흰 armchair 아이콘 + "gagufit" 800
- 상단 내비 - 글자 링크를 1px `border` 세로선으로 구분, 현재 화면만 `ink` 700
- 방 카드 - 탑뷰 썸네일 + 이름 + 수정일, `raised`, 누르면 편집기
- 새 방 카드 - `primary` 1.5px 외곽선, `primary-soft` 원 안 plus
- 세그먼트 - 2D·3D 전환, `surface` 바탕에 선택 항목 `canvas` + `raised`
- 선택 툴바 - 선택한 가구 위 떠 있는 `full` 모양, ghost 아이콘 버튼 묶음
- 패널 - 데스크톱 좌·우 고정, `canvas` 배경, `border` 구분
- 바텀시트 - 모바일 패널, 손잡이 표시, 위로 끌어 확장
- 모달 - 템플릿 선택, 모바일은 전체 화면
- 경고 배지 - 상단 바 경고 개수, `danger-soft` 배경 `danger` 글자
- 토글 - 켜짐 `primary`, 꺼짐 `border`

## 편집기 규칙

- 선택 - `primary` 바깥 외곽선 3px + `selection` 4px 번짐 + 회전 핸들
  - 크림색 가구 위에서도 보이게 하는 보완, 두께 줄이지 않기
- 경고 - `danger` 외곽선 2px + `danger-soft` 채움, 선택과 겹치면 경고 우선
- 드래그 중 - 벽까지 거리 치수 가이드, `ink-muted` 가는 선 + caption 숫자
- 품질 끄기 - 그림자·후처리 없이도 가구 구분되게 외곽선 유지

## 반응형

- 768px 미만 모바일 - 하단 탭 + 바텀시트
- 768px 이상 데스크톱 - 좌·우 패널
- 랜딩 본문 최대 폭 1120px

## 쿠팡·가격 표시 - 2차

- 대가성 문구 - 쿠팡 링크 바로 옆, `caption` `ink-muted`, 접기·숨김 금지
- 참고가 - 기준일과 "실제 가격은 쿠팡에서 확인" 함께, 사용자 입력가와 구분 표시

## 카카오 로그인 - 2차

- 카카오 가이드 색 그대로 - `#FEE500` 바탕, `#191919` 글자·심볼, 토큰 아님

## 하지 말 것

- 편집기 UI에 브랜드색 넓게 칠하기 - 가구와 경쟁
- 그라데이션·유리 효과 - 저사양 부담, 성격과 안 맞음
- 단위 없는 숫자
- 토큰 밖 임의 색·간격
