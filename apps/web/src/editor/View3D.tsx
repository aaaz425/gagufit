"use client";

import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import type { Room, Vec2 } from "@gagufit/core";
import { useCallback, useMemo, useRef, useState } from "react";
import { updateFurniture } from "./actions";
import { canvasInsets, PANEL_TAB_BOTTOM } from "./layout";
import { useQualitySettings } from "./quality";
import { SelectionToolbar, type ScreenBox } from "./SelectionToolbar";
import { currentRoom, useEditor, useRoom, warnedFurnitureTones } from "./store";
import type { ScreenSize } from "./view3d/Room3D";

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

/** 3D 보기 - 선택·이동·툴바, 각도는 툴바 90°와 속성 패널 */
export function View3D({ compact }: { compact: boolean }) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const leftOpen = useEditor((s) => s.leftOpen);
  const sheet = useEditor((s) => s.sheet);
  const dragging = useEditor((s) => s.dragging);
  const select = useEditor((s) => s.select);
  const preview = useEditor((s) => s.preview);
  const commit = useEditor((s) => s.commit);
  const setDragging = useEditor((s) => s.setDragging);
  const [quality] = useQualitySettings();
  const [anchor, setAnchor] = useState<{
    box: ScreenBox;
    size: ScreenSize;
  } | null>(null);
  const before = useRef<Room | null>(null);

  const onSelect = useCallback(
    (id: string | null) => select(id ? { kind: "furniture", id } : null),
    [select],
  );
  const onSelectionBox = useCallback(
    (box: ScreenBox | null, size: ScreenSize) =>
      setAnchor(box ? { box, size } : null),
    [],
  );
  // 끌기 한 번 = 기록 한 단계, 2D와 같은 흐름
  const onDragStart = useCallback(() => {
    before.current = currentRoom();
    setDragging(true);
  }, [setDragging]);
  const onDragMove = useCallback(
    (id: string, position: Vec2) =>
      preview(updateFurniture(currentRoom(), id, { position })),
    [preview],
  );
  const onDragEnd = useCallback(() => {
    if (before.current) commit(before.current);
    before.current = null;
    setDragging(false);
  }, [commit, setDragging]);

  const insets = useMemo(
    () =>
      canvasInsets({
        desktop: !compact,
        leftOpen,
        selected: selection !== null,
      }),
    [compact, leftOpen, selection],
  );
  const selectedId = selection?.kind === "furniture" ? selection.id : null;
  const warningTones = warnedFurnitureTones(room);

  return (
    <div className="absolute inset-0 bg-surface">
      <Room3D
        room={room}
        selectedId={selectedId}
        warningTones={warningTones}
        quality={quality}
        insets={insets}
        onSelect={onSelect}
        onSelectionBox={onSelectionBox}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      {selectedId && anchor && !dragging && sheet !== "props" && (
        <SelectionToolbar
          box={anchor.box}
          bounds={{
            left: insets.left,
            top: insets.top + (compact ? 0 : PANEL_TAB_BOTTOM),
            right: anchor.size.width - insets.right,
            bottom: anchor.size.height - insets.bottom,
          }}
          kind="furniture"
        />
      )}
    </div>
  );
}
