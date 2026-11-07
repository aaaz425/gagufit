"use client";

import { useState, type ReactNode } from "react";

export function IconButton({
  label,
  onClick,
  disabled,
  expanded,
  size = 44,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** 여닫는 창을 여는 버튼 */
  expanded?: boolean;
  size?: 40 | 44;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      aria-expanded={expanded}
      className={`flex shrink-0 items-center justify-center rounded-sm text-ink hover:bg-surface disabled:text-ink-subtle disabled:hover:bg-transparent ${
        size === 40 ? "size-10" : "size-11"
      }`}
    >
      {children}
    </button>
  );
}

/** 정수 입력 - 마칠 때(Enter·포커스 이동) 한 번 반영, Esc·잘못된 값은 되돌림 */
export function NumberField({
  label,
  unit,
  value,
  min = 0,
  max,
  onCommit,
}: {
  label: string;
  unit: string;
  value: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const finish = () => {
    if (draft === null) return;
    const n = Number(draft.trim());
    setDraft(null);
    if (draft.trim() === "" || !Number.isFinite(n)) return;
    let v = Math.round(n);
    v = Math.max(v, min);
    if (max !== undefined) v = Math.min(v, max);
    if (v !== value) onCommit(v);
  };

  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-muted">{label}</span>
      <span className="flex h-11 items-center rounded-sm border border-border bg-canvas px-3 focus-within:border-primary focus-within:outline focus-within:outline-1 focus-within:outline-primary">
        <input
          inputMode="numeric"
          className="w-full min-w-0 bg-transparent text-base font-medium text-ink tabular-nums outline-none"
          value={draft ?? String(value)}
          onFocus={(e) => {
            setDraft(String(value));
            e.currentTarget.select();
          }}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finish}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setDraft(null);
              // blur 때 finish가 draft null을 보고 무시
              requestAnimationFrame(() => e.currentTarget?.blur());
            }
          }}
        />
        <span className="ml-1 shrink-0 text-sm text-ink-muted">{unit}</span>
      </span>
    </label>
  );
}

/** 2D·3D, 문 종류 같은 둘 중 하나 고르기 */
export function Segment<T extends string>({
  options,
  value,
  onChange,
  label,
  full,
}: {
  /** unavailable - 흐리게 보이지만 눌러서 이유 안내 가능 */
  options: { value: T; label: string; unavailable?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  full?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex rounded-full bg-surface p-[3px] ${full ? "w-full" : ""}`}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-disabled={o.unavailable || undefined}
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center rounded-full px-4 text-[13px] ${
              full ? "min-h-10 flex-1" : "min-h-8"
            } ${
              on
                ? "bg-canvas font-bold text-ink shadow-raised"
                : `font-medium ${o.unavailable ? "text-ink-subtle" : "text-ink-muted"}`
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[13px] font-bold text-ink">{children}</h3>;
}
