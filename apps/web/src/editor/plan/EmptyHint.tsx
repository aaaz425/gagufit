"use client";

import type { Vec2 } from "@gagufit/core";
import { Sofa } from "lucide-react";
import { useEditor } from "../store";

/** 빈 방 안내 - at은 화면 px 가운데 */
export function EmptyHint({ at, compact }: { at: Vec2; compact: boolean }) {
  const setPanel = useEditor((s) => s.setPanel);
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
        }}
      >
        가구 추가
      </button>
    </div>
  );
}
