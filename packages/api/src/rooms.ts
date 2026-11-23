import { CURRENT_SCHEMA_VERSION, migrate, type Room } from "@gagufit/core";
import type { ApiClient } from "./client";

export type RoomSummary = {
  id: string;
  name: string;
  room: Room;
  updatedAt: string;
};

export type RoomRecord = { room: Room; updatedAt: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const wrap = (room: Room) => ({ schemaVersion: CURRENT_SCHEMA_VERSION, room });

export async function listRooms(client: ApiClient): Promise<RoomSummary[]> {
  const { data, error } = await client
    .from("rooms")
    .select("id, name, data, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  // 못 여는 방 하나가 목록 전체를 막지 않게 뺌
  return data.flatMap((r) => {
    try {
      return [
        {
          id: r.id,
          name: r.name,
          room: migrate(r.data).room,
          updatedAt: r.updated_at,
        },
      ];
    } catch {
      return [];
    }
  });
}

// 없거나 uuid 형식이 아니면 null
export async function getRoom(
  client: ApiClient,
  id: string,
): Promise<RoomRecord | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await client
    .from("rooms")
    .select("data, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { room: migrate(data.data).room, updatedAt: data.updated_at };
}

export async function createRoom(
  client: ApiClient,
  room: Room,
): Promise<string> {
  const { data, error } = await client
    .from("rooms")
    .insert({ name: room.name, data: wrap(room) })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

// 충돌 - base 이후 다른 곳에서 저장함, 삭제됨 - 방이 없음
export type SaveResult =
  | { status: "saved"; updatedAt: string }
  | { status: "conflict" }
  | { status: "deleted" };

// base - 편집 시작한 서버 updated_at, 다르면 덮어쓰지 않음
export async function saveRoom(
  client: ApiClient,
  id: string,
  room: Room,
  base: string,
): Promise<SaveResult> {
  const { data, error } = await client
    .from("rooms")
    .update({ name: room.name, data: wrap(room) })
    .eq("id", id)
    .eq("updated_at", base)
    .select("updated_at")
    .maybeSingle();
  if (error) throw error;
  if (data) return { status: "saved", updatedAt: data.updated_at };
  const { data: exists, error: existsError } = await client
    .from("rooms")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (existsError) throw existsError;
  return { status: exists ? "conflict" : "deleted" };
}

export async function deleteRoom(client: ApiClient, id: string): Promise<void> {
  const { error } = await client.from("rooms").delete().eq("id", id);
  if (error) throw error;
}
