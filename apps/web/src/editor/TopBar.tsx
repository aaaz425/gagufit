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
import { useState } from "react";
import { warningBadgeLabel } from "./labels";
import { useEditor, useRoom, warningsOf } from "./store";
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
        compact ? "h-[52px] gap-1.5 px-2" : "h-[60px] gap-3.5 px-4"
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
      {/* 저장 상태 자리 - 3단계 */}
      <span className="min-w-0 flex-1" />
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
      {warnings.length > 0 && (
        <span
          role="status"
          aria-label={warningBadgeLabel(warnings)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-danger-soft px-2.5 py-[5px] text-xs font-bold text-danger tabular-nums"
        >
          <TriangleAlert size={14} aria-hidden />
          {compact ? warnings.length : warningBadgeLabel(warnings)}
        </span>
      )}
      {!compact && <ViewSwitch />}
      {/* 설정 창 - 병합 후 연결 */}
      <IconButton label="설정">
        <Settings size={compact ? 22 : 20} />
      </IconButton>
    </header>
  );
}

export function ViewSwitch() {
  const view = useEditor((s) => s.view);
  const setView = useEditor((s) => s.setView);
  return (
    <Segment
      label="보기"
      value={view}
      onChange={setView}
      options={[
        { value: "2d", label: "2D" },
        // 3D 보기 병합 후 연결
        { value: "3d", label: "3D", disabled: true },
      ]}
    />
  );
}

/** 바로 입력 - Enter·바깥 누르면 저장, Esc 취소, 빈 이름은 이전 이름 */
function RoomName() {
  const room = useRoom();
  const update = useEditor((s) => s.update);
  const [draft, setDraft] = useState<string | null>(null);

  const save = () => {
    if (draft === null) return;
    const name = draft.trim();
    setDraft(null);
    if (name && name !== room.name)
      update({ ...useEditor.getState().history.present, name });
  };

  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(room.name)}
        title="방 이름 바꾸기"
        className="min-w-0 truncate rounded-sm px-1 py-1 text-left text-base font-bold text-ink hover:bg-surface"
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
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setDraft(null);
      }}
      className="h-10 w-full max-w-60 min-w-0 rounded-sm border-2 border-primary bg-canvas px-2 text-base font-bold text-ink outline-none"
    />
  );
}
