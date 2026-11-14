import { roundVec2, type Vec2 } from "@gagufit/core";
import type { RootState, ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { Plane, Raycaster, Vector2, Vector3 } from "three";
import { worldToPlan } from "./geometry";

/** 터치 길게 누르기 ms - 실수 이동 방지, 2D와 같음 */
const LONG_PRESS_MS = 400;
/** 길게 누르는 중 이만큼 움직이면 끌기가 아닌 시점 회전 px */
const MOVE_SLOP = 8;
/** 방 밖으로 끌 수 있는 거리 cm - 벽 규칙이 아니라 지평선 근처에서 화면 밖으로 튀는 것 방지 */
const OUTSIDE_MARGIN = 100;

type Session = {
  pointerId: number;
  id: string;
  /** 화면 px */
  start: Vec2;
  /** 끌기 평면 높이 m - 잡은 점 높이라 잡은 곳이 커서를 따라옴 */
  height: number;
  /** 잡은 곳에서 가구 중심까지 평면 cm - 끌기가 시작되면 채움 */
  offset: Vec2 | null;
  dragging: boolean;
  /** 끌기 전 body 커서 */
  cursor: string;
  timer?: ReturnType<typeof setTimeout>;
};

type Options = {
  three: RefObject<RootState | null>;
  controls: RefObject<{ enabled: boolean } | null>;
  /** 최신 값을 읽음 - 끄는 동안 바뀌어도 세션은 유지 */
  read: () => {
    selectedId: string | null;
    room: { width: number; depth: number };
    position: (id: string) => Vec2 | undefined;
  };
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDragMove: (id: string, position: Vec2) => void;
  onDragEnd: () => void;
};

function createController(opts: RefObject<Options>) {
  let session: Session | null = null;
  /** 닿아 있는 터치 - 마우스는 하나뿐이라 세지 않음 */
  const touches = new Set<number>();
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const hit = new Vector3();
  const plane = new Plane(new Vector3(0, 1, 0), 0);

  /** 화면 점 아래 끌기 평면의 방 평면 좌표 cm */
  const planAt = (clientX: number, clientY: number, height: number) => {
    const three = opts.current.three.current;
    if (!three) return null;
    const rect = three.gl.domElement.getBoundingClientRect();
    ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(ndc, three.camera);
    plane.constant = -height;
    if (!raycaster.ray.intersectPlane(plane, hit)) return null;
    return worldToPlan(opts.current.read().room, hit.x, hit.z);
  };

  const finish = () => {
    const s = session;
    session = null;
    if (!s) return;
    clearTimeout(s.timer);
    if (!s.dragging) return;
    const controls = opts.current.controls.current;
    if (controls) controls.enabled = true;
    document.body.style.cursor = s.cursor;
    opts.current.onDragEnd();
  };

  const begin = () => {
    const s = session;
    if (!s) return;
    const { selectedId, position } = opts.current.read();
    const at = planAt(s.start.x, s.start.y, s.height);
    const current = position(s.id);
    if (!at || !current) {
      finish();
      return;
    }
    s.offset = { x: current.x - at.x, y: current.y - at.y };
    s.dragging = true;
    const controls = opts.current.controls.current;
    if (controls) controls.enabled = false;
    s.cursor = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    if (selectedId !== s.id) opts.current.onSelect(s.id);
    opts.current.onDragStart();
  };

  const onWindowDown = (e: PointerEvent) => {
    if (e.pointerType === "touch") touches.add(e.pointerId);
    // 다른 손가락이 닿으면 확대·회전으로 넘김
    if (session && session.pointerId !== e.pointerId) finish();
  };
  const onWindowMove = (e: PointerEvent) => {
    const s = session;
    if (!s || s.pointerId !== e.pointerId) return;
    // 창 밖에서 놓아 pointerup을 놓친 경우
    if (e.buttons === 0) {
      finish();
      return;
    }
    if (!s.dragging) {
      // 길게 누르기 전에 움직이면 시점 회전
      if (Math.hypot(e.clientX - s.start.x, e.clientY - s.start.y) >= MOVE_SLOP)
        finish();
      return;
    }
    const at = planAt(e.clientX, e.clientY, s.height);
    if (!at || !s.offset) return;
    const { width, depth } = opts.current.read().room;
    const p = roundVec2({ x: at.x + s.offset.x, y: at.y + s.offset.y });
    opts.current.onDragMove(s.id, {
      x: Math.min(Math.max(p.x, -OUTSIDE_MARGIN), width + OUTSIDE_MARGIN),
      y: Math.min(Math.max(p.y, -OUTSIDE_MARGIN), depth + OUTSIDE_MARGIN),
    });
  };
  const onWindowUp = (e: PointerEvent) => {
    touches.delete(e.pointerId);
    if (session?.pointerId === e.pointerId) finish();
  };

  return {
    attach() {
      window.addEventListener("pointerdown", onWindowDown, true);
      window.addEventListener("pointermove", onWindowMove);
      window.addEventListener("pointerup", onWindowUp, true);
      window.addEventListener("pointercancel", onWindowUp, true);
      return () => {
        window.removeEventListener("pointerdown", onWindowDown, true);
        window.removeEventListener("pointermove", onWindowMove);
        window.removeEventListener("pointerup", onWindowUp, true);
        window.removeEventListener("pointercancel", onWindowUp, true);
        // 끄는 중 화면이 사라지면 그때까지 움직인 것 기록
        finish();
        touches.clear();
      };
    },
    pointerDown(e: ThreeEvent<PointerEvent>, id: string) {
      // 광선 뒤 가구까지 전달되므로 맨 앞 가구만 판단
      e.stopPropagation();
      const native = e.nativeEvent;
      if (native.pointerType === "mouse" && native.button !== 0) return;
      // 손가락이 이미 더 닿아 있으면 확대·회전 중
      if (touches.size > 1 || session) return;
      const touch = native.pointerType === "touch";
      // 마우스는 선택된 가구만 바로 끌기, 선택 안 된 가구는 시점 회전
      if (!touch && opts.current.read().selectedId !== id) return;
      session = {
        pointerId: native.pointerId,
        id,
        start: { x: native.clientX, y: native.clientY },
        height: e.point.y,
        offset: null,
        dragging: false,
        cursor: "",
      };
      if (!touch) {
        begin();
        return;
      }
      session.timer = setTimeout(() => {
        begin();
        if (session?.dragging) navigator.vibrate?.(10);
      }, LONG_PRESS_MS);
    },
  };
}

/**
 * 선택된 가구 끌기 - 마우스는 바로, 터치는 길게 누른 뒤
 * 끄는 동안 시점 컨트롤을 끄고, 손가락이 더 닿으면 취소해 확대·회전에 양보
 */
export function useFurnitureDrag(options: Options) {
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });
  const controller = useRef<ReturnType<typeof createController>>(null);
  useEffect(() => {
    controller.current = createController(opts);
    return controller.current.attach();
  }, []);
  return useCallback(
    (e: ThreeEvent<PointerEvent>, id: string) =>
      controller.current?.pointerDown(e, id),
    [],
  );
}
