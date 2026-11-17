"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/** 이전 화면으로, 직접 진입이면 설정으로 */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={() =>
        window.history.length > 1 ? router.back() : router.push("/settings")
      }
      className="-ml-3 flex size-11 items-center justify-center rounded-sm text-ink hover:bg-surface"
    >
      <ChevronLeft size={22} aria-hidden />
    </button>
  );
}
