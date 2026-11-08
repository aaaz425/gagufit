"use client";

import { useSyncExternalStore } from "react";

/** 끄면 DPR 1·512px 텍스처, 그림자·후처리 없음 */
export type QualitySettings = {
  hiDpi: boolean;
  shadows: boolean;
  post: boolean;
};

// 저사양 노트북 기준 - 그림자·후처리는 켜는 쪽을 사용자가 고름
export const DEFAULT_QUALITY: QualitySettings = {
  hiDpi: true,
  shadows: false,
  post: false,
};

const STORAGE_KEY = "gagufit:quality";

let current: QualitySettings | undefined;
const listeners = new Set<() => void>();

function read(): QualitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_QUALITY;
    const saved: unknown = JSON.parse(raw);
    if (typeof saved !== "object" || saved === null) return DEFAULT_QUALITY;
    const result = { ...DEFAULT_QUALITY };
    for (const key of Object.keys(
      DEFAULT_QUALITY,
    ) as (keyof QualitySettings)[]) {
      const value = (saved as Record<string, unknown>)[key];
      if (typeof value === "boolean") result[key] = value;
    }
    return result;
  } catch {
    return DEFAULT_QUALITY;
  }
}

function getSnapshot(): QualitySettings {
  current ??= read();
  return current;
}

function getServerSnapshot(): QualitySettings {
  return DEFAULT_QUALITY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바꾼 값 반영
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    current = read();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setQualitySettings(patch: Partial<QualitySettings>) {
  current = { ...getSnapshot(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // 저장 못 해도 이번 방문 동안은 유지
  }
  for (const listener of listeners) listener();
}

/** 브라우저에 저장되는 화면 품질 - 편집기 설정 창·설정 화면 공용 */
export function useQualitySettings(): [
  QualitySettings,
  (patch: Partial<QualitySettings>) => void,
] {
  const settings = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return [settings, setQualitySettings];
}
