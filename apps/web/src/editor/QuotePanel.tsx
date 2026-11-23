"use client";

import { useProducts } from "@gagufit/api";
import { quoteRoom, type Quote, type QuoteItem } from "@gagufit/core";
import { FURNITURE_COLORS, presetOf } from "@gagufit/data";
import { ChevronDown, Receipt } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePresence } from "@/motion";
import { placedName } from "./labels";
import { FurnitureThumb } from "./plan/FurnitureSymbol";
import { useEditor, useRoom } from "./store";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 방 견적 - 상품 참고가는 방과 따로 불러오므로 도착하면 다시 계산 */
export function useQuote(): { quote: Quote; loading: boolean } {
  const room = useRoom();
  const { data, isPending } = useProducts();
  const products = useMemo(
    () => Object.fromEntries((data ?? []).map((p) => [p.id, p])),
    [data],
  );
  const quote = useMemo(() => quoteRoom(room, products), [room, products]);
  return { quote, loading: isPending };
}

/** 상단 바 견적 알약 - 데스크톱은 아래 팝오버, 모바일은 바텀시트 */
export function QuoteButton({ compact }: { compact: boolean }) {
  const room = useRoom();
  const { quote } = useQuote();
  const setSheet = useEditor((s) => s.setSheet);
  const sheetOpen = useEditor((s) => s.sheet === "quote");
  const [popover, setPopover] = useState(false);
  const { mounted, exiting } = usePresence(popover);
  const open = compact ? sheetOpen : popover;

  if (room.furniture.length === 0) return null;
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`견적 ${won(quote.total)}`}
        onClick={() =>
          compact ? setSheet(sheetOpen ? null : "quote") : setPopover((v) => !v)
        }
        className={`flex shrink-0 items-center gap-1.5 rounded-full text-sm font-bold whitespace-nowrap tabular-nums ${
          compact ? "h-10 px-3" : "h-9 px-3"
        } ${
          open
            ? "bg-primary-soft text-primary"
            : "border border-border bg-canvas text-ink hover:bg-surface"
        }`}
      >
        <Receipt size={16} aria-hidden />
        {compact ? won(quote.total) : `견적 ${won(quote.total)}`}
        {!compact && <ChevronDown size={16} aria-hidden />}
      </button>
      {!compact && mounted && (
        <QuotePopover exiting={exiting} onClose={() => setPopover(false)} />
      )}
    </div>
  );
}

function QuotePopover({
  exiting,
  onClose,
}: {
  exiting: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // 알약까지 포함한 부모 기준 - 알약 누름은 알약이 처리
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
      aria-label="견적"
      data-exiting={exiting || undefined}
      className="motion-menu absolute top-full right-0 z-30 mt-1 flex max-h-[min(560px,calc(100dvh-80px))] w-[min(380px,calc(100vw-16px))] flex-col gap-3 rounded-md border border-border bg-canvas p-4 shadow-floating"
    >
      <QuoteBody />
    </div>
  );
}

const SOURCE_TAG: Record<QuoteItem["source"], { text: string; cls: string }> = {
  own: { text: "내 가격", cls: "bg-primary-soft text-primary" },
  ref: {
    text: "참고가",
    cls: "border border-border bg-surface text-ink-muted",
  },
  none: {
    text: "가격 없음",
    cls: "border border-dashed border-border text-ink-subtle",
  },
};

/** 합계·구성·가구별 읽기 전용 목록 - 행을 누르면 그 가구 선택 */
export function QuoteBody({ onPick }: { onPick?: () => void }) {
  const room = useRoom();
  const select = useEditor((s) => s.select);
  const selection = useEditor((s) => s.selection);
  const { quote, loading } = useQuote();
  const { counts } = quote;
  const furniture = new Map(room.furniture.map((f) => [f.id, f]));

  return (
    <>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-ink">견적 합계</h2>
        <p className="text-xl font-bold text-ink tabular-nums">
          {won(quote.total)}
        </p>
      </div>
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted tabular-nums">
        {counts.own > 0 && (
          <span className="flex items-center gap-1">
            <span aria-hidden className="size-2 rounded-full bg-primary" />내
            가격 {counts.own}
          </span>
        )}
        {counts.ref > 0 && (
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="size-2 rounded-full bg-scene-furniture-line"
            />
            참고가 {counts.ref}
          </span>
        )}
        {counts.none > 0 && (
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="size-2 rounded-full border-[1.5px] border-ink-subtle"
            />
            가격 없음 {counts.none}
          </span>
        )}
      </p>
      <ul className="-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-1">
        {quote.items.map((item) => {
          const f = furniture.get(item.furnitureId);
          if (!f) return null;
          const on = selection?.kind === "furniture" && selection.id === f.id;
          const tag = SOURCE_TAG[item.source];
          return (
            <li key={f.id} className="border-t border-border first:border-t-0">
              <button
                type="button"
                aria-current={on || undefined}
                onClick={() => {
                  select({ kind: "furniture", id: f.id });
                  onPick?.();
                }}
                className={`flex min-h-12 w-full items-center gap-2 rounded-sm px-1 py-1 text-left ${
                  on ? "bg-primary-soft" : "hover:bg-surface"
                }`}
              >
                <FurnitureThumb
                  category={presetOf(f.presetId)?.category}
                  size={f.size}
                  color={FURNITURE_COLORS[f.color].hex}
                  px={32}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1">
                    <span className="truncate text-sm font-semibold text-ink">
                      {placedName(f)}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-1.5 text-[11px] font-bold ${tag.cls}`}
                    >
                      {tag.text}
                    </span>
                  </span>
                  <span className="text-xs text-ink-muted tabular-nums">
                    {f.size.width} × {f.size.depth} cm
                  </span>
                </span>
                <span
                  className={`shrink-0 text-sm tabular-nums ${
                    item.source === "none"
                      ? "font-medium text-ink-subtle"
                      : "font-bold text-ink"
                  }`}
                >
                  {item.source === "none" ? "가격 없음" : won(item.price)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {loading && counts.none > 0 && (
        <p role="status" className="text-xs text-ink-muted">
          상품 참고가를 불러오는 중이에요
        </p>
      )}
      {quote.refCheckedAt && (
        <p className="rounded-sm bg-surface px-3 py-2 text-xs leading-[1.4] text-ink-muted">
          참고가 {counts.ref}건은{" "}
          <span className="tabular-nums">{quote.refCheckedAt}</span> 기준이에요
          <br />
          실제 가격은 쿠팡에서 확인
        </p>
      )}
    </>
  );
}
