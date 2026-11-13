"use client";

import { useEffect, useState } from "react";
import { usePresence } from "@/motion";
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

  // 사라지는 동안 마지막 내용 유지
  const [kept, setKept] = useState(toast);
  if (toast && toast !== kept) setKept(toast);
  const { mounted, exiting } = usePresence(toast !== null);
  if (!mounted || !kept) return null;
  return (
    <div
      role="status"
      data-exiting={exiting || undefined}
      className="motion-toast pointer-events-auto absolute left-1/2 z-30 flex w-[min(360px,calc(100%-32px))] -translate-x-1/2 items-center gap-3 rounded-md bg-ink py-3 pr-2 pl-4 text-sm font-medium text-white shadow-floating"
      style={{ bottom }}
    >
      <span className="flex-1">{kept.message}</span>
      {kept.undo && (
        <button
          type="button"
          onClick={undo}
          className="h-11 rounded-sm px-2 font-bold text-primary-inverse hover:bg-canvas/10"
        >
          실행 취소
        </button>
      )}
    </div>
  );
}
