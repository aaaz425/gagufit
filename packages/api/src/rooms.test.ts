import { CURRENT_SCHEMA_VERSION, type Room } from "@gagufit/core";
import { describe, expect, it } from "vitest";
import type { ApiClient } from "./client";
import { listRooms, saveRoom } from "./rooms";

// 쿼리가 끝날 때마다 results를 순서대로 돌려주는 가짜 클라이언트
function fakeClient(results: { data: unknown }[]) {
  const next = () => Promise.resolve({ error: null, ...results.shift()! });
  const chain: Record<string, unknown> = {
    then: (ok: (v: unknown) => unknown, ng?: (e: unknown) => unknown) =>
      next().then(ok, ng),
    maybeSingle: next,
  };
  for (const m of ["select", "update", "eq", "order"]) chain[m] = () => chain;
  return { from: () => chain } as unknown as ApiClient;
}

const room = (name: string): Room => ({
  name,
  width: 300,
  depth: 300,
  height: 240,
  floorMaterial: "floor-light-oak",
  wallMaterial: "wall-white-paint",
  openings: [],
  furniture: [],
});

describe("saveRoom", () => {
  it("base가 맞으면 새 updated_at을 돌려줌", async () => {
    const client = fakeClient([{ data: { updated_at: "t2" } }]);
    expect(await saveRoom(client, "id", room("a"), "t1")).toEqual({
      status: "saved",
      updatedAt: "t2",
    });
  });

  it("base가 다르고 방이 있으면 충돌", async () => {
    const client = fakeClient([{ data: null }, { data: { id: "id" } }]);
    expect(await saveRoom(client, "id", room("a"), "t1")).toEqual({
      status: "conflict",
    });
  });

  it("방이 없으면 삭제됨", async () => {
    const client = fakeClient([{ data: null }, { data: null }]);
    expect(await saveRoom(client, "id", room("a"), "t1")).toEqual({
      status: "deleted",
    });
  });
});

describe("listRooms", () => {
  it("열 수 없는 방만 빼고 나머지를 돌려줌", async () => {
    const good = { schemaVersion: CURRENT_SCHEMA_VERSION, room: room("ok") };
    const client = fakeClient([
      {
        data: [
          { id: "1", name: "ok", data: good, updated_at: "t" },
          {
            id: "2",
            name: "bad",
            data: { schemaVersion: 9999 },
            updated_at: "t",
          },
        ],
      },
    ]);
    const list = await listRooms(client);
    expect(list.map((r) => r.id)).toEqual(["1"]);
  });
});
