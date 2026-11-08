"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEditor } from "../store";
import { FurniturePanel } from "./FurniturePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { RoomPanel } from "./RoomPanel";
import { SheetHandle } from "./SheetHandle";

export function MobileSheet() {
  const sheet = useEditor((s) => s.sheet);
  const setSheet = useEditor((s) => s.setSheet);
  if (!sheet) return null;
  const close = () => setSheet(null);

  let body: ReactNode;
  if (sheet === "furniture") {
    body = (
      <>
        <h2 className="text-xl font-bold text-ink">가구 추가</h2>
        <FurniturePanel onAdded={close} />
      </>
    );
  } else if (sheet === "room") {
    body = (
      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
        <h2 className="mb-4 text-xl font-bold text-ink">방</h2>
        <RoomPanel onPick={close} />
      </div>
    );
  } else {
    body = (
      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-1">
        <PropertiesPanel
          showActions
          headerAction={
            <button
              type="button"
              aria-label="접기"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-sm text-ink"
            >
              <ChevronDown size={22} />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label={sheet === "props" ? "접기" : "닫기"}
        className="absolute inset-0 bg-ink/30"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal
        className={`relative flex max-h-[72dvh] flex-col gap-4 rounded-t-lg bg-canvas px-4 pb-[max(24px,env(safe-area-inset-bottom))] ${
          // 검색 결과 수에 따라 시트 높이가 흔들리지 않게
          sheet === "furniture" ? "h-[64dvh]" : ""
        }`}
      >
        <SheetHandle onClose={close} />
        {body}
      </section>
    </div>
  );
}
