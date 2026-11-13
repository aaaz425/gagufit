"use client";

import type { RoomSummary } from "@gagufit/api";
import { MoreVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePresence } from "@/motion";
import { RoomThumb } from "./RoomThumb";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function modifiedLabel(iso: string, now: number): string {
  const diff = now - Date.parse(iso);
  if (diff < MINUTE) return "방금 수정";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}분 전 수정`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}시간 전 수정`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}일 전 수정`;
  return `${new Date(iso).toLocaleDateString("ko")} 수정`;
}

export function RoomCard({
  summary,
  now,
  onDelete,
}: {
  summary: RoomSummary;
  now: number;
  onDelete: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const { mounted, exiting } = usePresence(menu);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <div className="motion-item relative rounded-md bg-canvas shadow-raised transition-shadow duration-(--duration-fast) ease-enter hover:shadow-floating">
      <Link
        href={`/rooms/${summary.id}`}
        className="flex flex-col gap-3 rounded-md p-3"
      >
        <span className="block aspect-4/3 overflow-hidden rounded-sm bg-surface">
          <RoomThumb room={summary.room} />
        </span>
        <span className="flex min-w-0 flex-col pr-10">
          <span className="truncate text-base font-bold text-ink">
            {summary.name}
          </span>
          <span className="text-xs text-ink-muted">
            {modifiedLabel(summary.updatedAt, now)}
          </span>
        </span>
      </Link>
      <div ref={ref} className="absolute right-1 bottom-1">
        <button
          type="button"
          aria-label={`${summary.name} 메뉴`}
          aria-expanded={menu}
          onClick={() => setMenu((v) => !v)}
          className="flex size-11 items-center justify-center rounded-sm text-ink-muted hover:bg-surface"
        >
          <MoreVertical size={20} />
        </button>
        {mounted && (
          <div
            role="menu"
            data-exiting={exiting || undefined}
            style={{ "--motion-y": "4px" } as CSSProperties}
            className="motion-menu absolute right-0 bottom-full z-20 mb-1 w-36 rounded-md border border-border bg-canvas p-1 shadow-floating"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenu(false);
                onDelete();
              }}
              className="flex h-10 w-full items-center gap-2 rounded-sm px-3 text-sm font-medium text-danger hover:bg-danger-soft"
            >
              <Trash2 size={16} aria-hidden />
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 새 방 모달은 이 경로 - 내비의 방 만들기와 같음
export const NEW_ROOM_HREF = "/rooms?new=1";

export function NewRoomCard() {
  return (
    <Link
      href={NEW_ROOM_HREF}
      className="col-span-full flex min-h-16 items-center justify-center gap-3 rounded-md border-[1.5px] border-primary bg-canvas p-3 text-primary hover:bg-primary-soft sm:col-span-1 sm:min-h-52 sm:flex-col"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft sm:size-14">
        <Plus size={22} aria-hidden />
      </span>
      <span className="text-base font-bold">새 방 만들기</span>
    </Link>
  );
}
