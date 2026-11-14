import { roundVec2, type Vec2 } from "@gagufit/core";
import type { RootState, ThreeEvent } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { Plane, Raycaster, Vector2, Vector3 } from "three";

/** 터치 길게 누르기 ms - 실수 이동 방지, 2D와 같음 */
const LONG_PRESS_MS = 400;
/** 길게 누르는 중 이만큼 움직이면 끌기가 아닌 시점 회전 px */
const MOVE_SLOP = 8;

const FLOOR = new Plane(new Vector3(0, 1, 0), 0);

type Session = {
  pointerId: number;
  id: string;
  /** 화면 px */
  start: Vec2;
  /** 잡은 곳에서 가구 중심까지 - 평면 cm, 끌기가 시작되면 채움 */
  offset: Vec2 | null;
  timer?: ReturnType<typeof setTimeout>;
};

type Options = {
  three: RefObject<RootState | null>;
  controls: RefObject<{ enabled: boolean } | null>;
  /** 최신 값을 읽음 - 끄는 동안 바뀌어도 세션은 유지 */
  read: () => {
    selectedId: string | null;
    width: number;
    depth: number;
    position: (id: string) => Vec2 | undefined;
  };
  onSelect: (id: string) => void;
  onDragStart: () => void;
  onDragMove: (id: string, position: Vec2) => void;
  onDragEnd: () => void;
};

/**
 * 선택된 가구 끌기 - 마우스는 바로, 터치는 길게 누른 뒤
 * 끄는 동안 시점 컨트롤을 끄고, 손가락이 더 닿으면 취소해 확대·회전에 양보
 */
export function useFurnitureDrag(options: Options) {
  const opts = useRef(options);
  useEffect(() => {
    opts.current = options;
  });
  const session = useRef<Session | null>(null);
  const down = useRef(new Set<number>());
  const api = useRef<{ begin: () => void; finish: () => void }>(null);

  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const hit = new Vector3();
    let dragging = false;

    /** 화면 점 아래 바닥의 평면 좌표 cm */
    const floorAt = (clientX: number, clientY: number): Vec2 | null => {
      const three = opts.current.three.current;
      if (!three) return null;
      const rect = three.gl.domElement.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, three.camera);
      if (!raycaster.ray.intersectPlane(FLOOR, hit)) return null;
      const { width, depth } = opts.current.read();
      return { x: hit.x * 100 + width / 2, y: hit.z * 100 + depth / 2 };
    };

    const finish = () => {
      const s = session.current;
      session.current = null;
      if (!s) return;
      clearTimeout(s.timer);
      if (!dragging) return;
      dragging = false;
      const controls = opts.current.controls.current;
      if (controls) controls.enabled = true;
      opts.current.onDragEnd();
    };

    const begin = () => {
      const s = session.current;
      if (!s) return;
      const at = floorAt(s.start.x, s.start.y);
      const state = opts.current.read();
      const position = state.position(s.id);
      if (!at || !position) {
        finish();
        return;
      }
      s.offset = { x: position.x - at.x, y: position.y - at.y };
      dragging = true;
      const controls = opts.current.controls.current;
      if (controls) controls.enabled = false;
      if (state.selectedId !== s.id) opts.current.onSelect(s.id);
      opts.current.onDragStart();
    };
    api.current = { begin, finish };

    const onDown = (e: PointerEvent) => {
      // 마우스는 한 개뿐이라 셀 필요 없음 - 놓침이 남아 터치를 막지 않게
      if (e.pointerType === "touch") down.current.add(e.pointerId);
      // 다른 손가락이 닿으면 확대·회전으로 넘김
      if (session.current && session.current.pointerId !== e.pointerId)
        finish();
    };
    const onMove = (e: PointerEvent) => {
      const s = session.current;
      if (!s || s.pointerId !== e.pointerId) return;
      if (!dragging) {
        // 길게 누르기 전에 움직이면 시점 회전
        if (
          Math.hypot(e.clientX - s.start.x, e.clientY - s.start.y) >= MOVE_SLOP
        )
          finish();
        return;
      }
      const at = floorAt(e.clientX, e.clientY);
      if (!at || !s.offset) return;
      opts.current.onDragMove(
        s.id,
        roundVec2({ x: at.x + s.offset.x, y: at.y + s.offset.y }),
      );
    };
    const onUp = (e: PointerEvent) => {
      down.current.delete(e.pointerId);
      if (session.current?.pointerId === e.pointerId) finish();
    };

    const ids = down.current;
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onUp, true);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onUp, true);
      // 끄는 중 화면이 사라지면 그때까지 움직인 것 기록
      finish();
      ids.clear();
    };
  }, []);

  return (e: ThreeEvent<PointerEvent>, id: string) => {
    const native = e.nativeEvent;
    if (native.pointerType === "mouse" && native.button !== 0) return;
    // 손가락이 이미 더 닿아 있으면 확대·회전 중
    if (down.current.size > 1 || session.current) return;
    const touch = native.pointerType === "touch";
    // 마우스는 선택된 가구만 바로 끌기, 선택 안 된 가구는 시점 회전
    if (!touch && opts.current.read().selectedId !== id) return;
    session.current = {
      pointerId: native.pointerId,
      id,
      start: { x: native.clientX, y: native.clientY },
      offset: null,
    };
    if (!touch) {
      api.current?.begin();
      return;
    }
    session.current.timer = setTimeout(() => {
      api.current?.begin();
      navigator.vibrate?.(10);
    }, LONG_PRESS_MS);
  };
}
