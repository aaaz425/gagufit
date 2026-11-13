"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { QUALITY_KEYS, QUALITY_ROWS, useQualitySettings } from "./quality";
import { Switch } from "./ui";

/** 상단 바 설정 버튼 아래 작은 창 - 바깥 누르거나 Esc면 닫힘 */
export function SettingsPopover({
  exiting,
  onClose,
}: {
  exiting: boolean;
  onClose: () => void;
}) {
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
      data-exiting={exiting || undefined}
      className="motion-menu absolute top-full right-0 z-30 mt-1 flex w-[min(320px,calc(100vw-16px))] flex-col rounded-md border border-border bg-canvas px-4 pt-2 pb-3 shadow-floating"
    >
      <h2 className="pt-1 text-sm font-bold text-ink-muted">화면 품질</h2>
      {QUALITY_KEYS.map((key) => {
        const row = QUALITY_ROWS[key];
        const on = quality[key];
        return (
          <label
            key={key}
            className="flex items-center gap-3 border-b border-border py-3 last-of-type:border-b-0"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-base font-medium text-ink">
                {row.label}
              </span>
              {row.hint && (
                <span className="text-xs text-ink-muted">{row.hint}</span>
              )}
            </span>
            <Switch on={on} onChange={(v) => setQuality({ [key]: v })} />
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
      <nav
        aria-label="약관"
        className="flex items-center justify-center gap-2.5 pt-2.5 pb-0.5 text-xs text-ink-muted"
      >
        <Link href="/terms">이용약관</Link>
        <span aria-hidden className="h-2.5 w-px bg-border" />
        <Link href="/privacy">개인정보처리방침</Link>
      </nav>
    </div>
  );
}
