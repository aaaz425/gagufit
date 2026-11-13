"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// globals.css --duration-fast와 같은 값 - 퇴장 애니메이션 길이
const EXIT_MS = 120;

export function prefersReducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const exitDelay = () => (prefersReducedMotion() ? 0 : EXIT_MS);

/** 닫기 요청 → data-exiting 켜고 퇴장 뒤 onDone */
export function useExit(onDone: () => void): [boolean, () => void] {
  const [exiting, setExiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => () => clearTimeout(timer.current), []);
  const start = useCallback(() => {
    if (timer.current) return;
    setExiting(true);
    timer.current = setTimeout(() => done.current(), exitDelay());
  }, []);
  return [exiting, start];
}

/** show가 꺼져도 퇴장이 끝날 때까지 mounted 유지 */
export function usePresence(show: boolean): {
  mounted: boolean;
  exiting: boolean;
} {
  const [mounted, setMounted] = useState(show);
  if (show && !mounted) setMounted(true);
  useEffect(() => {
    if (show || !mounted) return;
    const timer = setTimeout(() => setMounted(false), exitDelay());
    return () => clearTimeout(timer);
  }, [show, mounted]);
  return { mounted, exiting: mounted && !show };
}

/** 처음 그려질 때 있던 id - 불러온 항목은 등장 효과 없이, 이후 추가분만 */
export function useInitialIds(ids: Iterable<string>): ReadonlySet<string> {
  const [initial] = useState(() => new Set(ids));
  return initial;
}
