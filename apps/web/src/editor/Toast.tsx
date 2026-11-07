"use client";

import { useEffect } from "react";
import { useEditor } from "./store";

const TOAST_MS = 4000;

export function Toast({ bottom }: { bottom: number }) {
  const toast = useEditor((s) => s.toast);
  const showToast = useEditor((s) => s.showToast);
  const undo = useEditor((s) => s.undo);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => showToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast, showToast]);

  if (!toast) return null;
  return (
    <div
      role="status"
      className="pointer-events-auto absolute left-1/2 z-30 flex w-[min(360px,calc(100%-32px))] -translate-x-1/2 items-center gap-2.5 rounded-md bg-ink py-3 pr-2 pl-3.5 text-sm font-medium text-white shadow-floating"
      style={{ bottom }}
    >
      <span className="flex-1">{toast.message}</span>
      {toast.undo && (
        <button
          type="button"
          onClick={() => {
            undo();
            showToast(null);
          }}
          className="h-9 rounded-sm px-2 font-bold text-primary-inverse"
        >
          실행 취소
        </button>
      )}
    </div>
  );
}
