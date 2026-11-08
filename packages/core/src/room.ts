import type { Opening, OpeningKind, Room, Vec2, WallIndex } from "./types";

export const OPENING_DEFAULTS: Readonly<
  Record<OpeningKind, { width: number; height: number; sill: number }>
> = {
  hinged: { width: 80, height: 200, sill: 0 },
  sliding: { width: 120, height: 200, sill: 0 },
  window: { width: 100, height: 120, sill: 90 },
};

/** 미닫이·바깥 여닫이 문 앞 통로 깊이 */
export const DOOR_PASSAGE_DEPTH = 60;

export function roomCorners(room: Pick<Room, "width" | "depth">): Vec2[] {
  return [
    { x: 0, y: 0 },
    { x: room.width, y: 0 },
    { x: room.width, y: room.depth },
    { x: 0, y: room.depth },
  ];
}

export type WallFrame = {
  start: Vec2;
  end: Vec2;
  length: number;
  /** start → end 단위 벡터 */
  u: Vec2;
  /** 방 안쪽 단위 벡터 */
  inward: Vec2;
};

export function wallFrame(
  room: Pick<Room, "width" | "depth">,
  wall: WallIndex,
): WallFrame {
  const corners = roomCorners(room);
  if (!Number.isInteger(wall) || wall < 0 || wall >= corners.length) {
    throw new RangeError(`없는 벽 번호: ${wall}`);
  }
  const start = corners[wall];
  const end = corners[(wall + 1) % corners.length];
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  const u = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
  // 꼭짓점이 시계 방향이라 방 안쪽은 벽 방향의 오른쪽
  return { start, end, length, u, inward: { x: -u.y, y: u.x } };
}

/** 문 왼쪽 끝부터 시계 방향 */
export function doorPassageCorners(
  room: Pick<Room, "width" | "depth">,
  door: Pick<Opening, "wall" | "offset" | "width">,
): Vec2[] {
  const { start, u, inward } = wallFrame(room, door.wall);
  const d = {
    x: inward.x * DOOR_PASSAGE_DEPTH,
    y: inward.y * DOOR_PASSAGE_DEPTH,
  };
  const left = {
    x: start.x + u.x * door.offset,
    y: start.y + u.y * door.offset,
  };
  const right = { x: left.x + u.x * door.width, y: left.y + u.y * door.width };
  return [
    left,
    right,
    { x: right.x + d.x, y: right.y + d.y },
    { x: left.x + d.x, y: left.y + d.y },
  ];
}
