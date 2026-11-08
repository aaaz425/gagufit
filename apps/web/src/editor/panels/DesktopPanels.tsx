"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { COLLAPSED_PANEL_WIDTH, PANEL_WIDTH } from "../layout";
import { useEditor, type PanelTab } from "../store";
import { IconButton } from "../ui";
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
    <div role="tablist" className="flex flex-1 rounded-sm bg-surface p-1">
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
              : "font-medium text-ink-muted"
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
  if (!open) {
    return (
      <aside
        className="absolute inset-y-0 left-0 z-10 flex flex-col items-center border-r border-border bg-canvas p-2"
        style={{ width: COLLAPSED_PANEL_WIDTH }}
      >
        <IconButton label="패널 펼치기" onClick={() => setOpen(true)}>
          <PanelLeftOpen size={20} />
        </IconButton>
      </aside>
    );
  }
  return (
    <aside
      className="absolute inset-y-0 left-0 z-10 flex flex-col gap-4 border-r border-border bg-canvas p-4"
      style={{ width: PANEL_WIDTH }}
    >
      <div className="flex items-center gap-2">
        <PanelTabs />
        <IconButton label="패널 접기" onClick={() => setOpen(false)}>
          <PanelLeftClose size={20} />
        </IconButton>
      </div>
      {panel === "furniture" ? (
        <FurniturePanel />
      ) : (
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
          <RoomPanel />
        </div>
      )}
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
