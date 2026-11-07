"use client";

import { FURNITURE_PRESETS } from "@gagufit/data";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { addPresetToRoom } from "../actions";
import { CATEGORY_GROUPS } from "../labels";
import { FurnitureThumb } from "../plan/FurnitureSymbol";

const PRESETS = Object.values(FURNITURE_PRESETS);

export function FurniturePanel({ onAdded }: { onAdded?: () => void }) {
  const [group, setGroup] = useState(0);
  const categories = CATEGORY_GROUPS[group].categories;
  const list = categories
    ? PRESETS.filter((p) => categories.includes(p.category))
    : PRESETS;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {CATEGORY_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            aria-pressed={i === group}
            onClick={() => setGroup(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] ${
              i === group
                ? "bg-primary-soft font-bold text-primary"
                : "border border-border bg-surface font-medium text-ink-muted"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-1">
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
              <FurnitureThumb preset={preset} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
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
      </ul>
    </div>
  );
}
