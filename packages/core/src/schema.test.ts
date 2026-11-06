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
    ],
    furniture: [
      {
        id: "f1",
        presetId: "bed-single",
        position: { x: 100, y: 150 },
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

  it("객체가 아니면 throw", () => {
    expect(() => migrate(null)).toThrow();
    expect(() => migrate("x")).toThrow();
    expect(() => migrate([])).toThrow();
  });

  it("모르는 버전이면 throw", () => {
    expect(() => migrate({ ...saved, schemaVersion: 2 })).toThrow(
      "schemaVersion",
    );
    expect(() => migrate({ room: saved.room })).toThrow("schemaVersion");
  });

  it("v1 방 형식이 아니면 throw", () => {
    expect(() => migrate({ schemaVersion: 1 })).toThrow();
    expect(() =>
      migrate({ schemaVersion: 1, room: { ...saved.room, width: 300.5 } }),
    ).toThrow();
    expect(() =>
      migrate({
        schemaVersion: 1,
        room: { ...saved.room, openings: undefined },
      }),
    ).toThrow();
  });
});
