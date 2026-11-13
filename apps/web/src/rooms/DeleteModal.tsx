"use client";

import { useDeleteRoom } from "@gagufit/api";
import { clearBackup } from "@/editor/save-backup";
import { BUTTON_DANGER, Modal, ModalActions, ModalCancel } from "./Modal";

export function DeleteModal({
  id,
  name,
  onClose,
}: {
  id: string;
  name: string;
  onClose: () => void;
}) {
  const del = useDeleteRoom();
  return (
    <Modal title={`'${name}' 방을 지울까요?`} onClose={onClose}>
      <p className="px-6 pt-2 text-sm text-ink-muted">
        지운 방은 되돌릴 수 없어요
      </p>
      {del.isError && (
        <p role="alert" className="px-6 pt-2 text-sm text-danger">
          지우지 못했어요. 다시 시도해 주세요
        </p>
      )}
      <ModalActions>
        <ModalCancel />
        <button
          type="button"
          disabled={del.isPending}
          onClick={() =>
            del.mutate(id, {
              onSuccess: () => {
                clearBackup(id);
                onClose();
              },
            })
          }
          className={BUTTON_DANGER}
        >
          지우기
        </button>
      </ModalActions>
    </Modal>
  );
}
