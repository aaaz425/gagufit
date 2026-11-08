"use client";

import { useRooms, type RoomSummary } from "@gagufit/api";
import { Armchair, CloudOff } from "lucide-react";
import { useState } from "react";
import { DeleteModal } from "./DeleteModal";
import { NewRoomCard, RoomCard } from "./RoomCard";
import { TemplateModal } from "./TemplateModal";

type Dialog = { kind: "new" } | { kind: "delete"; room: RoomSummary } | null;

export function RoomList() {
  const rooms = useRooms();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [now] = useState(() => Date.now());
  const close = () => setDialog(null);
  const list = rooms.data;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-border bg-canvas">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4 md:px-10">
          <span className="flex items-center gap-2 text-lg font-extrabold text-ink">
            <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-white">
              <Armchair size={20} aria-hidden />
            </span>
            gagufit
          </span>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 md:px-10 md:py-10">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold text-ink">내 방</h1>
          {list && (
            <span className="text-sm text-ink-muted tabular-nums">
              {list.length}개
            </span>
          )}
        </div>

        {rooms.isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CloudOff size={28} className="text-ink-muted" aria-hidden />
            <p className="text-sm text-ink-muted">
              방 목록을 불러오지 못했어요
            </p>
            <button
              type="button"
              onClick={() => rooms.refetch()}
              className="h-11 rounded-sm border border-border bg-canvas px-5 text-sm font-semibold text-ink hover:bg-surface"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              <NewRoomCard onClick={() => setDialog({ kind: "new" })} />
              {!list && (
                <>
                  <Placeholder />
                  <Placeholder />
                </>
              )}
              {list?.map((summary) => (
                <RoomCard
                  key={summary.id}
                  summary={summary}
                  now={now}
                  onDelete={() => setDialog({ kind: "delete", room: summary })}
                />
              ))}
            </div>
            {list?.length === 0 && (
              <p className="text-center text-sm text-ink-muted">
                아직 만든 방이 없어요. 새 방을 만들어 가구를 배치해 보세요
              </p>
            )}
          </>
        )}
      </main>

      {dialog?.kind === "new" && <TemplateModal onClose={close} />}
      {dialog?.kind === "delete" && (
        <DeleteModal
          id={dialog.room.id}
          name={dialog.room.name}
          onClose={close}
        />
      )}
    </div>
  );
}

/** 불러오는 중 자리 */
function Placeholder() {
  return (
    <div
      aria-hidden
      className="flex flex-col gap-3 rounded-md bg-canvas p-3 shadow-raised"
    >
      <span className="aspect-4/3 rounded-sm bg-surface" />
      <span className="h-4 w-2/3 rounded-sm bg-surface" />
      <span className="h-3 w-1/3 rounded-sm bg-surface" />
    </div>
  );
}
