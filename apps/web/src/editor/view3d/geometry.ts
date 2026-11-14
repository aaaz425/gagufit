import type { Vec2 } from "@gagufit/core";
import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from "three";

/** cm → m, 렌더링 시에만 */
export const m = (cm: number) => cm / 100;

/** 방 평면 좌표 cm → 방 가운데가 원점인 월드 x·z m */
export const planToWorld = (
  room: { width: number; depth: number },
  p: Vec2,
): [number, number] => [m(p.x - room.width / 2), m(p.y - room.depth / 2)];

/** 월드 x·z m → 방 평면 좌표 cm */
export const worldToPlan = (
  room: { width: number; depth: number },
  x: number,
  z: number,
): Vec2 => ({ x: x * 100 + room.width / 2, y: z * 100 + room.depth / 2 });

/** 도 → rotation.y 라디안 */
export const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * 텍스처가 늘어나지 않게 uv를 m 단위로 둔 상자 - 텍스처 repeat로 실제 크기 맞춤
 * origin은 상자 중심의 기준 좌표(m) - 이어진 벽 조각끼리 무늬가 이어지게
 */
export function worldUvBox(
  size: [number, number, number],
  origin: [number, number, number],
) {
  const geometry = new BoxGeometry(...size);
  const pos = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + origin[0];
    const y = pos.getY(i) + origin[1];
    const z = pos.getZ(i) + origin[2];
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    if (nx > 0.5) uv.setXY(i, z, y);
    else if (ny > 0.5) uv.setXY(i, x, z);
    else uv.setXY(i, x, y);
  }
  uv.needsUpdate = true;
  return geometry;
}

/** 바닥 위 볼록 다각형 - 평면 좌표 cm, 높이 m */
export function floorPolygon(points: readonly Vec2[], y: number) {
  const vertices: number[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    for (const p of [points[0], points[i], points[i + 1]]) {
      vertices.push(m(p.x), y, m(p.y));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  return geometry;
}
