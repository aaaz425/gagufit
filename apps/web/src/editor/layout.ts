// 캔버스는 화면 전체, 패널은 그 위에 겹쳐 띄움 - 패널이 열리고 닫혀도 도면은 그대로
// 방 맞춤만 그 순간 패널에 가려진 만큼 비켜 계산

/** 화면 px */
export type Insets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export const PANEL_WIDTH = 300;
/** 접힌 왼쪽 패널 띠 폭 - 접기 탭이 띠 가장자리에 붙고, 폭은 기존 접힌 상태 유지 */
export const COLLAPSED_PANEL_WIDTH = 60;
/** 데스크톱 왼쪽 패널 접기 탭(손잡이)이 캔버스 위로 나오는 아래 끝 - top 12 + 44, 이 아래로 떠 있는 툴바를 둠 */
export const PANEL_TAB_BOTTOM = 56;
/** 모바일 하단 탭·속성 요약 높이 - 안전 영역 제외 */
const MOBILE_TABS_HEIGHT = 60;
const MOBILE_SUMMARY_HEIGHT = 108;

/** 보이는 영역 안쪽 여백 - 아래는 방 치수 표기·확대 버튼, 모바일은 아래 벽 문 툴바 자리 */
const FIT_MARGIN = {
  desktop: { side: 48, bottom: 96 },
  mobile: { side: 32, bottom: 80 },
};

export function canvasInsets({
  desktop,
  leftOpen,
  selected,
}: {
  desktop: boolean;
  leftOpen: boolean;
  selected: boolean;
}): Insets {
  if (desktop) {
    return {
      left: leftOpen ? PANEL_WIDTH : COLLAPSED_PANEL_WIDTH,
      right: selected ? PANEL_WIDTH : 0,
      top: 0,
      bottom: 0,
    };
  }
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: selected ? MOBILE_SUMMARY_HEIGHT : MOBILE_TABS_HEIGHT,
  };
}

/** 방 맞춤 여백 - 패널에 가려진 부분 + 보이는 영역 안쪽 여백 */
export function fitPadding(desktop: boolean, insets: Insets): Insets {
  const m = desktop ? FIT_MARGIN.desktop : FIT_MARGIN.mobile;
  return {
    left: insets.left + m.side,
    right: insets.right + m.side,
    top: insets.top + m.side,
    bottom: insets.bottom + m.bottom,
  };
}
