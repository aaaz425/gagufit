import { EPSILON, furnitureCorners, polygonsOverlap } from "./geometry";
import { doorPassageCorners, wallFrame } from "./room";
import type {
  FurniturePreset,
  HingedDoor,
  Room,
  SlidingDoor,
  Vec2,
  Warning,
} from "./types";

/** 프리셋 없는 가구는 크기를 몰라 판정 제외 */
export function checkRoom(
  room: Room,
  presets: Readonly<Record<string, FurniturePreset>>,
): Warning[] {
  const items = room.furniture.flatMap((f) => {
    // 저장 데이터의 presetId가 "toString" 같은 상속 키일 수 있음
    if (!Object.hasOwn(presets, f.presetId)) return [];
    const preset = presets[f.presetId];
    return [
      {
        id: f.id,
        normal: preset.layer === "normal",
        corners: furnitureCorners(f, preset.size),
      },
    ];
  });
  const doors = room.openings.filter(
    (o): o is HingedDoor | SlidingDoor => o.kind !== "window",
  );
  const warnings: Warning[] = [];

  items.forEach((item, i) => {
    if (item.corners.some((c) => !insideRoom(room, c))) {
      warnings.push({ type: "outOfRoom", furnitureId: item.id });
    }
    if (!item.normal) return;
    for (const door of doors) {
      if (doorBlocked(room, door, item.corners)) {
        warnings.push({
          type: "doorBlocked",
          openingId: door.id,
          furnitureId: item.id,
        });
      }
    }
    for (const other of items.slice(i + 1)) {
      if (other.normal && polygonsOverlap(item.corners, other.corners)) {
        warnings.push({ type: "overlap", furnitureIds: [item.id, other.id] });
      }
    }
  });
  return warnings;
}

function insideRoom(room: Room, p: Vec2): boolean {
  return (
    p.x >= -EPSILON &&
    p.y >= -EPSILON &&
    p.x <= room.width + EPSILON &&
    p.y <= room.depth + EPSILON
  );
}

function doorBlocked(
  room: Room,
  door: HingedDoor | SlidingDoor,
  corners: readonly Vec2[],
): boolean {
  if (door.kind === "hinged" && door.swing === "in") {
    return doorSwingOverlaps(room, door, corners);
  }
  return polygonsOverlap(doorPassageCorners(room, door), corners);
}

// 경첩점 기준 좌표에서 부채꼴은 x ≥ 0, y ≥ 0, |p| ≤ 문 폭 - 사각형을 사분면으로 잘라 거리 비교
function doorSwingOverlaps(
  room: Room,
  door: HingedDoor,
  corners: readonly Vec2[],
): boolean {
  const { start, u, inward } = wallFrame(room, door.wall);
  // 경첩점에서 닫힌 문이 놓인 방향
  const along = door.hinge === "left" ? u : { x: -u.x, y: -u.y };
  const hingeOffset =
    door.hinge === "left" ? door.offset : door.offset + door.width;
  const hinge = {
    x: start.x + u.x * hingeOffset,
    y: start.y + u.y * hingeOffset,
  };

  let poly = corners.map((c) => {
    const d = { x: c.x - hinge.x, y: c.y - hinge.y };
    return {
      x: d.x * along.x + d.y * along.y,
      y: d.x * inward.x + d.y * inward.y,
    };
  });
  poly = clipHalfPlane(poly, (p) => p.x);
  poly = clipHalfPlane(poly, (p) => p.y);
  if (Math.abs(area(poly)) <= EPSILON) return false;
  return distanceToOrigin(poly) < door.width - EPSILON;
}

/** f는 선형 */
function clipHalfPlane(poly: Vec2[], f: (p: Vec2) => number): Vec2[] {
  const out: Vec2[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const fp = f(p);
    const fq = f(q);
    if (fp >= 0) out.push(p);
    if (fp >= 0 !== fq >= 0) {
      const t = fp / (fp - fq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  });
  return out;
}

function area(poly: readonly Vec2[]): number {
  let sum = 0;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    sum += p.x * q.y - q.x * p.y;
  });
  return sum / 2;
}

/** 다각형이 사분면 안이라 원점은 안쪽에 없음 - 변까지 거리만 봄 */
function distanceToOrigin(poly: readonly Vec2[]): number {
  let min = Infinity;
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const lenSq = dx * dx + dy * dy;
    const t =
      lenSq === 0
        ? 0
        : Math.min(1, Math.max(0, -(p.x * dx + p.y * dy) / lenSq));
    min = Math.min(min, Math.hypot(p.x + dx * t, p.y + dy * t));
  });
  return min;
}
