"use client";

import { FURNITURE_PRESETS } from "@gagufit/data";
import { Ruler, SlidersHorizontal, Sofa } from "lucide-react";
import type { ReactNode } from "react";
import { displayAngle } from "../actions";
import { OPENING_LABELS, wallLabel } from "../labels";
import { FurnitureThumb } from "../plan/FurnitureSymbol";
import { useEditor, useRoom, type PanelTab } from "../store";
import { ViewSwitch } from "../TopBar";
import { OpeningIcon } from "./RoomPanel";
import { SheetHandle } from "./SheetHandle";

export function MobileBottom() {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const setSheet = useEditor((s) => s.setSheet);
  const setPanel = useEditor((s) => s.setPanel);

  if (selection) {
    let icon: ReactNode = null;
    let title = "";
    let detail = "";
    if (selection.kind === "furniture") {
      const f = room.furniture.find((item) => item.id === selection.id);
      const preset = f && FURNITURE_PRESETS[f.presetId];
      if (f) {
        icon = (
          <FurnitureThumb category={preset?.category} size={f.size} px={44} />
        );
        title = preset?.name ?? "가구";
        detail = `${f.size.width} × ${f.size.depth} cm · ${displayAngle(f.rotation)}°`;
      }
    } else {
      const o = room.openings.find((item) => item.id === selection.id);
      if (o) {
        icon = (
          <span className="flex size-11 items-center justify-center rounded-md bg-primary-soft text-primary">
            <OpeningIcon opening={o} size={22} />
          </span>
        );
        title = OPENING_LABELS[o.kind];
        detail = `${o.width} cm · ${wallLabel(o.wall)}`;
      }
    }
    return (
      <section
        aria-label="선택한 대상"
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 rounded-t-lg bg-canvas px-4 pb-[max(16px,env(safe-area-inset-bottom))] shadow-floating"
      >
        <SheetHandle onOpen={() => setSheet("props")} />
        <div className="flex items-center gap-3">
          {icon}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-base font-bold text-ink">{title}</p>
            <p className="text-sm text-ink-muted tabular-nums">{detail}</p>
          </div>
          <button
            type="button"
            onClick={() => setSheet("props")}
            className="flex h-11 items-center gap-2 rounded-sm bg-primary-soft px-4 text-sm font-bold text-primary"
          >
            <SlidersHorizontal size={16} aria-hidden />
            치수
          </button>
        </div>
      </section>
    );
  }

  const open = (panel: PanelTab) => {
    setPanel(panel);
    setSheet(panel);
  };
  return (
    <nav
      aria-label="편집 메뉴"
      className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-1 border-t border-border bg-canvas px-2 pt-1 pb-[max(4px,env(safe-area-inset-bottom))]"
    >
      <TabButton
        icon={<Sofa size={20} aria-hidden />}
        onClick={() => open("furniture")}
      >
        가구
      </TabButton>
      <TabButton
        icon={<Ruler size={20} aria-hidden />}
        onClick={() => open("room")}
      >
        방
      </TabButton>
      <span className="flex-1" />
      <ViewSwitch />
    </nav>
  );
}

function TabButton({
  icon,
  onClick,
  children,
}: {
  icon: ReactNode;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-sm px-3 text-xs font-semibold text-ink"
    >
      {icon}
      {children}
    </button>
  );
}
