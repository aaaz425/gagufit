import type { PlacedFurniture, Size, Vec2 } from "./types";

/** 부동소수 오차 허용 - cm 단위 */
export const EPSILON = 1e-6;

/** 90° 배수는 정확한 값 - cos(90°) 같은 오차 방지 */
function cosSin(deg: number): [number, number] {
  const d = ((deg % 360) + 360) % 360;
  if (d === 0) return [1, 0];
  if (d === 90) return [0, 1];
  if (d === 180) return [-1, 0];
  if (d === 270) return [0, -1];
  const rad = (d * Math.PI) / 180;
  return [Math.cos(rad), Math.sin(rad)];
}

/**
 * 가구 바닥 사각형 꼭짓점 4개
 * - 회전 0일 때 왼쪽 위부터 시계 방향
 * - rotation 양수는 위에서 본 평면에서 반시계 - three.js rotation.y와 같음
 */
export function furnitureCorners(
  furniture: Pick<PlacedFurniture, "position" | "rotation">,
  size: Pick<Size, "width" | "depth">,
): Vec2[] {
  const [cos, sin] = cosSin(furniture.rotation);
  const { x, y } = furniture.position;
  const hw = size.width / 2;
  const hd = size.depth / 2;
  return [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ].map(([lx, ly]) => ({
    // three.js y축 회전 (x, z) → (x cos + z sin, -x sin + z cos)
    x: x + lx * cos + ly * sin,
    y: y - lx * sin + ly * cos,
  }));
}

function project(points: readonly Vec2[], axis: Vec2): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const p of points) {
    const v = p.x * axis.x + p.y * axis.y;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
}

/** 볼록 다각형 겹침 (SAT) - 맞닿기만 하면 겹침 아님 */
export function polygonsOverlap(
  a: readonly Vec2[],
  b: readonly Vec2[],
): boolean {
  for (const poly of [a, b]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const q = poly[(i + 1) % poly.length];
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      if (len === 0) continue;
      const axis = { x: -(q.y - p.y) / len, y: (q.x - p.x) / len };
      const [minA, maxA] = project(a, axis);
      const [minB, maxB] = project(b, axis);
      if (maxA <= minB + EPSILON || maxB <= minA + EPSILON) return false;
    }
  }
  return true;
}
