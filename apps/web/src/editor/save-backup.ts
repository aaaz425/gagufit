import { CURRENT_SCHEMA_VERSION, migrate, type Room } from "@gagufit/core";

// 서버 저장에 실패한 방 임시 보관 - 방마다 하나, base는 보관 당시 서버 updated_at
export type Backup = { room: Room; base: string };

const keyOf = (roomId: string) => `gagufit:backup:${roomId}`;

// localStorage는 막혀 있을 수 있어 모두 try/catch
export function writeBackup(roomId: string, room: Room, base: string) {
  try {
    localStorage.setItem(
      keyOf(roomId),
      JSON.stringify({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        room,
        base,
      }),
    );
  } catch {}
}

export function clearBackup(roomId: string) {
  try {
    localStorage.removeItem(keyOf(roomId));
  } catch {}
}

/** 깨졌거나 형식이 맞지 않으면 null */
export function readBackup(roomId: string): Backup | null {
  try {
    const raw = localStorage.getItem(keyOf(roomId));
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    const { base } = data as { base?: unknown };
    if (typeof base !== "string") return null;
    return { room: migrate(data).room, base };
  } catch {
    return null;
  }
}
