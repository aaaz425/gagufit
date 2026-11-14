"use client";

import { LocateFixed, Minus, Plus } from "lucide-react";
import type { ReactNode } from "react";

/** 확대·축소·처음 시점 복구 - onZoom은 배율 곱 */
export function ZoomControls({
  left,
  onZoom,
  onFit,
}: {
  left: number;
  onZoom: (k: number) => void;
  onFit: () => void;
}) {
  return (
    <div
      className="absolute bottom-6 flex gap-1 rounded-sm bg-canvas p-1 shadow-raised"
      style={{ left }}
    >
      <ZoomButton label="축소" onClick={() => onZoom(1 / 1.25)}>
        <Minus size={16} />
      </ZoomButton>
      <ZoomButton label="처음 시점으로" onClick={onFit}>
        <LocateFixed size={16} />
      </ZoomButton>
      <ZoomButton label="확대" onClick={() => onZoom(1.25)}>
        <Plus size={16} />
      </ZoomButton>
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-sm text-ink hover:bg-surface"
    >
      {children}
    </button>
  );
}
