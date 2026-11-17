"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// 사이트 레이아웃은 이동 중 유지되므로 앱 안 이동 여부를 모듈에 기록
let navigatedInApp = false;

export function NavTracker() {
  const pathname = usePathname();
  // Strict Mode가 효과를 두 번 돌려도 같은 경로면 이동으로 보지 않음
  const prev = useRef(pathname);
  useEffect(() => {
    if (prev.current !== pathname) navigatedInApp = true;
    prev.current = pathname;
  }, [pathname]);
  return null;
}

/** 앱 안에서 이동했으면 이전 화면, 직접 진입이면 설정으로 */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="뒤로 가기"
      onClick={() =>
        navigatedInApp ? router.back() : router.push("/settings")
      }
      className="-ml-3 flex size-11 items-center justify-center rounded-sm text-ink hover:bg-surface"
    >
      <ChevronLeft size={22} aria-hidden />
    </button>
  );
}
