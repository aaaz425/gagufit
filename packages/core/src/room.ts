import type { OpeningKind, Room, Vec2, WallIndex } from "./types";

export const OPENING_DEFAULTS: Readonly<
  Record<OpeningKind, { width: number; height: number; sill: number }>
> = {
  hinged: { width: 80, height: 200, sill: 0 },
  sliding: { width: 120, height: 200, sill: 0 },
  window: { width: 100, height: 120, sill: 90 },
};

export function roomCorners(room: Pick<Room, "width" | "depth">): Vec2[] {
  return [
    { x: 0, y: 0 },
    { x: room.width, y: 0 },
    { x: room.width, y: room.depth },
    { x: 0, y: room.depth },
  ];
}

export function wallSegment(
  room: Pick<Room, "width" | "depth">,
  wall: WallIndex,
): { start: Vec2; end: Vec2 } {
  const corners = roomCorners(room);
  if (!Number.isInteger(wall) || wall < 0 || wall >= corners.length) {
    throw new RangeError(`없는 벽 번호: ${wall}`);
  }
  return { start: corners[wall], end: corners[(wall + 1) % corners.length] };
}
