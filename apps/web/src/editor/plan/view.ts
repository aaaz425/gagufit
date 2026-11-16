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
  return screenDeltaToRoom(view.angle, {
    x: (p.x - view.x) / view.scale,
    y: (p.y - view.y) / view.scale,
  });
}

/** 화면에서 보이는 방향 벡터를 방 좌표 방향으로 - 화면이 angle만큼 회전해 있음 */
export function screenDeltaToRoom(angle: number, d: Vec2): Vec2 {
  const c = Math.cos(rad(angle));
  const s = Math.sin(rad(angle));
  return { x: d.x * c + d.y * s, y: -d.x * s + d.y * c };
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

/** 캔버스 가장자리에서 방의 점이 안쪽으로 들어와야 하는 최소 거리 - 화면 px */
export const MIN_VISIBLE = 96;

const between = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** 화면 중심에서 가장 가까운 방 위의 점이 캔버스 안쪽 MIN_VISIBLE 안에 들어오게 이동 - 패널은 무시 */
export function clampView(
  view: View,
  room: { width: number; depth: number },
  size: { width: number; height: number },
): View {
  const center = { x: size.width / 2, y: size.height / 2 };
  const c = toRoom(view, center);
  const q = toScreen(view, {
    x: between(c.x, 0, room.width),
    y: between(c.y, 0, room.depth),
  });
  const keepX = Math.min(MIN_VISIBLE, center.x);
  const keepY = Math.min(MIN_VISIBLE, center.y);
  const dx = between(q.x, keepX, size.width - keepX) - q.x;
  const dy = between(q.y, keepY, size.height - keepY) - q.y;
  return dx === 0 && dy === 0
    ? view
    : { ...view, x: view.x + dx, y: view.y + dy };
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
