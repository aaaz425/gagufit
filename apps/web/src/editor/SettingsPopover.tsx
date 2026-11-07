"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQualitySettings, type QualitySettings } from "./quality";

const ROWS: { key: keyof QualitySettings; label: string; hint?: string }[] = [
  { key: "hiDpi", label: "고해상도", hint: "끄면 저사양에서 부드러워요" },
  { key: "shadows", label: "그림자" },
  { key: "post", label: "후처리 효과" },
];

/** 상단 바 설정 버튼 아래 작은 창 - 바깥 누르거나 Esc면 닫힘 */
export function SettingsPopover({ onClose }: { onClose: () => void }) {
  const [quality, setQuality] = useQualitySettings();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 설정 버튼까지 포함한 부모 기준 - 버튼 누름은 버튼이 처리
    const area = ref.current?.parentElement;
    const onPointer = (e: PointerEvent) => {
      if (area && !area.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="화면 품질"
      className="absolute top-full right-0 z-30 mt-1 flex w-[min(320px,calc(100vw-16px))] flex-col rounded-md border border-border bg-canvas px-4 pt-2 pb-3 shadow-floating"
    >
      <h2 className="pt-1 text-[13px] font-bold text-ink-muted">화면 품질</h2>
      {ROWS.map((row) => {
        const on = quality[row.key];
        return (
          <label
            key={row.key}
            className="flex cursor-pointer items-center gap-3 border-b border-border py-3 last-of-type:border-b-0"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-medium text-ink">
                {row.label}
              </span>
              {row.hint && (
                <span className="text-xs text-ink-muted">{row.hint}</span>
              )}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => setQuality({ [row.key]: !on })}
              className={`flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px] ${
                on ? "justify-end bg-primary" : "justify-start bg-border"
              }`}
            >
              <span className="size-5 rounded-full bg-canvas" />
            </button>
          </label>
        );
      })}
      <hr className="border-border" />
      <Link
        href="/settings"
        className="flex h-10 items-center justify-between text-sm font-semibold text-primary"
      >
        전체 설정
        <ArrowRight size={16} aria-hidden />
      </Link>
      <p className="hidden text-xs text-ink-subtle md:block">
        실행 취소 ⌘Z · 다시 실행 ⇧⌘Z
      </p>
    </div>
  );
}
