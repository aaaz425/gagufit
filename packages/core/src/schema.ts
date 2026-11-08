import type { Room } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;

export type SavedRoom = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  room: Room;
};

// 버전 올릴 때 이전 버전 변환 case 추가
export function migrate(data: unknown): SavedRoom {
  if (!isObject(data)) throw new Error("저장 데이터가 객체가 아님");
  switch (data.schemaVersion) {
    case 1:
      if (!isRoomV1(data.room)) throw new Error("v1 방 형식이 아님");
      return { schemaVersion: 1, room: data.room };
    default:
      throw new Error(
        `지원하지 않는 schemaVersion: ${JSON.stringify(data.schemaVersion)}`,
      );
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const isInt = (v: unknown, min = -Infinity, max = Infinity) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

const isPositiveInt = (v: unknown) => isInt(v, 1);

function isRoomV1(v: unknown): v is Room {
  return (
    isObject(v) &&
    typeof v.name === "string" &&
    isPositiveInt(v.width) &&
    isPositiveInt(v.depth) &&
    isPositiveInt(v.height) &&
    typeof v.floorMaterial === "string" &&
    typeof v.wallMaterial === "string" &&
    Array.isArray(v.openings) &&
    v.openings.every(isOpeningV1) &&
    Array.isArray(v.furniture) &&
    v.furniture.every(isFurnitureV1)
  );
}

function isOpeningV1(v: unknown): boolean {
  if (
    !isObject(v) ||
    typeof v.id !== "string" ||
    !isInt(v.wall, 0, 3) ||
    !isInt(v.offset, 0) ||
    !isPositiveInt(v.width) ||
    !isPositiveInt(v.height) ||
    !isInt(v.sill, 0)
  ) {
    return false;
  }
  if (v.kind === "hinged") {
    return (
      (v.hinge === "left" || v.hinge === "right") &&
      (v.swing === "in" || v.swing === "out")
    );
  }
  return v.kind === "sliding" || v.kind === "window";
}

function isFurnitureV1(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.presetId === "string" &&
    isObject(v.position) &&
    isInt(v.position.x) &&
    isInt(v.position.y) &&
    isInt(v.rotation, 0, 359) &&
    isObject(v.size) &&
    isPositiveInt(v.size.width) &&
    isPositiveInt(v.size.depth) &&
    isPositiveInt(v.size.height) &&
    typeof v.color === "string"
  );
}
