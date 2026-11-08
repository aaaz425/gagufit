"use client";

import { useRef } from "react";

/** 손잡이 - 누르거나 끌어 올리면 열고, onClose 있으면 끌어 내려 닫음 */
export function SheetHandle({
  onOpen,
  onClose,
}: {
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const startY = useRef<number | null>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={onOpen ? "펼치기" : "접기"}
      className="-mb-2 flex h-11 shrink-0 cursor-grab touch-none items-center justify-center"
      onPointerDown={(e) => {
        startY.current = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        const start = startY.current;
        startY.current = null;
        if (start === null) return;
        const dy = e.clientY - start;
        if (onOpen && dy < 8) onOpen();
        if (onClose && dy > -8) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") (onOpen ?? onClose)?.();
      }}
    >
      <span className="h-1 w-9 rounded-full bg-border" />
    </div>
  );
}
