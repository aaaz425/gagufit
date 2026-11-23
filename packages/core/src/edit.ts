import { OPENING_DEFAULTS, roomCorners, wallFrame } from "./room";
import type {
  FurniturePreset,
  Opening,
  OpeningKind,
  PlacedFurniture,
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

/** 끌기·방향키로 가구 중심을 방 밖에 둘 수 있는 거리 cm */
export const MOVE_MARGIN = 100;

/** 정수로 반올림, 방 크기 + MOVE_MARGIN 안으로 자름 */
export function clampPosition(room: Room, p: Vec2): Vec2 {
  const q = roundVec2(p);
  return {
    x: Math.min(Math.max(q.x, -MOVE_MARGIN), room.width + MOVE_MARGIN),
    y: Math.min(Math.max(q.y, -MOVE_MARGIN), room.depth + MOVE_MARGIN),
  };
}

/** from에서 가로·세로 중 더 많이 움직인 축만 남김 - 같으면 가로 */
export function lockAxis(from: Vec2, to: Vec2): Vec2 {
  return Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)
    ? { x: to.x, y: from.y }
    : { x: from.x, y: to.y };
}

/** 가구 순환 선택 - 선택이 없거나 가구가 아니면 앞으로는 첫째, 뒤로는 마지막, 가구가 없으면 null */
export function cycleFurnitureId(
  room: Room,
  currentId: string | null,
  step: 1 | -1,
): string | null {
  const list = room.furniture;
  if (list.length === 0) return null;
  const i = list.findIndex((f) => f.id === currentId);
  if (i < 0) return list[step === 1 ? 0 : list.length - 1].id;
  return list[(i + step + list.length) % list.length].id;
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
        presetId: preset.baseId ?? preset.id,
        ...(preset.baseId && { product: { id: preset.id, name: preset.name } }),
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
  offset = DUPLICATE_OFFSET,
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
          x: source.position.x + offset,
          y: source.position.y + offset,
        },
      },
    ],
  };
}

function clampInt(v: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(v), min), max);
}

/** 프리셋 최소 크기 - 없는 프리셋이면 FURNITURE_SIZE_LIMITS.min */
export function minSizeOf(
  presets: Readonly<Record<string, FurniturePreset>>,
  presetId: string,
): Size {
  if (Object.hasOwn(presets, presetId)) return presets[presetId].minSize;
  const { min } = FURNITURE_SIZE_LIMITS;
  return { width: min, depth: min, height: min };
}

/** 넘겨 받은 항목만 정수로 반올림해 최소~최대로 자름 - 바뀐 게 없으면 같은 room */
export function resizeFurniture(
  room: Room,
  presets: Readonly<Record<string, FurniturePreset>>,
  furnitureId: string,
  size: Partial<Size>,
): Room {
  const source = room.furniture.find((f) => f.id === furnitureId);
  if (!source) throw new RangeError(`없는 가구: ${furnitureId}`);
  const { max } = FURNITURE_SIZE_LIMITS;
  const minSize = minSizeOf(presets, source.presetId);
  const next = { ...source.size };
  for (const key of ["width", "depth", "height"] as const) {
    const value = size[key];
    if (value !== undefined) next[key] = clampInt(value, minSize[key], max);
  }
  if (sameValues(next, source.size)) return room;
  return {
    ...room,
    furniture: room.furniture.map((f) =>
      f === source ? { ...f, size: next } : f,
    ),
  };
}

/** 값은 ===, 객체(position·size)는 내용으로 비교 */
function sameValues<T extends object>(a: T, b: T): boolean {
  const keys = Object.keys(a) as (keyof T)[];
  return (
    keys.length === Object.keys(b).length &&
    keys.every((k) => sameValue(a[k], b[k]))
  );
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  return (
    typeof a === "object" &&
    typeof b === "object" &&
    a !== null &&
    b !== null &&
    sameValues(a, b)
  );
}

/** 폭은 벽 길이까지, offset은 [0, 벽 길이 - 폭] */
function fitToWall<T extends Opening>(opening: T, length: number): T {
  const width = Math.min(opening.width, length);
  const offset = Math.min(Math.max(opening.offset, 0), length - width);
  return { ...opening, width, offset };
}

/** 없는 id면 RangeError - 바뀐 게 없으면 같은 room */
function editOpening(
  room: Room,
  openingId: string,
  update: (opening: Opening) => Opening,
): Room {
  const source = room.openings.find((o) => o.id === openingId);
  if (!source) throw new RangeError(`없는 문·창문: ${openingId}`);
  const next = update(source);
  if (sameValues<Opening>(next, source)) return room;
  return {
    ...room,
    openings: room.openings.map((o) => (o === source ? next : o)),
  };
}

/** 없는 id나 바뀐 게 없으면 같은 room */
export function updateOpening(
  room: Room,
  openingId: string,
  update: (opening: Opening) => Opening,
): Room {
  return room.openings.some((o) => o.id === openingId)
    ? editOpening(room, openingId, update)
    : room;
}

/** 넘겨 받은 항목만 바꿈, undefined로 주면 선택 항목(price)을 지움 - 없는 id나 바뀐 게 없으면 같은 room */
export function updateFurniture(
  room: Room,
  furnitureId: string,
  patch: Partial<Omit<PlacedFurniture, "id">>,
): Room {
  const source = room.furniture.find((f) => f.id === furnitureId);
  if (!source) return room;
  const next = { ...source, ...patch };
  if (next.price === undefined) delete next.price;
  if (sameValues(next, source)) return room;
  return {
    ...room,
    furniture: room.furniture.map((f) => (f === source ? next : f)),
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
  const offset = Math.round(best.start + (best.length - defaults.width) / 2);
  return {
    ...room,
    openings: [...room.openings, makeOpening(kind, id, best.wall, offset)],
  };
}

/** 크기는 종류 기본값, 여닫이는 경첩 왼쪽·안쪽 열림 */
function makeOpening(
  kind: OpeningKind,
  id: string,
  wall: WallIndex,
  offset: number,
): Opening {
  const base = { id, wall, offset, ...OPENING_DEFAULTS[kind] };
  return kind === "hinged"
    ? { ...base, kind, hinge: "left", swing: "in" }
    : { ...base, kind };
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
  return editOpening(room, openingId, (o) =>
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
  return editOpening(room, openingId, (o) =>
    fitToWall(
      { ...o, width: Math.max(Math.round(width), 1) },
      wallFrame(room, o.wall).length,
    ),
  );
}

/** 폭 핸들로 줄일 수 있는 최소 폭 */
export const OPENING_MIN_WIDTH = 30;

/** along은 벽 왼쪽 끝부터 거리 - 반대쪽 끝은 고정, 벽 안으로 자름 */
export function setOpeningEdge(
  room: Room,
  openingId: string,
  side: "left" | "right",
  along: number,
): Room {
  return editOpening(room, openingId, (o) => {
    const right = o.offset + o.width;
    if (side === "left") {
      const left = Math.max(clampInt(along, 0, right - OPENING_MIN_WIDTH), 0);
      return { ...o, offset: left, width: right - left };
    }
    const { length } = wallFrame(room, o.wall);
    const end = clampInt(along, o.offset + OPENING_MIN_WIDTH, length);
    return { ...o, width: end - o.offset };
  });
}

/** 크기·경첩은 새 종류 기본값, 가운데 유지 */
export function setOpeningKind(
  room: Room,
  openingId: string,
  kind: OpeningKind,
): Room {
  return editOpening(room, openingId, (o) => {
    if (o.kind === kind) return o;
    const offset = o.offset + (o.width - OPENING_DEFAULTS[kind].width) / 2;
    return fitToWall(
      makeOpening(kind, o.id, o.wall, Math.round(offset)),
      wallFrame(room, o.wall).length,
    );
  });
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
