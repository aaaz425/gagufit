import { CURRENT_SCHEMA_VERSION, migrate, type Room } from "@gagufit/core";

// 서버 저장에 실패한 방 임시 보관 - 방마다 하나, at은 보관 시각(ms)
export type Backup = { room: Room; at: number };

const keyOf = (roomId: string) => `gagufit:backup:${roomId}`;

// localStorage는 막혀 있을 수 있어 모두 try/catch
export function writeBackup(roomId: string, room: Room) {
  try {
    localStorage.setItem(
      keyOf(roomId),
      JSON.stringify({ room, at: Date.now() }),
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
    const { room, at } = data as { room?: unknown; at?: unknown };
    if (typeof at !== "number") return null;
    const saved = migrate({ schemaVersion: CURRENT_SCHEMA_VERSION, room });
    return { room: saved.room, at };
  } catch {
    return null;
  }
}
