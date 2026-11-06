import type { Room } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;

export type SavedRoom = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  room: Room;
};

/** 저장된 데이터를 현재 버전으로 - 버전 올릴 때 이전 버전 변환 case 추가 */
export function migrate(data: unknown): SavedRoom {
  if (!isObject(data)) throw new Error("저장 데이터가 객체가 아님");
  switch (data.schemaVersion) {
    case 1:
      if (!isRoomV1(data.room)) throw new Error("v1 방 형식이 아님");
      return { schemaVersion: 1, room: data.room };
    default:
      throw new Error(
        `지원하지 않는 schemaVersion: ${String(data.schemaVersion)}`,
      );
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isRoomV1(v: unknown): v is Room {
  return (
    isObject(v) &&
    typeof v.name === "string" &&
    Number.isInteger(v.width) &&
    Number.isInteger(v.depth) &&
    Number.isInteger(v.height) &&
    typeof v.floorMaterial === "string" &&
    typeof v.wallMaterial === "string" &&
    Array.isArray(v.openings) &&
    Array.isArray(v.furniture)
  );
}
