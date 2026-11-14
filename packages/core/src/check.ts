import { EPSILON, furnitureCorners, polygonsOverlap } from "./geometry";
import { doorPassageCorners, roomCorners, wallFrame } from "./room";
import type {
  FurnitureCategory,
  FurniturePreset,
  HingedDoor,
  PlacedFurniture,
  Room,
  SlidingDoor,
  Vec2,
  Warning,
} from "./types";

/** 앞면을 쓰는 가구 - 벽에 붙이면 열거나 앉기 불편 */
const HAS_FRONT: Readonly<Record<FurnitureCategory, boolean>> = {
  sofa: true,
  chair: true,
  desk: true,
  "dressing-table": true,
  wardrobe: true,
  drawer: true,
  fridge: true,
  washer: true,
  bookshelf: true,
  "tv-stand": true,
  bed: false,
  "dining-table": false,
  hanger: false,
  nightstand: false,
  rug: false,
  etc: false,
};

/** 앞면 가운데에서 벽까지 이 거리 미만이면 막힘 */
const FRONT_CLEARANCE = 50;

/** 프리셋 없는 가구는 normal 층으로 판정 */
export function checkRoom(
  room: Room,
  presets: Readonly<Record<string, FurniturePreset>>,
): Warning[] {
  const items = room.furniture.map((f) => ({
    id: f.id,
    // 저장 데이터의 presetId가 "toString" 같은 상속 키일 수 있음
    normal:
      !Object.hasOwn(presets, f.presetId) ||
      presets[f.presetId].layer === "normal",
    corners: furnitureCorners(f),
    front: frontOf(f, presets),
  }));
  const doors = room.openings.filter(
    (o): o is HingedDoor | SlidingDoor => o.kind !== "window",
  );
  const warnings: Warning[] = [];

  items.forEach((item, i) => {
    const out = item.corners.some((c) => !insideRoom(room, c));
    if (out) {
      warnings.push({ type: "outOfRoom", furnitureId: item.id });
    } else if (item.front && frontBlocked(room, item.front)) {
      warnings.push({ type: "frontBlocked", furnitureId: item.id });
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

type Front = { center: Vec2; dir: Vec2 };

function frontOf(
  f: PlacedFurniture,
  presets: Readonly<Record<string, FurniturePreset>>,
): Front | null {
  if (!Object.hasOwn(presets, f.presetId)) return null;
  if (!HAS_FRONT[presets[f.presetId].category]) return null;
  // 회전 0에서 +y, 회전은 furnitureCorners와 같은 방향
  const rad = (f.rotation * Math.PI) / 180;
  const dir = { x: Math.sin(rad), y: Math.cos(rad) };
  const half = f.size.depth / 2;
  return {
    center: { x: f.position.x + dir.x * half, y: f.position.y + dir.y * half },
    dir,
  };
}

/** 앞방향이 벽 바깥 방향과 ±45° 안인 벽이 가까움 */
function frontBlocked(room: Room, front: Front): boolean {
  return roomCorners(room).some((_, wall) => {
    const { start, inward } = wallFrame(room, wall);
    const facing = -(front.dir.x * inward.x + front.dir.y * inward.y);
    if (facing < Math.SQRT1_2 - EPSILON) return false;
    const gap =
      (front.center.x - start.x) * inward.x +
      (front.center.y - start.y) * inward.y;
    return gap < FRONT_CLEARANCE - EPSILON;
  });
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
