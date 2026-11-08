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
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    room: migrate(r.data).room,
    updatedAt: r.updated_at,
  }));
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

// 반환값은 서버가 갱신한 updated_at
export async function saveRoom(
  client: ApiClient,
  id: string,
  room: Room,
): Promise<string> {
  const { data, error } = await client
    .from("rooms")
    .update({ name: room.name, data: wrap(room) })
    .eq("id", id)
    .select("updated_at")
    .single();
  if (error) throw error;
  return data.updated_at;
}

export async function deleteRoom(client: ApiClient, id: string): Promise<void> {
  const { error } = await client.from("rooms").delete().eq("id", id);
  if (error) throw error;
}
