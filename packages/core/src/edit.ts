import type { FurniturePreset, Room, Vec2 } from "./types";

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
