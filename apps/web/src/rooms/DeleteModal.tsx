"use client";

import { useDeleteRoom } from "@gagufit/api";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { clearBackup } from "@/editor/save-backup";
import {
  BUTTON_DANGER,
  Modal,
  ModalActions,
  ModalCancel,
  useModalClose,
} from "./Modal";

export function DeleteModal({
  id,
  name,
  onClose,
  onDeleted,
}: {
  id: string;
  name: string;
  onClose: () => void;
  /** 지운 직후 - 목록의 퇴장 효과용 */
  onDeleted: () => void;
}) {
  return (
    <DeleteModalInner
      id={id}
      name={name}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );
}

function DeleteModalInner({
  id,
  name,
  onClose,
  onDeleted,
}: {
  id: string;
  name: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const del = useDeleteRoom();
  return (
    <Modal
      title={`'${name}' 방을 지울까요?`}
      onClose={onClose}
      locked={del.isPending}
    >
      <DeleteBody id={id} del={del} onDeleted={onDeleted} />
    </Modal>
  );
}

function DeleteBody({
  id,
  del,
  onDeleted,
}: {
  id: string;
  del: ReturnType<typeof useDeleteRoom>;
  onDeleted: () => void;
}) {
  const close = useModalClose();
  const done = del.isSuccess;
  // 지우는 중에는 닫기가 잠겨 있어서, 성공이 반영된 뒤에 닫음
  const finished = useRef(false);
  useEffect(() => {
    if (!done || finished.current) return;
    finished.current = true;
    clearBackup(id);
    onDeleted();
    close();
  }, [done, id, onDeleted, close]);
  return (
    <>
      <p className="px-6 pt-2 text-sm text-ink-muted">
        지운 방은 되돌릴 수 없어요
      </p>
      {del.isError && (
        <p role="alert" className="px-6 pt-2 text-sm text-danger">
          지우지 못했어요. 다시 시도해 주세요
        </p>
      )}
      <ModalActions>
        <ModalCancel disabled={del.isPending} />
        <button
          type="button"
          disabled={del.isPending}
          onClick={() => del.mutate(id)}
          className={`${BUTTON_DANGER} gap-2`}
        >
          {del.isPending && (
            <LoaderCircle size={16} className="animate-spin" aria-hidden />
          )}
          {del.isPending ? "지우는 중" : "지우기"}
        </button>
      </ModalActions>
    </>
  );
}
