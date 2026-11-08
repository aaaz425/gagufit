"use client";

import {
  QUALITY_KEYS,
  QUALITY_ROWS,
  useQualitySettings,
} from "@/editor/quality";
import { Switch } from "@/editor/ui";

/** 편집기 설정 창과 같은 값 */
export function QualitySection() {
  const [quality, setQuality] = useQualitySettings();
  return (
    <ul className="flex flex-col">
      {QUALITY_KEYS.map((key) => {
        const row = QUALITY_ROWS[key];
        return (
          <li key={key}>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 border-b border-border py-3">
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-base font-medium">{row.label}</span>
                {row.hint && (
                  <span className="text-xs text-ink-muted">{row.hint}</span>
                )}
              </span>
              <Switch
                on={quality[key]}
                onChange={(v) => setQuality({ [key]: v })}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
