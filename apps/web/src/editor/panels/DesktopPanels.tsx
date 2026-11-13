"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { CSSProperties } from "react";
import { COLLAPSED_PANEL_WIDTH, PANEL_WIDTH } from "../layout";
import { useEditor, type PanelTab } from "../store";
import { FurniturePanel } from "./FurniturePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import { RoomPanel } from "./RoomPanel";

function PanelTabs() {
  const panel = useEditor((s) => s.panel);
  const setPanel = useEditor((s) => s.setPanel);
  const tabs: { value: PanelTab; label: string }[] = [
    { value: "furniture", label: "가구" },
    { value: "room", label: "방" },
  ];
  return (
    <div role="tablist" className="flex rounded-sm bg-surface p-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={panel === t.value}
          onClick={() => setPanel(t.value)}
          className={`h-9 flex-1 rounded-sm text-sm ${
            panel === t.value
              ? "bg-canvas font-bold text-ink shadow-raised"
              : "font-medium text-ink-muted hover:text-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function LeftPanel() {
  const panel = useEditor((s) => s.panel);
  const open = useEditor((s) => s.leftOpen);
  const setOpen = useEditor((s) => s.setLeftOpen);
  const Icon = open ? PanelLeftClose : PanelLeftOpen;
  return (
    // 항상 PANEL_WIDTH - 접으면 왼쪽으로 밀어 오른쪽 COLLAPSED_PANEL_WIDTH만 띠로 남김, 여닫는 탭은 가장자리에 붙어 같이 움직임
    <aside
      className={`motion-side absolute inset-y-0 left-0 z-10 border-r border-border bg-canvas transition-transform duration-(--duration-slow) ${
        open
          ? "ease-enter"
          : "-translate-x-[calc(var(--panel-width)-var(--panel-collapsed))] ease-exit"
      }`}
      style={
        {
          width: PANEL_WIDTH,
          "--panel-width": `${PANEL_WIDTH}px`,
          "--panel-collapsed": `${COLLAPSED_PANEL_WIDTH}px`,
        } as CSSProperties
      }
    >
      <div
        inert={!open}
        className={`flex h-full flex-col gap-4 p-4 transition-opacity duration-(--duration-base) ${
          open ? "ease-enter" : "opacity-0 ease-exit"
        }`}
      >
        <PanelTabs />
        {panel === "furniture" ? (
          <FurniturePanel />
        ) : (
          <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
            <RoomPanel />
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={open ? "패널 접기" : "패널 펼치기"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="absolute top-3 left-full flex size-11 items-center justify-center rounded-r-md border border-l-0 border-border bg-canvas text-ink-muted hover:bg-surface hover:text-ink"
      >
        <Icon size={20} />
      </button>
    </aside>
  );
}

export function RightPanel() {
  const selection = useEditor((s) => s.selection);
  if (!selection) return null;
  return (
    <aside
      // 대상이 바뀌면 새로 그려 스크롤을 맨 위로
      key={selection.id}
      aria-label="속성"
      className="absolute inset-y-0 right-0 z-10 overflow-y-auto border-l border-border bg-canvas p-4"
      style={{ width: PANEL_WIDTH }}
    >
      <PropertiesPanel />
    </aside>
  );
}
