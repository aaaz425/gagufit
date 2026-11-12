"use client";

import { FURNITURE_PRESETS } from "@gagufit/data";
import { CirclePlus, Search } from "lucide-react";
import { useState } from "react";
import { addPresetToRoom } from "../actions";
import { CATEGORY_GROUPS } from "../labels";
import { FurnitureThumb } from "../plan/FurnitureSymbol";
import { TOUCH_44 } from "../ui";

/** 검색창 id - 빈 방 안내가 찾아 포커스 */
export const FURNITURE_SEARCH_ID = "furniture-search";

const PRESETS = Object.values(FURNITURE_PRESETS);

/** 검색·칩은 위에 고정, 목록만 스크롤 - 부모가 높이를 정해야 함 */
export function FurniturePanel({ onAdded }: { onAdded?: () => void }) {
  const [group, setGroup] = useState(0);
  const [query, setQuery] = useState("");
  const categories = CATEGORY_GROUPS[group].categories;
  const words = query.trim().replace(/\s+/g, "");
  const list = PRESETS.filter(
    (p) =>
      (!categories || categories.includes(p.category)) &&
      (!words || p.name.replace(/\s+/g, "").includes(words)),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <label className="flex h-11 shrink-0 items-center gap-2 rounded-sm border border-border bg-canvas px-3 focus-within:border-primary focus-within:outline focus-within:outline-1 focus-within:outline-primary">
        <Search size={16} className="shrink-0 text-ink-muted" aria-hidden />
        <input
          id={FURNITURE_SEARCH_ID}
          type="search"
          aria-label="가구 검색"
          placeholder="가구 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
        />
      </label>
      <div className="-mx-4 flex shrink-0 [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-2 md:mx-0 md:flex-wrap md:px-0">
        {CATEGORY_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            aria-pressed={i === group}
            onClick={() => setGroup(i)}
            className={`h-8 shrink-0 rounded-full px-3 text-sm ${TOUCH_44} ${
              i === group
                ? "bg-primary-soft font-bold text-primary"
                : "border border-border bg-surface font-medium text-ink-muted hover:text-ink"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
        {list.map((preset) => (
          <li key={preset.id}>
            <button
              type="button"
              onClick={() => {
                addPresetToRoom(preset);
                onAdded?.();
              }}
              className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-surface"
            >
              <FurnitureThumb category={preset.category} size={preset.size} />
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-ink">
                  {preset.name}
                </span>
                <span className="text-xs text-ink-muted tabular-nums">
                  {preset.size.width} × {preset.size.depth} cm
                </span>
              </span>
              <CirclePlus
                size={22}
                className="shrink-0 text-primary"
                aria-hidden
              />
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="py-6 text-center text-sm text-ink-muted">
            찾는 가구가 없어요
          </li>
        )}
      </ul>
    </div>
  );
}
