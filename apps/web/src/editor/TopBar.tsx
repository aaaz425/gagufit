"use client";

import { history } from "@gagufit/core";
import {
  ChevronLeft,
  Redo2,
  Settings,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { usePresence } from "@/motion";
import { warningBadgeLabel } from "./labels";
import { SettingsPopover } from "./SettingsPopover";
import {
  currentRoom,
  useEditor,
  useRoom,
  warningsOf,
  type SaveStatus,
} from "./store";
import { isWebGLAvailable } from "./webgl";
import { IconButton, Segment } from "./ui";

const NAME_MAX = 20;

export function TopBar({ compact }: { compact: boolean }) {
  const room = useRoom();
  const canUndo = useEditor((s) => history.canUndo(s.history));
  const canRedo = useEditor((s) => history.canRedo(s.history));
  const undo = useEditor((s) => s.undo);
  const redo = useEditor((s) => s.redo);
  const warnings = warningsOf(room);

  return (
    <header
      className={`flex shrink-0 items-center border-b border-border bg-canvas ${
        compact ? "h-13 gap-1 px-2" : "h-15 gap-3 px-4"
      }`}
    >
      <Link
        href="/rooms"
        aria-label="내 방 목록으로"
        title="내 방 목록으로"
        className="flex size-11 shrink-0 items-center justify-center rounded-sm text-ink hover:bg-surface"
      >
        <ChevronLeft size={compact ? 22 : 20} />
      </Link>
      <RoomName />
      <SaveState compact={compact} />
      <div className="flex items-center">
        <IconButton
          label="실행 취소"
          onClick={undo}
          disabled={!canUndo}
          size={compact ? 44 : 40}
        >
          <Undo2 size={20} />
        </IconButton>
        <IconButton
          label="다시 실행"
          onClick={redo}
          disabled={!canRedo}
          size={compact ? 44 : 40}
        >
          <Redo2 size={20} />
        </IconButton>
      </div>
      {/* 배지가 생기고 없어져도 옆 버튼이 밀리지 않게 자리 고정 */}
      <span
        role="status"
        className={`flex shrink-0 ${compact ? "w-14" : "w-26"}`}
      >
        {warnings.length > 0 && (
          <span
            aria-label={warningBadgeLabel(warnings)}
            className="flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold whitespace-nowrap text-danger tabular-nums"
          >
            <TriangleAlert size={14} aria-hidden />
            {compact ? warnings.length : warningBadgeLabel(warnings)}
          </span>
        )}
      </span>
      {!compact && <ViewSwitch />}
      <SettingsButton compact={compact} />
    </header>
  );
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  saved: "저장됨",
  unsaved: "저장 중…",
  saving: "저장 중…",
  failed: "저장 실패",
};

function SaveState({ compact }: { compact: boolean }) {
  const status = useEditor((s) => s.saveStatus);
  return (
    <span
      role="status"
      className={`min-w-0 flex-1 truncate text-xs ${
        status === "failed" ? "font-semibold text-danger" : "text-ink-muted"
      }`}
    >
      {status === "failed" && !compact
        ? "저장 실패 - 다시 시도 중"
        : SAVE_LABELS[status]}
    </span>
  );
}

const noSubscribe = () => () => {};

export function ViewSwitch() {
  const view = useEditor((s) => s.view);
  const setView = useEditor((s) => s.setView);
  const showToast = useEditor((s) => s.showToast);
  // 서버·hydration 중에는 false로 그리고 바로 실제 값으로
  const webgl = useSyncExternalStore(
    noSubscribe,
    isWebGLAvailable,
    () => false,
  );
  return (
    <Segment
      toggle
      label={view === "2d" ? "3D로 보기" : "2D로 보기"}
      value={view}
      onChange={(next) => {
        if (next === "3d" && !webgl) {
          showToast({
            message: "이 브라우저에서는 3D를 쓸 수 없어 2D로 보여드려요",
          });
          return;
        }
        setView(next);
      }}
      options={[
        { value: "2d", label: "2D" },
        { value: "3d", label: "3D", unavailable: !webgl },
      ]}
    />
  );
}

function SettingsButton({ compact }: { compact: boolean }) {
  const [open, setOpen] = useState(false);
  const { mounted, exiting } = usePresence(open);
  return (
    <div className="relative">
      <IconButton
        label="설정"
        expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Settings size={compact ? 22 : 20} />
      </IconButton>
      {mounted && (
        <SettingsPopover exiting={exiting} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

/** 바로 입력 - Enter·바깥 누르면 저장, Esc 취소, 빈 이름은 이전 이름 */
function RoomName() {
  const room = useRoom();
  const update = useEditor((s) => s.update);
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);

  const save = () => {
    if (draft === null) return;
    const name = draft.trim();
    setDraft(null);
    if (name && name !== room.name) update({ ...currentRoom(), name });
  };

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(room.name)}
        title="방 이름 바꾸기"
        className="h-11 min-w-0 truncate rounded-sm px-1 text-left text-base font-bold text-ink hover:bg-surface"
      >
        {room.name}
      </button>
    );
  }
  return (
    <input
      autoFocus
      aria-label="방 이름"
      maxLength={NAME_MAX}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => {
        if (cancelled.current) cancelled.current = false;
        else save();
      }}
      onKeyDown={(e) => {
        // 저장은 blur 한 곳에서만
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
          setDraft(null);
        }
      }}
      className="h-10 w-full max-w-60 min-w-0 rounded-sm border-2 border-primary bg-canvas px-2 text-base font-bold text-ink outline-none"
    />
  );
}
