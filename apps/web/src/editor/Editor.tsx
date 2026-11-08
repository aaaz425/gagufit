"use client";

import { FURNITURE_PRESETS } from "@gagufit/data";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Ruler,
  SearchX,
  SlidersHorizontal,
  Sofa,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { deleteSelected, displayAngle } from "./actions";
import { OPENING_LABELS, wallLabel } from "./labels";
import { loadRoom } from "./load-room";
import { FurniturePanel } from "./panels/FurniturePanel";
import { PropertiesPanel } from "./panels/PropertiesPanel";
import { OpeningIcon, RoomPanel } from "./panels/RoomPanel";
import { FurnitureThumb } from "./plan/FurnitureSymbol";
import { PlanCanvas } from "./plan/PlanCanvas";
import { useEditor, useRoom, type PanelTab } from "./store";
import { Toast } from "./Toast";
import { TopBar, ViewSwitch } from "./TopBar";
import { IconButton } from "./ui";
import { View3D } from "./View3D";

const DESKTOP_QUERY = "(min-width: 768px)";

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );
}

export function Editor({ roomId }: { roomId: string }) {
  const load = useEditor((s) => s.load);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );

  useEffect(() => {
    const room = loadRoom(roomId);
    if (room) load(room);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 3단계에서 비동기 불러오기로 바뀔 자리
    setStatus(room ? "ready" : "missing");
  }, [roomId, load]);

  if (status === "missing") return <NotFound />;
  if (status === "loading") return <div className="h-dvh bg-surface" />;
  return <EditorScreen />;
}

function NotFound() {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-canvas text-ink-muted shadow-raised">
        <SearchX size={28} aria-hidden />
      </span>
      <h1 className="text-lg font-bold text-ink">방을 찾을 수 없어요</h1>
      <p className="max-w-[300px] text-sm text-ink-muted">
        지워졌거나 다른 브라우저에서 만든 방일 수 있어요
      </p>
      <Link
        href="/rooms"
        className="flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        내 방 목록으로
      </Link>
    </main>
  );
}

function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (
        t instanceof Element &&
        t.closest("input, textarea, select, [contenteditable=true]")
      )
        return;
      const { undo, redo } = useEditor.getState();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (!useEditor.getState().selection) return;
        e.preventDefault();
        deleteSelected();
      } else if (e.key === "Escape") {
        useEditor.getState().select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function EditorScreen() {
  const desktop = useIsDesktop();
  const view = useEditor((s) => s.view);
  useShortcuts();

  const canvas = view === "2d" ? <PlanCanvas compact={!desktop} /> : <View3D />;

  if (desktop) {
    return (
      <div className="flex h-dvh flex-col bg-canvas">
        <TopBar compact={false} />
        <div className="flex min-h-0 flex-1">
          <LeftPanel />
          <main className="relative min-w-0 flex-1">
            {canvas}
            <Toast bottom={24} />
          </main>
          {/* 3D는 캔버스 폭이 바뀌면 방이 움직여 선택이 빗나가므로 자리를 늘 둠 */}
          <RightPanel keep={view === "3d"} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <TopBar compact />
      <main className="relative min-h-0 flex-1">
        {canvas}
        <Toast bottom={16} />
      </main>
      <MobileBottom />
      <MobileSheet />
    </div>
  );
}

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

function LeftPanel() {
  const panel = useEditor((s) => s.panel);
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <aside className="flex shrink-0 flex-col items-center border-r border-border p-2">
        <IconButton label="패널 펼치기" onClick={() => setOpen(true)}>
          <PanelLeftOpen size={20} />
        </IconButton>
      </aside>
    );
  }
  return (
    <aside className="flex w-[300px] shrink-0 flex-col gap-4 border-r border-border p-4">
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

/** keep - 선택이 없어도 자리 유지 */
function RightPanel({ keep }: { keep: boolean }) {
  const hasSelection = useEditor((s) => s.selection !== null);
  if (!hasSelection && !keep) return null;
  return (
    <aside
      aria-label="속성"
      className="w-[300px] shrink-0 overflow-y-auto border-l border-border p-6"
    >
      {hasSelection ? (
        <PropertiesPanel />
      ) : (
        <p className="pt-8 text-center text-sm text-ink-muted">
          가구를 누르면 속성이 보여요
        </p>
      )}
    </aside>
  );
}

function MobileBottom() {
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
        className="z-10 flex flex-col gap-2 rounded-t-lg bg-canvas px-4 pb-[max(16px,env(safe-area-inset-bottom))] shadow-floating"
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
      className="flex items-center gap-1 border-t border-border bg-canvas px-2 pt-1 pb-[max(4px,env(safe-area-inset-bottom))]"
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

/** 손잡이 - 누르거나 끌어 올리면 열고, onClose 있으면 끌어 내려 닫음 */
function SheetHandle({
  onOpen,
  onClose,
}: {
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const startY = useRef<number | null>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={onOpen ? "펼치기" : "접기"}
      className="-mb-2 flex h-11 shrink-0 cursor-grab touch-none items-center justify-center"
      onPointerDown={(e) => {
        startY.current = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        const start = startY.current;
        startY.current = null;
        if (start === null) return;
        const dy = e.clientY - start;
        if (onOpen && dy < 8) onOpen();
        if (onClose && dy > -8) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") (onOpen ?? onClose)?.();
      }}
    >
      <span className="h-1 w-9 rounded-full bg-border" />
    </div>
  );
}

function MobileSheet() {
  const sheet = useEditor((s) => s.sheet);
  const setSheet = useEditor((s) => s.setSheet);
  if (!sheet) return null;
  const close = () => setSheet(null);

  let body: ReactNode;
  if (sheet === "furniture") {
    body = (
      <>
        <h2 className="text-xl font-bold text-ink">가구 추가</h2>
        <FurniturePanel onAdded={close} />
      </>
    );
  } else if (sheet === "room") {
    body = (
      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4">
        <h2 className="mb-4 text-xl font-bold text-ink">방</h2>
        <RoomPanel onPick={close} />
      </div>
    );
  } else {
    body = (
      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 pb-1">
        <PropertiesPanel
          showActions
          headerAction={
            <button
              type="button"
              aria-label="접기"
              onClick={close}
              className="flex size-11 items-center justify-center rounded-sm text-ink"
            >
              <ChevronDown size={22} />
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-ink/30"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal
        className={`relative flex max-h-[72dvh] flex-col gap-4 rounded-t-lg bg-canvas px-4 pb-[max(24px,env(safe-area-inset-bottom))] ${
          // 검색 결과 수에 따라 시트 높이가 흔들리지 않게
          sheet === "furniture" ? "h-[64dvh]" : ""
        }`}
      >
        <SheetHandle onClose={close} />
        {body}
      </section>
    </div>
  );
}
