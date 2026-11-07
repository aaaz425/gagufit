"use client";

import {
  furnitureCorners,
  moveOpening,
  roundVec2,
  setOpeningWidth,
  snapRotation,
  type Room,
  type Vec2,
} from "@gagufit/core";
import { FURNITURE_PRESETS } from "@gagufit/data";
import { Maximize, Minus, Plus, Sofa } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { updateFurniture, updateOpening } from "../actions";
import { useEditor, useRoom, warnedFurnitureIds } from "../store";
import { SelectionToolbar, type ScreenBox } from "../SelectionToolbar";
import {
  FurnitureGuides,
  Label,
  OpeningGuide,
  OpeningHandles,
  openingFrame,
  RoomPlan,
} from "./RoomPlan";
import {
  fitView,
  toRoom,
  toScreen,
  transformOf,
  zoomAt,
  type View,
} from "./view";

/** 터치 길게 누르기 - 실수 이동 방지 */
const LONG_PRESS_MS = 400;
/** 이만큼 움직이면 누르기가 아닌 끌기 */
const MOVE_SLOP = 8;
const FIT_PAD = 48;

type Hit = { kind: string; id: string } | null;

type Gesture =
  | { type: "pan"; start: Vec2; view0: View; moved: boolean }
  | {
      type: "press";
      hit: NonNullable<Hit>;
      start: Vec2;
      timer: ReturnType<typeof setTimeout>;
    }
  | { type: "furniture"; id: string; before: Room; offset: Vec2 }
  | { type: "rotate"; id: string; before: Room }
  | { type: "opening"; id: string; before: Room; offset: Vec2 }
  | { type: "width"; id: string; side: "left" | "right"; before: Room }
  | {
      type: "pinch";
      view0: View;
      center0: Vec2;
      dist0: number;
      angle0: number;
    };

const present = () => useEditor.getState().history.present;

function hitOf(target: EventTarget | null): Hit {
  const el = (target as Element | null)?.closest?.("[data-hit]");
  if (!(el instanceof SVGElement || el instanceof HTMLElement)) return null;
  return { kind: el.dataset.hit ?? "", id: el.dataset.id ?? "" };
}

export function PlanCanvas({ compact }: { compact: boolean }) {
  const room = useRoom();
  const selection = useEditor((s) => s.selection);
  const select = useEditor((s) => s.select);
  const preview = useEditor((s) => s.preview);
  const commit = useEditor((s) => s.commit);
  const setPanel = useEditor((s) => s.setPanel);
  const setSheet = useEditor((s) => s.setSheet);

  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [view, setViewState] = useState<View | null>(null);
  const viewRef = useRef<View | null>(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const pointers = useRef(new Map<number, Vec2>());

  const setView = (next: View) => {
    viewRef.current = next;
    setViewState(next);
  };

  const fit = () => {
    if (size) setView(fitView(present(), size, compact ? 32 : FIT_PAD));
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      // 처음 한 번만 맞춤 - 이후엔 사용자가 옮긴 화면 유지
      if (!viewRef.current && width > 0 && height > 0) {
        const next = fitView(
          present(),
          { width, height },
          compact ? 32 : FIT_PAD,
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

  const local = (e: { clientX: number; clientY: number }): Vec2 => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrag = (hit: NonNullable<Hit>, at: Vec2): Gesture | null => {
    const v = viewRef.current!;
    const r = present();
    const p = toRoom(v, at);
    if (hit.kind === "furniture") {
      const f = r.furniture.find((item) => item.id === hit.id);
      if (!f) return null;
      select({ kind: "furniture", id: f.id });
      return {
        type: "furniture",
        id: f.id,
        before: r,
        offset: { x: f.position.x - p.x, y: f.position.y - p.y },
      };
    }
    if (hit.kind === "opening") {
      const o = r.openings.find((item) => item.id === hit.id);
      if (!o) return null;
      select({ kind: "opening", id: o.id });
      const { left, u } = openingFrame(r, o);
      const center = {
        x: left.x + (u.x * o.width) / 2,
        y: left.y + (u.y * o.width) / 2,
      };
      return {
        type: "opening",
        id: o.id,
        before: r,
        offset: { x: center.x - p.x, y: center.y - p.y },
      };
    }
    return null;
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!viewRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const at = local(e);
    pointers.current.set(e.pointerId, at);
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pointers.current.size === 2) {
      endGesture();
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        type: "pinch",
        view0: viewRef.current,
        center0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        dist0: Math.hypot(b.x - a.x, b.y - a.y),
        angle0: Math.atan2(b.y - a.y, b.x - a.x),
      };
      return;
    }
    if (pointers.current.size > 2) return;

    const hit = hitOf(e.target);
    const r = present();
    if (hit?.kind === "rotate") {
      gesture.current = { type: "rotate", id: hit.id, before: r };
      setDragging(true);
    } else if (hit?.kind === "width-left" || hit?.kind === "width-right") {
      gesture.current = {
        type: "width",
        id: hit.id,
        side: hit.kind === "width-left" ? "left" : "right",
        before: r,
      };
      setDragging(true);
    } else if (hit?.kind === "furniture" || hit?.kind === "opening") {
      if (e.pointerType === "touch") {
        gesture.current = {
          type: "press",
          hit,
          start: at,
          timer: setTimeout(() => {
            const g = gesture.current;
            if (g?.type !== "press" || !svgRef.current) return;
            gesture.current = startDrag(g.hit, g.start);
            if (gesture.current) {
              setDragging(true);
              navigator.vibrate?.(10);
            }
          }, LONG_PRESS_MS),
        };
      } else {
        gesture.current = startDrag(hit, at);
        setDragging(gesture.current !== null);
      }
    } else {
      gesture.current = {
        type: "pan",
        start: at,
        view0: viewRef.current,
        moved: false,
      };
    }
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const at = local(e);
    pointers.current.set(e.pointerId, at);
    const g = gesture.current;
    const v = viewRef.current;
    if (!g || !v) return;

    switch (g.type) {
      case "pinch": {
        const [a, b] = [...pointers.current.values()];
        const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        setView(
          zoomAt(
            g.view0,
            g.center0,
            g.view0.scale * (dist / g.dist0),
            g.view0.angle + ((angle - g.angle0) * 180) / Math.PI,
            center,
          ),
        );
        return;
      }
      case "pan": {
        const dx = at.x - g.start.x;
        const dy = at.y - g.start.y;
        if (!g.moved && Math.hypot(dx, dy) < 3) return;
        g.moved = true;
        setView({ ...g.view0, x: g.view0.x + dx, y: g.view0.y + dy });
        return;
      }
      case "press": {
        if (Math.hypot(at.x - g.start.x, at.y - g.start.y) < MOVE_SLOP) return;
        clearTimeout(g.timer);
        gesture.current = {
          type: "pan",
          start: g.start,
          view0: v,
          moved: true,
        };
        setView({ ...v, x: v.x + at.x - g.start.x, y: v.y + at.y - g.start.y });
        return;
      }
    }

    const r = present();
    const p = toRoom(v, at);
    if (g.type === "furniture") {
      const f = r.furniture.find((item) => item.id === g.id);
      const position = roundVec2({ x: p.x + g.offset.x, y: p.y + g.offset.y });
      if (!f || (f.position.x === position.x && f.position.y === position.y))
        return;
      preview(updateFurniture(r, g.id, { position }));
    } else if (g.type === "rotate") {
      const f = r.furniture.find((item) => item.id === g.id);
      if (!f) return;
      // 핸들은 가구 등쪽 - 회전 r에서 (-sin r, -cos r) 방향
      const dx = p.x - f.position.x;
      const dy = p.y - f.position.y;
      if (Math.hypot(dx, dy) < 1) return;
      const rotation = snapRotation((Math.atan2(-dx, -dy) * 180) / Math.PI);
      if (rotation !== f.rotation)
        preview(updateFurniture(r, g.id, { rotation }));
    } else if (g.type === "opening") {
      const next = moveOpening(r, g.id, {
        x: p.x + g.offset.x,
        y: p.y + g.offset.y,
      });
      const a = r.openings.find((o) => o.id === g.id);
      const b = next.openings.find((o) => o.id === g.id);
      if (a && b && (a.wall !== b.wall || a.offset !== b.offset)) preview(next);
    } else if (g.type === "width") {
      const o0 = g.before.openings.find((o) => o.id === g.id);
      const o = r.openings.find((item) => item.id === g.id);
      if (!o0 || !o) return;
      const { start, u } = openingFrame(r, o0);
      const along = (p.x - start.x) * u.x + (p.y - start.y) * u.y;
      let next: Room;
      if (g.side === "right") {
        next = setOpeningWidth(r, g.id, along - o0.offset);
      } else {
        const right = o0.offset + o0.width;
        const offset = Math.min(Math.max(Math.round(along), 0), right - 1);
        next = updateOpening(r, g.id, (item) => ({
          ...item,
          offset,
          width: right - offset,
        }));
      }
      const b = next.openings.find((item) => item.id === g.id)!;
      if (b.offset !== o.offset || b.width !== o.width) preview(next);
    }
  };

  /** 끌기 마무리 - 기록 한 단계 */
  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.type === "press") clearTimeout(g.timer);
    if ("before" in g) commit(g.before);
    setDragging(false);
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (g?.type === "pinch") {
      if (pointers.current.size === 0) gesture.current = null;
      return;
    }
    if (pointers.current.size > 0) return;
    if (g?.type === "press" && e.type === "pointerup") {
      select({
        kind: g.hit.kind === "furniture" ? "furniture" : "opening",
        id: g.hit.id,
      });
    }
    if (g?.type === "pan" && !g.moved && e.type === "pointerup") select(null);
    endGesture();
  };

  const zoomBy = (k: number) => {
    const v = viewRef.current;
    if (!v || !size) return;
    setView(zoomAt(v, { x: size.width / 2, y: size.height / 2 }, v.scale * k));
  };

  const warned = warnedFurnitureIds(room);
  const selectedFurniture =
    selection?.kind === "furniture"
      ? room.furniture.find((f) => f.id === selection.id)
      : undefined;
  const selectedOpening =
    selection?.kind === "opening"
      ? room.openings.find((o) => o.id === selection.id)
      : undefined;

  let box: ScreenBox | null = null;
  if (view && (selectedFurniture || selectedOpening)) {
    let pts: Vec2[] = [];
    if (selectedFurniture) {
      const preset = FURNITURE_PRESETS[selectedFurniture.presetId];
      if (preset) pts = furnitureCorners(selectedFurniture, preset.size);
    } else if (selectedOpening) {
      const { left, right } = openingFrame(room, selectedOpening);
      pts = [left, right];
    }
    const s = pts.map((p) => toScreen(view, p));
    if (s.length) {
      box = {
        minX: Math.min(...s.map((p) => p.x)),
        maxX: Math.max(...s.map((p) => p.x)),
        minY: Math.min(...s.map((p) => p.y)),
        maxY: Math.max(...s.map((p) => p.y)),
      };
    }
  }

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
        className="absolute inset-0 h-full w-full touch-none select-none"
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

      {box && size && !dragging && (
        <SelectionToolbar
          box={box}
          bounds={size}
          kind={selectedFurniture ? "furniture" : "opening"}
        />
      )}

      {room.furniture.length === 0 && roomCenter && !selection && (
        <div
          className="absolute flex w-[230px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2.5 rounded-md bg-canvas p-4.5 text-center shadow-floating"
          style={{ left: roomCenter.x, top: roomCenter.y }}
        >
          <Sofa size={28} className="text-primary" aria-hidden />
          <p className="text-[15px] font-bold text-ink">아직 가구가 없어요</p>
          <p className="text-xs text-ink-muted">가구를 골라 방에 놓아 보세요</p>
          <button
            type="button"
            className="h-11 rounded-sm bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            onClick={() => {
              setPanel("furniture");
              if (compact) setSheet("furniture");
            }}
          >
            가구 추가
          </button>
        </div>
      )}

      {!compact && (
        <div className="absolute bottom-6 left-6 flex gap-0.5 rounded-sm bg-canvas p-1 shadow-raised">
          <ZoomButton label="축소" onClick={() => zoomBy(1 / 1.25)}>
            <Minus size={16} />
          </ZoomButton>
          <ZoomButton label="방 전체 보기" onClick={fit}>
            <Maximize size={16} />
          </ZoomButton>
          <ZoomButton label="확대" onClick={() => zoomBy(1.25)}>
            <Plus size={16} />
          </ZoomButton>
        </div>
      )}
    </div>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-sm text-ink hover:bg-surface"
    >
      {children}
    </button>
  );
}
