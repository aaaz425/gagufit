import { describe, expect, it } from "vitest";
import { migrate, type SavedRoom } from "./schema";

const saved: SavedRoom = {
  schemaVersion: 1,
  room: {
    name: "내 방",
    width: 300,
    depth: 400,
    height: 240,
    floorMaterial: "floor-light-oak",
    wallMaterial: "wall-white-paint",
    openings: [
      {
        id: "d1",
        kind: "hinged",
        wall: 2,
        offset: 20,
        width: 80,
        height: 200,
        sill: 0,
        hinge: "left",
        swing: "in",
      },
      {
        id: "d2",
        kind: "sliding",
        wall: 0,
        offset: 0,
        width: 120,
        height: 200,
        sill: 0,
      },
      {
        id: "w1",
        kind: "window",
        wall: 1,
        offset: 100,
        width: 100,
        height: 120,
        sill: 90,
      },
    ],
    furniture: [
      {
        id: "f1",
        presetId: "bed-single",
        position: { x: -10, y: 150 },
        rotation: 90,
        color: "oak",
      },
    ],
  },
};

describe("migrate", () => {
  it("v1은 그대로", () => {
    const data: unknown = JSON.parse(JSON.stringify(saved));
    expect(migrate(data)).toEqual(saved);
  });

  it("모르는 버전이면 throw", () => {
    expect(() => migrate({ ...saved, schemaVersion: 2 })).toThrow(
      "schemaVersion",
    );
    expect(() => migrate({ room: saved.room })).toThrow("schemaVersion");
    expect(() => migrate({ ...saved, schemaVersion: "1" })).toThrow('"1"');
  });

  const { room } = saved;

  it.each([
    ["벽 번호 범위 밖", { openings: [{ ...room.openings[0], wall: 4 }] }],
    [
      "위치 정수 아님",
      { furniture: [{ ...room.furniture[0], position: { x: 1.5, y: 0 } }] },
    ],
  ])("%s이면 throw", (_, patch) => {
    expect(() =>
      migrate({ schemaVersion: 1, room: { ...room, ...patch } }),
    ).toThrow("v1 방 형식");
  });
});
