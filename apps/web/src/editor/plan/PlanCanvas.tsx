"use client";

import { useEffect, useRef, useState } from "react";
import {
  currentRoom,
  useEditor,
  useRoom,
  warnedFurnitureTones,
} from "../store";
import { canvasInsets, fitPadding, PANEL_TAB_BOTTOM } from "../layout";
import { SelectionToolbar } from "../SelectionToolbar";
import { EmptyHint } from "./EmptyHint";
import {
  FurnitureGuides,
  Label,
  OpeningGuide,
  OpeningHandles,
  RoomPlan,
} from "./RoomPlan";
import { selectionBox } from "./selection-box";
import { usePlanGestures } from "./usePlanGestures";
import { fitView, toScreen, transformOf, zoomAt, type View } from "./view";
import { ZoomControls } from "./ZoomControls";

/** 맞춤 기준 - 선택 시 열리는 패널·요약 바 자리까지 비움 */
function currentInsets(desktop: boolean) {
  const s = useEditor.getState();
  return canvasInsets({
    desktop,
    leftOpen: s.leftOpen,
    selected: true,
  });
}

export function PlanCanvas({ compact }: { compact: boolean }) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const sheet = useEditor((s) => s.sheet);
  const dragging = useEditor((s) => s.dragging);
  const leftOpen = useEditor((s) => s.leftOpen);
  const insets = canvasInsets({
    desktop: !compact,
    leftOpen,
    selected: selection !== null,
  });

  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [view, setViewState] = useState<View | null>(null);
  const viewRef = useRef<View | null>(null);

  const setView = (next: View) => {
    viewRef.current = next;
    setViewState(next);
  };

  const { onPointerDown, onPointerMove, onPointerUp } = usePlanGestures({
    svgRef,
    viewRef,
    setView,
  });

  const fit = () => {
    if (!size) return;
    setView(
      fitView(
        currentRoom(),
        size,
        fitPadding(!compact, currentInsets(!compact)),
      ),
    );
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      // 처음 한 번만 맞춤 - 이후 창 크기가 바뀌어도 도면은 그대로
      if (!viewRef.current && width > 0 && height > 0) {
        const next = fitView(
          currentRoom(),
          { width, height },
          fitPadding(!compact, currentInsets(!compact)),
        );
        viewRef.current = next;
        setViewState(next);
      }
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [compact]);

  // 휠 확대 - preventDefault 위해 passive 아님
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      const v = viewRef.current;
      if (!v) return;
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const anchor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      const next = zoomAt(v, anchor, v.scale * k);
      viewRef.current = next;
      setViewState(next);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (k: number) => {
    const v = viewRef.current;
    if (!v || !size) return;
    // 패널에 가리지 않은 영역 가운데 기준
    const anchor = {
      x: (insets.left + size.width - insets.right) / 2,
      y: (insets.top + size.height - insets.bottom) / 2,
    };
    setView(zoomAt(v, anchor, v.scale * k));
  };

  const warned = warnedFurnitureTones(room);
  const selectedFurniture =
    selection?.kind === "furniture"
      ? room.furniture.find((f) => f.id === selection.id)
      : undefined;
  const selectedOpening =
    selection?.kind === "opening"
      ? room.openings.find((o) => o.id === selection.id)
      : undefined;

  const { box, outside } = selectionBox(
    room,
    view,
    selectedFurniture,
    selectedOpening,
  );

  const roomCenter = view
    ? toScreen(view, { x: room.width / 2, y: room.depth / 2 })
    : null;

  return (
    <div
      ref={boxRef}
      className="relative h-full w-full overflow-hidden bg-surface"
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full cursor-grab touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
        role="application"
        aria-label="방 평면도"
      >
        {view && (
          <g transform={transformOf(view)}>
            <RoomPlan
              room={room}
              scale={view.scale}
              selection={selection}
              warned={warned}
              angle={view.angle}
            />
            {selectedOpening && (
              <>
                <OpeningGuide
                  room={room}
                  opening={selectedOpening}
                  scale={view.scale}
                  angle={view.angle}
                />
                <OpeningHandles
                  room={room}
                  opening={selectedOpening}
                  scale={view.scale}
                  angle={view.angle}
                />
              </>
            )}
            {dragging && selectedFurniture && (
              <FurnitureGuides
                room={room}
                furniture={selectedFurniture}
                scale={view.scale}
                angle={view.angle}
              />
            )}
            <Label
              at={{ x: 0, y: room.depth + 22 / view.scale }}
              text={`${room.width} × ${room.depth} cm`}
              scale={view.scale}
              angle={view.angle}
              anchor="start"
            />
          </g>
        )}
      </svg>

      {box && size && !dragging && sheet !== "props" && (
        <SelectionToolbar
          box={box}
          center={outside}
          bounds={{
            left: insets.left,
            top: insets.top + (compact ? 0 : PANEL_TAB_BOTTOM),
            right: size.width - insets.right,
            bottom: size.height - insets.bottom,
          }}
          kind={selectedFurniture ? "furniture" : "opening"}
        />
      )}

      {room.furniture.length === 0 && roomCenter && !selection && (
        <EmptyHint at={roomCenter} compact={compact} />
      )}

      {!compact && (
        <ZoomControls left={insets.left + 24} onZoom={zoomBy} onFit={fit} />
      )}
    </div>
  );
}
