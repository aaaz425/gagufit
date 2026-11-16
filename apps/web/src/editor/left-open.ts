import { useSyncExternalStore } from "react";
import { PANEL_WIDTH } from "./layout";
import { useEditor } from "./store";

/** 양쪽 패널이 열렸을 때 남아야 하는 캔버스 폭 px - 이보다 좁으면 왼쪽 패널을 자동으로 접음 */
const MIN_CANVAS_WIDTH = 480;
const NARROW_QUERY = `(max-width: ${2 * PANEL_WIDTH + MIN_CANVAS_WIDTH - 1}px)`;

const subscribeNarrow = (onChange: () => void) => {
  const mq = window.matchMedia(NARROW_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;

/**
 * 왼쪽 패널이 실제로 펼쳐진 상태
 * 사용자가 접었으면 접힘, 좁은 화면에서 오른쪽 패널이 열리면 자동 접힘 - 선택 중 사용자가 펴면 유지
 */
export function leftPanelOpen({
  leftOpen,
  pinned,
  selected,
  narrow,
}: {
  leftOpen: boolean;
  pinned: boolean;
  selected: boolean;
  narrow: boolean;
}): boolean {
  return leftOpen && (pinned || !(selected && narrow));
}

export function useLeftOpen(): boolean {
  const leftOpen = useEditor((s) => s.leftOpen);
  const pinned = useEditor((s) => s.leftPinned);
  const selected = useEditor((s) => s.selection !== null);
  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  return leftPanelOpen({ leftOpen, pinned, selected, narrow });
}

/** 선택해서 오른쪽 패널이 열린 순간의 왼쪽 패널 상태 - 방 맞춤 기준 */
export function leftOpenWhenSelected(): boolean {
  const s = useEditor.getState();
  return leftPanelOpen({
    leftOpen: s.leftOpen,
    pinned: s.leftPinned,
    selected: true,
    narrow: isNarrow(),
  });
}
