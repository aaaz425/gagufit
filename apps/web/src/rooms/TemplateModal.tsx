"use client";

import { useCreateRoom } from "@gagufit/api";
import { ROOM_TEMPLATES, roomFromTemplate } from "@gagufit/data";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUTTON_PRIMARY, Modal, ModalActions, ModalCancel } from "./Modal";
import { RoomThumb } from "./RoomThumb";

const TEMPLATES = Object.values(ROOM_TEMPLATES);

export function TemplateModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useCreateRoom();
  const [picked, setPicked] = useState(TEMPLATES[0].id);

  // 생성 성공 뒤에도 편집기로 이동하는 동안 유지
  const busy = create.isPending || create.isSuccess;

  const start = () =>
    create.mutate(roomFromTemplate(ROOM_TEMPLATES[picked]), {
      onSuccess: (id) => router.replace(`/rooms/${id}`),
    });

  return (
    <Modal title="어떤 방에서 시작할까요?" onClose={onClose} fullOnMobile>
      <div
        role="radiogroup"
        aria-label="방 템플릿"
        className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-6 pt-4"
      >
        {TEMPLATES.map((t) => {
          const on = t.id === picked;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPicked(t.id)}
              className={`flex flex-col gap-2 rounded-md p-2 text-left ${
                on
                  ? "border-2 border-primary bg-primary-soft"
                  : "border border-border bg-canvas hover:bg-surface"
              }`}
            >
              <span className="block aspect-4/3 overflow-hidden rounded-sm bg-surface">
                <RoomThumb room={t.room} />
              </span>
              <span className="text-sm font-bold text-ink">{t.name}</span>
              <span className="-mt-1 text-xs text-ink-muted tabular-nums">
                {t.room.width} × {t.room.depth} cm
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 pt-4">
        {create.isError && (
          <p role="alert" className="px-6 text-sm text-danger">
            방을 만들지 못했어요. 다시 시도해 주세요
          </p>
        )}
        <ModalActions>
          <ModalCancel />
          <button
            type="button"
            onClick={start}
            disabled={busy}
            className={`${BUTTON_PRIMARY} gap-2`}
          >
            {busy && (
              <LoaderCircle size={16} className="animate-spin" aria-hidden />
            )}
            {busy ? "방 만드는 중" : "이 방으로 시작"}
          </button>
        </ModalActions>
      </div>
    </Modal>
  );
}
