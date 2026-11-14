"use client";

import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { canvasInsets } from "./layout";
import { useQualitySettings } from "./quality";
import { useEditor, useRoom, warnedFurnitureTones } from "./store";

const Room3D = dynamic(() => import("./view3d/Room3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface">
      <span className="flex items-center gap-2 rounded-full bg-canvas px-4 py-2 text-sm font-medium text-ink-muted shadow-raised">
        <LoaderCircle size={16} className="animate-spin text-primary" />
        3D를 준비하는 중
      </span>
    </div>
  ),
});

/** 3D 보기 - 선택만 하고 편집은 2D·속성 패널에서 */
export function View3D({ compact }: { compact: boolean }) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const leftOpen = useEditor((s) => s.leftOpen);
  const select = useEditor((s) => s.select);
  const [quality] = useQualitySettings();
  const onSelect = useCallback(
    (id: string | null) => select(id ? { kind: "furniture", id } : null),
    [select],
  );
  return (
    <div className="absolute inset-0 bg-surface">
      <Room3D
        room={room}
        selectedId={selection?.kind === "furniture" ? selection.id : null}
        warningTones={warnedFurnitureTones(room)}
        quality={quality}
        insets={canvasInsets({
          desktop: !compact,
          leftOpen,
          selected: selection !== null,
        })}
        onSelect={onSelect}
      />
    </div>
  );
}
