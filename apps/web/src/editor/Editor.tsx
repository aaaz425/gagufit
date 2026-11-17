"use client";

import { useRoomQuery, type RoomRecord } from "@gagufit/api";
import { CloudOff, SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { cycleFurnitureId } from "@gagufit/core";
import { deleteSelected, nudgeSelected } from "./actions";
import { furnitureName } from "./labels";
import { canvasInsets } from "./layout";
import { LeftPanel, RightPanel } from "./panels/DesktopPanels";
import { MobileBottom } from "./panels/MobileBottom";
import { MobileSheet } from "./panels/MobileSheet";
import { PlanCanvas } from "./plan/PlanCanvas";
import { readBackup } from "./save-backup";
import { useEditor } from "./store";
import { Toast } from "./Toast";
import { TopBar } from "./TopBar";
import { useAutoSave } from "./useAutoSave";
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
  const showToast = useEditor((s) => s.showToast);
  const query = useRoomQuery(roomId);
  // 서버에 있는 방 - 불러온 뒤 한 번만 정함, 이후 쿼리 상태는 무시
  const [baseline, setBaseline] = useState<RoomRecord | null>(null);

  const record = query.data;
  // 캐시된 이전 값이 아니라 새로 받은 값으로 열기
  const fresh = query.isSuccess && !query.isFetching;
  useEffect(() => {
    if (baseline || !fresh || !record) return;
    // 보관 뒤 서버가 바뀌지 않았으면 저장 못 한 보관본으로 열고 바로 저장
    const backup = readBackup(roomId);
    const restore = backup !== null && backup.base === record.updatedAt;
    load(restore ? backup.room : record.room);
    if (restore) showToast({ message: "저장하지 못한 변경을 되살렸어요" });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 불러온 방을 스토어에 옮긴 뒤 화면을 여는 신호
    setBaseline(record);
  }, [baseline, fresh, record, roomId, load, showToast]);

  if (baseline) return <EditorScreen roomId={roomId} baseline={baseline} />;
  if (query.isError) return <LoadError onRetry={() => query.refetch()} />;
  if (fresh && record === null) return <NotFound />;
  return <div className="h-dvh bg-surface" />;
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-canvas text-ink-muted shadow-raised">
        <CloudOff size={28} aria-hidden />
      </span>
      <h1 className="text-lg font-bold text-ink">방을 불러오지 못했어요</h1>
      <p className="max-w-[300px] text-sm text-ink-muted">
        인터넷 연결을 확인하고 다시 시도해 주세요
      </p>
      <div className="flex gap-2">
        <Link
          href="/rooms"
          className="flex h-11 items-center rounded-sm border border-border bg-canvas px-5 text-sm font-semibold text-ink"
        >
          내 방 목록으로
        </Link>
        <button
          type="button"
          onClick={onRetry}
          className="h-11 rounded-sm bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
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

/** 방향키 화면 방향 - 오른쪽·아래가 양수 */
const ARROW: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};
/** Tab 정류장 - 2D·3D 캔버스 */
const CANVAS_SELECTOR = "[data-editor-canvas]";
const ARROW_OWNERS = '[role="slider"], [role="tablist"], [role="radiogroup"]';

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
      } else if (e.key === "Tab" && !mod && !e.altKey) {
        // 캔버스에 포커스가 있을 때만 - 그 밖은 기본 Tab 순서
        if (!(t instanceof Element && t.matches(CANVAS_SELECTOR))) return;
        const s = useEditor.getState();
        if (s.dragging) {
          e.preventDefault();
          return;
        }
        const list = s.history.present.furniture;
        const sel = s.selection?.kind === "furniture" ? s.selection.id : null;
        const i = list.findIndex((f) => f.id === sel);
        // 처음·끝에서는 기본 Tab으로 캔버스를 빠져나감
        if (e.shiftKey ? i === 0 : i === list.length - 1) return;
        const id = cycleFurnitureId(
          s.history.present,
          sel,
          e.shiftKey ? -1 : 1,
        );
        if (!id) return;
        e.preventDefault();
        s.select({ kind: "furniture", id });
      } else if (e.key in ARROW && !mod && !e.altKey) {
        const s = useEditor.getState();
        if (s.selection?.kind !== "furniture" || s.dragging) return;
        // 슬라이더·탭 등은 방향키를 자기 조작에 씀
        if (t instanceof Element && t.closest(ARROW_OWNERS)) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const [x, y] = ARROW[e.key];
        nudgeSelected(x * step, y * step);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function EditorScreen({
  roomId,
  baseline,
}: {
  roomId: string;
  baseline: RoomRecord;
}) {
  const desktop = useIsDesktop();
  useAutoSave(roomId, baseline);
  const view = useEditor((s) => s.view);
  const selected = useEditor((s) => s.selection !== null);
  useShortcuts();

  const announce = useEditor((s) => {
    const sel = s.selection;
    return sel?.kind === "furniture"
      ? `${furnitureName(s.history.present, sel.id)} 선택됨`
      : "";
  });

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
        <main className="relative min-h-0 flex-1 overflow-x-clip">
          {canvas}
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
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
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
        <MobileBottom />
        <Toast bottom={insets.bottom + 16} />
      </main>
      <MobileSheet />
    </div>
  );
}
