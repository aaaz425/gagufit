"use client";

import { SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { deleteSelected } from "./actions";
import { canvasInsets } from "./layout";
import { loadRoom } from "./load-room";
import { LeftPanel, RightPanel } from "./panels/DesktopPanels";
import { MobileBottom } from "./panels/MobileBottom";
import { MobileSheet } from "./panels/MobileSheet";
import { PlanCanvas } from "./plan/PlanCanvas";
import { useEditor } from "./store";
import { Toast } from "./Toast";
import { TopBar } from "./TopBar";
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
        const s = useEditor.getState();
        if (!s.selection || s.dragging) return;
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
  const selected = useEditor((s) => s.selection !== null);
  useShortcuts();

  const canvas =
    view === "2d" ? (
      <PlanCanvas compact={!desktop} />
    ) : (
      <View3D compact={!desktop} />
    );

  // 캔버스는 main 전체, 패널은 그 위에 겹쳐 띄움 - layout.ts
  if (desktop) {
    return (
      <div className="flex h-dvh flex-col bg-canvas">
        <TopBar compact={false} />
        <main className="relative min-h-0 flex-1">
          {canvas}
          <LeftPanel />
          <RightPanel />
          <Toast bottom={24} />
        </main>
      </div>
    );
  }
  const insets = canvasInsets({ desktop: false, leftOpen: false, selected });
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <TopBar compact />
      <main className="relative min-h-0 flex-1">
        {canvas}
        <MobileBottom />
        <Toast bottom={insets.bottom + 16} />
      </main>
      <MobileSheet />
    </div>
  );
}
