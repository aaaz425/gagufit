"use client";

import type { Vec2 } from "@gagufit/core";
import { Sofa } from "lucide-react";
import { FURNITURE_SEARCH_ID } from "../panels/FurniturePanel";
import { useEditor } from "../store";

/** 검색창 포커스 + 패널 배경 잠깐 강조 */
function highlightFurniturePanel() {
  const input = document.getElementById(FURNITURE_SEARCH_ID);
  if (!input) return;
  input.focus();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // 키프레임에 var() 미지원 브라우저 있음
  const soft = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-primary-soft")
    .trim();
  input
    .closest("aside")
    ?.animate(
      [{ backgroundColor: soft }, { backgroundColor: soft, offset: 0.5 }, {}],
      { duration: 1500, easing: "ease-out" },
    );
}

/** 빈 방 안내 - at은 화면 px 가운데 */
export function EmptyHint({ at, compact }: { at: Vec2; compact: boolean }) {
  const setPanel = useEditor((s) => s.setPanel);
  const setLeftOpen = useEditor((s) => s.setLeftOpen);
  const setSheet = useEditor((s) => s.setSheet);
  return (
    <div
      className="absolute flex w-60 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-md bg-canvas p-4 text-center shadow-floating"
      style={{ left: at.x, top: at.y }}
    >
      <Sofa size={28} className="text-primary" aria-hidden />
      <p className="text-base font-bold text-ink">아직 가구가 없어요</p>
      <p className="text-xs text-ink-muted">가구를 골라 방에 놓아 보세요</p>
      <button
        type="button"
        className="h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        onClick={() => {
          setPanel("furniture");
          if (compact) setSheet("furniture");
          else setLeftOpen(true);
          // 패널이 그려진 뒤, 모바일은 키보드가 시트를 가려서 제외
          if (!compact) requestAnimationFrame(highlightFurniturePanel);
        }}
      >
        가구 추가
      </button>
    </div>
  );
}
