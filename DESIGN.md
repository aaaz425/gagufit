---
version: "1"
name: gagufit
description: 원룸 가구 배치 시뮬레이터 - 친근한 소비자 앱, 편집기에서는 방과 가구가 주인공
colors:
  primary: "#0B7D61"
  primary-hover: "#096A52"
  primary-soft: "#E6F4EF"
  primary-inverse: "#7FD6B9"
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
  scene-furniture: "#D4C3AA"
  scene-furniture-line: "#B5A285"
  scene-furniture-soft: "#C8B597"
  scene-rug: "#E6D6BF"
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

확정 - `docs/design/gagufit.pen`

- 디자인 시스템 - 토큰 보드, 컴포넌트 보드
- 하이파이 시안 - H1~H16 화면
- 값이 다르면 이 문서가 기준

## 성격

- 자취 준비생이 부담 없이 쓰는 친근한 소비자 앱
- 따뜻한 크림 바탕, 딥 그린 브랜드색 하나, 단정한 모서리(8·12px), 넉넉한 여백
- 편집기에서는 UI가 물러나고 방과 가구가 주인공 - 브랜드색은 버튼·선택 표시에만
- 치수를 믿고 쓰는 도구 - 숫자는 또렷하게, 단위 항상 표기
- 평면도로 정확하게 놓고 3D로 둘러보는 흐름 - 2D는 도면처럼 또렷하게, 색감은 3D와 맞춤

## 색

- `primary` - 주요 버튼, 선택된 가구 외곽선, 활성 탭, 링크
- `primary-soft` - 선택 항목 배경, 활성 칩
- `primary-inverse` - 어두운 바탕(토스트) 위 동작 글자, `ink` 위 9.2:1
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
  - tonal - `primary-soft` 배경 `primary` 글자, 보조 동작(90° 회전 등)
  - 아이콘 버튼 - 44px 정사각, ghost
- 입력 - `canvas` 배경, `border` 외곽선, 포커스 시 `primary` 2px
  - 치수 입력은 오른쪽에 단위 고정 표시
  - 검색 입력은 왼쪽 search 아이콘
- 칩 - 카테고리, on `primary-soft` + `primary` 글자, off `surface` + `ink-muted`
- 로고 - `primary` 바탕 `sm` 사각형 안 흰 armchair 아이콘 + "gagufit" 800
- 상단 내비 - 글자 링크를 1px `border` 세로선으로 구분, 현재 화면만 `ink` 700
- 방 카드 - 탑뷰 썸네일 + 이름 + 수정일, `raised`, 누르면 편집기
- 새 방 카드 - `primary` 1.5px 외곽선, `primary-soft` 원 안 plus
- 세그먼트 - 2D·3D 전환, `surface` 바탕에 선택 항목 `canvas` + `raised`
- 선택 툴바 - 선택한 가구 위 떠 있는 `full` 모양, 44px 아이콘 버튼 묶음, 삭제만 `danger`
- 가구 항목 - 썸네일 + 이름 + 치수 + `primary` circle-plus
- 경고 안내 - 속성 패널 안, `danger-soft` 배경 + 이유 한 줄
- 설정 행 - 라벨·설명 + 오른쪽 토글·값·화살표, `border` 구분
- 메뉴 - `canvas` + `border` + `floating`, 항목 40px, 삭제만 `danger`
- 토스트 - `ink` 바탕 흰 글자 + `primary-inverse` 동작, 화면 아래 가운데
- 확인 모달 - 제목에 대상 이름, 결과 한 줄, 오른쪽 취소·확인, 지우기는 `danger`
- 패널 - 데스크톱 좌·우 고정, `canvas` 배경, `border` 구분
- 바텀시트 - 모바일 패널, 손잡이 표시, 위로 끌어 확장
- 모달 - 템플릿 선택, 모바일은 전체 화면
- 경고 배지 - 상단 바 경고 개수, `danger-soft` 배경 `danger` 글자
- 토글 - 켜짐 `primary`, 꺼짐 `border`

## 상호작용 상태

- 상호작용 요소는 커서·hover·focus-visible·disabled 네 가지 필수
- 기본 커서·focus-visible 외곽선은 `globals.css` base가 처리 - 개별 지정 금지
  - 누를 수 있는 요소 `pointer`, disabled·`aria-disabled` `not-allowed`
    - 예외 - 눌러서 이유를 안내하는 unavailable 옵션은 `pointer`
  - focus-visible - `primary` 2px 외곽선, 간격 2px
- hover - 배경 `surface`(primary 버튼 `primary-hover`, 삭제 `danger-soft`), 배경 없는 글자는 `ink`로
  - tonal - `primary` 배경 흰 글자
  - 토글 - 켜짐 `primary-hover`, 꺼짐 `primary-soft`
  - danger 버튼 - `danger-soft` 배경 `danger` 글자
  - 어두운 바탕(토스트) 위 동작 - `canvas` 10% 배경
- disabled - `surface` 배경 `ink-subtle` 글자, hover 효과 없음
- 2D 평면 커서

| 대상            | 기본               | 끌기 중     |
| --------------- | ------------------ | ----------- |
| 가구·문·창문    | `grab`             | `grabbing`  |
| 빈 바닥         | `grab`             | `grabbing`  |
| 회전 핸들       | 회전 아이콘        | 회전 아이콘 |
| 문·창문 폭 핸들 | 벽 방향 `*-resize` | 같은 커서   |

- 폭 핸들은 화면 회전 반영 - 벽이 가로면 `ew-resize`, 세로면 `ns-resize`, 대각선이면 `nwse`·`nesw`
- 핀치·휠은 커서 변화 없음
- 3D - 선택 가능한 가구 위 `pointer`, 빈 곳은 기본

## 편집기 규칙

- 선택 - `primary` 바깥 외곽선 3px + `selection` 4px 번짐 + 회전 핸들
  - 크림색 가구 위에서도 보이게 하는 보완, 두께 줄이지 않기
- 경고 - `danger` 외곽선 2px + `danger` 28% 덧칠(몸체 색 유지), 선택과 겹치면 경고 우선
- 드래그 중 - 벽까지 거리 치수 가이드, `ink-muted` 가는 선 + caption 숫자
- 품질 끄기 - 그림자·후처리 없이도 가구 구분되게 외곽선 유지
- 바닥 패턴 - 재질별 옅은 선·점(마루 널 15cm, 타일 줄눈 60·30cm, 장판·카펫 점), 줄 불투명도 16% 이하
  - 격자는 50cm 교차점 십자만 - 패턴 선과 겹치지 않게
  - 줌 아웃해 패턴 간격이 화면 5px 아래면 생략, 격자 십자는 줌 0.5 미만에서 생략
- 가구 그림자 - 몸체 아래 `scene-wall` 16%, 왼쪽 위 빛 기준 화면 오른쪽 아래로 3·4px, 화면을 돌려도 방향 고정, 러그·행거(속이 비침) 제외
- 가구 질감 - 3D 재질 따라 나무 결·패브릭 점무늬를 14% 이하로 몸체 위에, 가전은 없음, 어두운 몸체는 밝은 선
  - 줌 아웃하면 서서히 사라짐
- 문·창문 - 여닫이는 부채꼴 + 문짝 선 + 경첩 점, 창문은 살 세 줄

## 가구 탑뷰

- 기호 16종 - 침대, 책상, 의자, 소파, 식탁, 옷장, 서랍장, 책장, 행거, TV장, 협탁, 화장대, 냉장고, 세탁기, 러그, 기타
- 시안 - `docs/design/gagufit.pen`의 가구 평면 기호 16종
- 위쪽이 등·벽 쪽, 아래쪽이 앞 - 회전해도 앞방향이 보이게
- 몸체 고른 색 대표색 - 외곽선·장식은 몸체 밝기에서 도출: 밝은 색은 어둡게, 어두운 색(차콜·월넛)은 밝게
  - 색 없는 카탈로그 썸네일만 `scene-furniture` 기본색, 선은 `scene-furniture-line` 1px·장식은 흰색 50%
- 침대 이불 몸체와 살짝 다른 명도, 폭 120cm 미만이면 베개 1개
- 러그 고른 색(기본 `scene-rug`), 외곽선 없이 안쪽 테두리 - 다른 가구 아래에 깔림
- 장식은 실제 치수에 맞춰 늘이고 몸체 모서리 4px 유지
- 이름은 선택했을 때만 - 속성 패널·선택 툴바 근처

## 3D 보기

- 카메라 - 위 45° 내려다보기로 시작, 방 전체가 화면에 들어오게
  - 끌어서 회전, 휠·두 손가락 확대, 시점 리셋 버튼, 바닥 아래로 못 내려감
  - 방 안 1인칭 보기는 2차
- 벽 - 카메라 쪽 벽 두 면을 90cm 높이로 자동으로 낮춤, 낮춘 벽에도 문·창문 위치 표시
- 재질 - 사실적 PBR
  - 바닥·벽은 고른 재질 텍스처, 가구는 종류별 재질(나무·패브릭·가전) + 고른 색
  - 텍스처는 CC0만(ambientCG, Poly Haven), 출처 기록
- 가구 모델 - 상자 대신 둥근 모서리, 종류별 다리·쿠션·손잡이·머리판·책, 모두 입력한 크기 안에서 늘어남
- 조명 - 환경광 + 창문 쪽 따뜻한 햇빛 1개 + 반대편 약한 보조광, 그림자는 품질 설정 켤 때만
  - 톤 매핑 Neutral - 고른 색이 본래 색에 가깝게
  - 환경 반사 - 코드로 만든 작은 환경맵, 파일·네트워크 없음
  - 배경 - `canvas`에서 `surface`로 옅은 세로 그라데이션
- 접지 그림자 - 가구 아래 부드러운 그림자, 품질과 무관하게 항상(그림자 켜면 옅게), 러그 제외
- 가구 윤곽선 - 품질 설정과 무관하게 항상 얇은 `ink-muted` 색 선, 꺼도 가구끼리·바닥과 구분
- 방 마감 - 걸레받이(문 자리 제외), 창문 틀·유리·턱, 문 틀·문짝·손잡이
- 품질 끄기 - 고해상도 끄면 DPR 1·텍스처 512px, 그림자·후처리 없음
- 선택 - 가구 `primary` 외곽선, 경고 - `danger` 반투명 덧칠
- 문 열림 영역 - 바닥에 부채꼴 표시, 2D와 같은 색

## 재질·색

- 바닥 6 - 밝은 마루, 진한 마루, 회색 타일, 흰 타일, 장판, 카펫
- 벽 6 - 흰 페인트, 웜 베이지, 연회색, 실크 도배, 줄무늬 도배, 콘크리트
- 가구 색 7 - 화이트, 오크, 월넛, 그레이, 차콜, 베이지 패브릭, 그린 패브릭
- 기본 - 밝은 마루, 흰 페인트, 가구는 종류별 기본색
- 2D - 바닥·가구 모두 고른 재질·색의 대표색으로 칠함, 외곽선·장식은 도면처럼 유지
- 견본 - 재질 칩 56px `md` 모서리, 색 칩 32px 원, 선택은 `primary` 2px + `selection`

## 반응형

- 768px 미만 모바일 - 하단 탭 + 바텀시트
- 768px 이상 데스크톱 - 좌·우 패널
- 랜딩 본문 최대 폭 1120px
- 약관 본문 폭 720px - 모바일은 좌우 16px 여백

## 푸터·약관·공유 이미지

- 푸터 - 링크 줄 + 대가성 문구 한 줄, 모든 화면 같은 형태
  - 대가성 문구 - `caption` `ink-muted`, "이 사이트는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있어요"
- 약관 - 제목(`title-lg`, 모바일 20px) + 시행일 + 조항 나열, 목차 없음
  - 조항 제목 20px 600(모바일 16px 700), 본문 16px 줄간격 1.7(모바일 14px)
- 설정 창 - 전체 설정 아래 이용약관·개인정보처리방침 `caption` 링크
- 공유 이미지 - 1200×630, `surface` 바탕, 로고 + 한 줄 소개 + 방 탑뷰 도형, 이미지 파일 없음

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
