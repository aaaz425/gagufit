import type { Vec2 } from "@gagufit/core";
import type { Insets } from "../layout";

/** 화면 px = 회전(angle) · 확대(scale) · 방 cm + (x, y) - angle은 도, 화면 기준 시계 방향 */
export type View = { x: number; y: number; scale: number; angle: number };

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 8;

const rad = (deg: number) => (deg * Math.PI) / 180;

export function toScreen(view: View, p: Vec2): Vec2 {
  const c = Math.cos(rad(view.angle));
  const s = Math.sin(rad(view.angle));
  return {
    x: view.x + view.scale * (p.x * c - p.y * s),
    y: view.y + view.scale * (p.x * s + p.y * c),
  };
}

export function toRoom(view: View, p: Vec2): Vec2 {
  const c = Math.cos(rad(view.angle));
  const s = Math.sin(rad(view.angle));
  const dx = (p.x - view.x) / view.scale;
  const dy = (p.y - view.y) / view.scale;
  return { x: dx * c + dy * s, y: -dx * s + dy * c };
}

export const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

/** anchor(화면 px)에 있던 방 위치가 그대로 남게 확대·회전 */
export function zoomAt(
  view: View,
  anchor: Vec2,
  scale: number,
  angle = view.angle,
  target = anchor,
): View {
  const p = toRoom(view, anchor);
  const next = { ...view, scale: clampScale(scale), angle };
  const moved = toScreen(next, p);
  return {
    ...next,
    x: next.x + target.x - moved.x,
    y: next.y + target.y - moved.y,
  };
}

/** pad 안쪽 영역 가운데에 방 전체가 보이게 */
export function fitView(
  room: { width: number; depth: number },
  size: { width: number; height: number },
  pad: Insets,
): View {
  const width = size.width - pad.left - pad.right;
  const height = size.height - pad.top - pad.bottom;
  const scale = clampScale(Math.min(width / room.width, height / room.depth));
  return {
    x: pad.left + (width - room.width * scale) / 2,
    y: pad.top + (height - room.depth * scale) / 2,
    scale,
    angle: 0,
  };
}

export function transformOf(view: View): string {
  return `translate(${view.x} ${view.y}) rotate(${view.angle}) scale(${view.scale})`;
}
