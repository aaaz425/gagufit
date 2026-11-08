import { OPENING_DEFAULTS, roomCorners, wallFrame } from "./room";
import type {
  FurniturePreset,
  Opening,
  OpeningKind,
  Room,
  Size,
  Vec2,
  WallIndex,
} from "./types";

/** 배치 가구 크기 범위 - 가로·세로·높이 공통 */
export const FURNITURE_SIZE_LIMITS = { min: 1, max: 1000 } as const;

/** 회전 핸들이 0·90·180·270°에 붙는 범위 */
export const ROTATION_SNAP_THRESHOLD = 5;

/** 복제본을 원본에서 x·y로 옮기는 거리 */
export const DUPLICATE_OFFSET = 20;

function normalizeDeg(deg: number): number {
  return ((Math.round(deg) % 360) + 360) % 360;
}

/** 90° 배수 근처면 그 값, 아니면 정수 반올림 - 0~359 */
export function snapRotation(
  deg: number,
  threshold = ROTATION_SNAP_THRESHOLD,
): number {
  const right = Math.round(deg / 90) * 90;
  return normalizeDeg(Math.abs(deg - right) <= threshold ? right : deg);
}

export function roundVec2(p: Vec2): Vec2 {
  return { x: Math.round(p.x), y: Math.round(p.y) };
}

/** 방 중앙에 회전 0으로 추가 */
export function addFurniture(
  room: Room,
  preset: FurniturePreset,
  id: string,
): Room {
  return {
    ...room,
    furniture: [
      ...room.furniture,
      {
        id,
        presetId: preset.id,
        position: roundVec2({ x: room.width / 2, y: room.depth / 2 }),
        rotation: 0,
        size: { ...preset.size },
        color: preset.defaultColor,
      },
    ],
  };
}

export function duplicateFurniture(
  room: Room,
  furnitureId: string,
  id: string,
): Room {
  const source = room.furniture.find((f) => f.id === furnitureId);
  if (!source) throw new RangeError(`없는 가구: ${furnitureId}`);
  return {
    ...room,
    furniture: [
      ...room.furniture,
      {
        ...source,
        id,
        position: {
          x: source.position.x + DUPLICATE_OFFSET,
          y: source.position.y + DUPLICATE_OFFSET,
        },
      },
    ],
  };
}

/** 폭은 벽 길이까지, offset은 [0, 벽 길이 - 폭] */
function clampInt(v: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(v), min), max);
}

/** 정수로 반올림, FURNITURE_SIZE_LIMITS로 자름 - 바뀐 게 없으면 같은 room */
export function resizeFurniture(
  room: Room,
  furnitureId: string,
  size: Partial<Size>,
): Room {
  const source = room.furniture.find((f) => f.id === furnitureId);
  if (!source) throw new RangeError(`없는 가구: ${furnitureId}`);
  const { min, max } = FURNITURE_SIZE_LIMITS;
  const next = { ...source.size };
  for (const key of ["width", "depth", "height"] as const) {
    const value = size[key];
    if (value !== undefined) next[key] = clampInt(value, min, max);
  }
  if (sameValues(next, source.size)) return room;
  return {
    ...room,
    furniture: room.furniture.map((f) =>
      f === source ? { ...f, size: next } : f,
    ),
  };
}

function sameValues<T extends object>(a: T, b: T): boolean {
  const keys = Object.keys(a) as (keyof T)[];
  return (
    keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k])
  );
}

function fitToWall<T extends Opening>(opening: T, length: number): T {
  const width = Math.min(opening.width, length);
  const offset = Math.min(Math.max(opening.offset, 0), length - width);
  return { ...opening, width, offset };
}

function updateOpening(
  room: Room,
  openingId: string,
  update: (opening: Opening) => Opening,
): Room {
  if (!room.openings.some((o) => o.id === openingId)) {
    throw new RangeError(`없는 문·창문: ${openingId}`);
  }
  return {
    ...room,
    openings: room.openings.map((o) => (o.id === openingId ? update(o) : o)),
  };
}

/** 가장 긴 빈 벽 구간 가운데에 추가 - 기본 폭이 들어갈 곳이 없으면 null */
export function addOpening(
  room: Room,
  kind: OpeningKind,
  id: string,
): Room | null {
  const defaults = OPENING_DEFAULTS[kind];
  let best: { wall: WallIndex; start: number; length: number } | null = null;
  for (let wall = 0; wall < roomCorners(room).length; wall++) {
    const used = room.openings
      .filter((o) => o.wall === wall)
      .sort((a, b) => a.offset - b.offset);
    let cursor = 0;
    for (const end of [
      ...used,
      { offset: wallFrame(room, wall).length, width: 0 },
    ]) {
      const length = end.offset - cursor;
      if (!best || length > best.length) best = { wall, start: cursor, length };
      cursor = Math.max(cursor, end.offset + end.width);
    }
  }
  if (!best || best.length < defaults.width) return null;
  const base = {
    id,
    wall: best.wall,
    offset: Math.round(best.start + (best.length - defaults.width) / 2),
    ...defaults,
  };
  const opening: Opening =
    kind === "hinged"
      ? { ...base, kind, hinge: "left", swing: "in" }
      : { ...base, kind };
  return { ...room, openings: [...room.openings, opening] };
}

/** point는 개구부 가운데 - 가장 가까운 벽에 붙고 모서리 안으로 제한 */
export function moveOpening(room: Room, openingId: string, point: Vec2): Room {
  let nearest = { wall: 0, along: 0, distance: Infinity };
  for (let wall = 0; wall < roomCorners(room).length; wall++) {
    const { start, length, u } = wallFrame(room, wall);
    const along = Math.min(
      Math.max((point.x - start.x) * u.x + (point.y - start.y) * u.y, 0),
      length,
    );
    const distance = Math.hypot(
      point.x - (start.x + u.x * along),
      point.y - (start.y + u.y * along),
    );
    if (distance < nearest.distance) nearest = { wall, along, distance };
  }
  const { wall, along } = nearest;
  return updateOpening(room, openingId, (o) =>
    fitToWall(
      { ...o, wall, offset: Math.round(along - o.width / 2) },
      wallFrame(room, wall).length,
    ),
  );
}

/** 왼쪽 끝 유지, 벽을 넘으면 왼쪽으로 밀림 - 1 이상 정수 */
export function setOpeningWidth(
  room: Room,
  openingId: string,
  width: number,
): Room {
  return updateOpening(room, openingId, (o) =>
    fitToWall(
      { ...o, width: Math.max(Math.round(width), 1) },
      wallFrame(room, o.wall).length,
    ),
  );
}

type RoomSize = Pick<Room, "width" | "depth" | "height">;

export const ROOM_LIMITS: Readonly<
  Record<keyof RoomSize, { min: number; max: number }>
> = {
  width: { min: 100, max: 2000 },
  depth: { min: 100, max: 2000 },
  height: { min: 200, max: 400 },
};

/** 정수로 반올림, ROOM_LIMITS로 자름 - 벽보다 길어진 문·창문은 벽에 맞춰 줄임 */
export function resizeRoom(room: Room, size: Partial<RoomSize>): Room {
  const next = { ...room };
  for (const key of ["width", "depth", "height"] as const) {
    const value = size[key];
    if (value === undefined) continue;
    next[key] = clampInt(value, ROOM_LIMITS[key].min, ROOM_LIMITS[key].max);
  }
  if (sameValues(next, room)) return room;
  return {
    ...next,
    openings: next.openings.map((o) =>
      fitToWall(o, wallFrame(next, o.wall).length),
    ),
  };
}
