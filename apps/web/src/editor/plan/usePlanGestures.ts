import {
  moveOpening,
  roundVec2,
  setOpeningEdge,
  snapRotation,
  type Room,
  type Vec2,
} from "@gagufit/core";
import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { updateFurniture } from "../actions";
import { currentRoom, useEditor } from "../store";
import { openingFrame } from "./RoomPlan";
import { toRoom, zoomAt, type View } from "./view";

/** 터치 길게 누르기 - 실수 이동 방지 */
const LONG_PRESS_MS = 400;
/** 이만큼 움직이면 누르기가 아닌 끌기 */
const MOVE_SLOP = 8;

const HINT_KEY = "gagufit:drag-hint-seen";

/** 길게 누르기 안내는 처음 한 번만 */
function showDragHintOnce() {
  try {
    if (localStorage.getItem(HINT_KEY)) return;
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    return;
  }
  useEditor
    .getState()
    .showToast({ message: "가구를 길게 누르면 옮길 수 있어요" });
}

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

function hitOf(target: EventTarget | null): Hit {
  const el = (target as Element | null)?.closest?.("[data-hit]");
  if (!(el instanceof SVGElement || el instanceof HTMLElement)) return null;
  return { kind: el.dataset.hit ?? "", id: el.dataset.id ?? "" };
}

/** 평면도 포인터 제스처 - 이동·핀치·가구/문 끌기·회전·폭 조절 */
export function usePlanGestures({
  svgRef,
  viewRef,
  setView,
}: {
  svgRef: RefObject<SVGSVGElement | null>;
  viewRef: RefObject<View | null>;
  setView: (next: View) => void;
}) {
  const select = useEditor((s) => s.select);
  const preview = useEditor((s) => s.preview);
  const commit = useEditor((s) => s.commit);
  const setDragging = useEditor((s) => s.setDragging);
  const gesture = useRef<Gesture | null>(null);
  const pointers = useRef(new Map<number, Vec2>());

  // 끄는 중 화면이 사라지면(2D·3D 전환 등) 그때까지 움직인 것 기록
  useEffect(() => {
    const g = gesture;
    return () => {
      const current = g.current;
      g.current = null;
      if (!current) return;
      if (current.type === "press") clearTimeout(current.timer);
      const s = useEditor.getState();
      if ("before" in current) s.commit(current.before);
      s.setDragging(false);
    };
  }, []);

  // 포인터를 붙잡은 동안엔 svg 커서가 적용돼 직접 지정, 끝나면 비움
  const setCursor = (cursor: string) => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.style.cursor = cursor;
    // 자식 커서보다 우선시킴 - globals.css
    svg.toggleAttribute("data-dragging", cursor !== "");
  };

  const local = (e: { clientX: number; clientY: number }): Vec2 => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrag = (hit: NonNullable<Hit>, at: Vec2): Gesture | null => {
    const v = viewRef.current!;
    const r = currentRoom();
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
    const r = currentRoom();
    if (hit?.kind === "rotate") {
      gesture.current = { type: "rotate", id: hit.id, before: r };
      setCursor(getComputedStyle(e.target as Element).cursor);
      setDragging(true);
    } else if (hit?.kind === "width-left" || hit?.kind === "width-right") {
      gesture.current = {
        type: "width",
        id: hit.id,
        side: hit.kind === "width-left" ? "left" : "right",
        before: r,
      };
      setCursor(getComputedStyle(e.target as Element).cursor);
      setDragging(true);
    } else if (hit?.kind === "furniture" || hit?.kind === "opening") {
      const selected = useEditor.getState().selection;
      if (
        e.pointerType === "touch" &&
        !(selected?.kind === hit.kind && selected.id === hit.id)
      ) {
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
        if (gesture.current) setCursor("grabbing");
        setDragging(gesture.current !== null);
      }
    } else {
      gesture.current = {
        type: "pan",
        start: at,
        view0: viewRef.current,
        moved: false,
      };
      setCursor("grabbing");
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
        if (pointers.current.size < 2) return;
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
        showDragHintOnce();
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

    const r = currentRoom();
    const p = toRoom(v, at);
    if (g.type === "furniture") {
      const position = roundVec2({ x: p.x + g.offset.x, y: p.y + g.offset.y });
      preview(updateFurniture(r, g.id, { position }));
    } else if (g.type === "rotate") {
      const f = r.furniture.find((item) => item.id === g.id);
      if (!f) return;
      // 핸들은 가구 등쪽 - 회전 r에서 (-sin r, -cos r) 방향
      const dx = p.x - f.position.x;
      const dy = p.y - f.position.y;
      if (Math.hypot(dx, dy) < 1) return;
      const rotation = snapRotation((Math.atan2(-dx, -dy) * 180) / Math.PI);
      preview(updateFurniture(r, g.id, { rotation }));
    } else if (g.type === "opening") {
      preview(
        moveOpening(r, g.id, { x: p.x + g.offset.x, y: p.y + g.offset.y }),
      );
    } else if (g.type === "width") {
      const o = r.openings.find((item) => item.id === g.id);
      if (!o) return;
      const { start, u } = openingFrame(r, o);
      const along = (p.x - start.x) * u.x + (p.y - start.y) * u.y;
      preview(setOpeningEdge(r, g.id, g.side, along));
    }
  };

  /** 끌기 마무리 - 기록 한 단계 */
  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (g.type === "press") clearTimeout(g.timer);
    if ("before" in g) commit(g.before);
    setCursor("");
    setDragging(false);
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;
    if (g?.type === "pinch") {
      // 한 손가락이 남으면 그 손가락으로 화면 이동 이어감
      const rest = [...pointers.current.values()][0];
      gesture.current = rest
        ? { type: "pan", start: rest, view0: viewRef.current!, moved: true }
        : null;
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

  return { onPointerDown, onPointerMove, onPointerUp };
}
