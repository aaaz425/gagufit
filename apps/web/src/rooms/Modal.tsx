"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  type ReactNode,
} from "react";
import { useExit } from "@/motion";

// 퇴장 효과를 거쳐 닫는 함수
const CloseContext = createContext<() => void>(() => {});

/** 딤 + 가운데 창 - Esc·딤 누르면 닫힘, fullOnMobile이면 모바일에서 전체 화면 */
export function Modal({
  title,
  onClose,
  fullOnMobile,
  children,
}: {
  title: string;
  onClose: () => void;
  fullOnMobile?: boolean;
  children: ReactNode;
}) {
  const titleId = useId();
  const [exiting, close] = useExit(onClose);
  const exit = exiting || undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <CloseContext value={close}>
      <div
        data-exiting={exit}
        className={`motion-fade fixed inset-0 z-50 flex items-center justify-center bg-ink/40 ${
          fullOnMobile ? "" : "p-4"
        } md:p-4`}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          role="dialog"
          aria-modal
          aria-labelledby={titleId}
          data-exiting={exit}
          className={`motion-pop flex flex-col bg-canvas shadow-floating ${
            fullOnMobile
              ? "h-dvh w-full md:h-auto md:max-h-[90dvh] md:max-w-[560px] md:rounded-lg"
              : "w-full max-w-[400px] rounded-lg"
          }`}
        >
          <h2
            id={titleId}
            className="px-6 pt-6 text-lg font-bold break-words text-ink"
          >
            {title}
          </h2>
          {children}
        </div>
      </div>
    </CloseContext>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end gap-2 px-6 pt-4 pb-6">{children}</div>
  );
}

export const BUTTON_BASE =
  "flex h-11 items-center justify-center rounded-sm px-5 text-sm font-semibold disabled:bg-surface disabled:text-ink-subtle";
export const BUTTON_SECONDARY = `${BUTTON_BASE} border border-border bg-canvas text-ink enabled:hover:bg-surface`;
export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-primary text-white enabled:hover:bg-primary-hover`;
export const BUTTON_DANGER = `${BUTTON_BASE} bg-danger text-white enabled:hover:bg-danger-soft enabled:hover:text-danger`;

/** 퇴장 효과를 거쳐 닫는 취소 버튼 - Modal 안에서만 */
export function ModalCancel() {
  const close = useContext(CloseContext);
  return (
    <button type="button" onClick={close} className={BUTTON_SECONDARY}>
      취소
    </button>
  );
}
