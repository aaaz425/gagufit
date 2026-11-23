import { describe, expect, it } from "vitest";
import { CURRENT_SCHEMA_VERSION, migrate, type SavedRoom } from "./schema";

const saved: SavedRoom = {
  schemaVersion: 2,
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
        size: { width: 110, depth: 200, height: 40 },
        color: "oak",
      },
    ],
  },
};

describe("migrate", () => {
  it("v2는 그대로", () => {
    const data: unknown = JSON.parse(JSON.stringify(saved));
    expect(migrate(data)).toEqual(saved);
  });

  describe("v1 -> v2", () => {
    const v1 = (...presetIds: string[]) => ({
      schemaVersion: 1,
      room: {
        ...saved.room,
        furniture: presetIds.map((presetId, i) => ({
          ...saved.room.furniture[0],
          id: `f${i}`,
          presetId,
        })),
      },
    });

    it("상품 가구는 기본 프리셋 id + product로 바뀜", () => {
      const out = migrate(v1("rug-ongyeol-washable-200x400"));
      expect(out.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(out.room.furniture[0]).toMatchObject({
        presetId: "rug-160",
        product: {
          id: "rug-ongyeol-washable-200x400",
          name: "온결 워셔블 단모 사각 러그 200x400",
        },
      });
    });

    it("일반 가구와 모르는 id는 그대로", () => {
      const out = migrate(v1("bed-super-single", "no-such", "toString"));
      expect(out.room.furniture.map((f) => f.presetId)).toEqual([
        "bed-super-single",
        "no-such",
        "toString",
      ]);
      expect(out.room.furniture.some((f) => f.product)).toBe(false);
    });
  });

  it("모르는 버전이면 throw", () => {
    expect(() => migrate({ ...saved, schemaVersion: 3 })).toThrow(
      "schemaVersion",
    );
    expect(() => migrate({ room: saved.room })).toThrow("schemaVersion");
    expect(() => migrate({ ...saved, schemaVersion: "2" })).toThrow('"2"');
    expect(() => migrate({ ...saved, schemaVersion: 0 })).toThrow(
      "schemaVersion",
    );
  });

  const { room } = saved;

  it.each([
    ["벽 번호 범위 밖", { openings: [{ ...room.openings[0], wall: 4 }] }],
    [
      "위치 정수 아님",
      { furniture: [{ ...room.furniture[0], position: { x: 1.5, y: 0 } }] },
    ],
    [
      "가구 크기 0",
      {
        furniture: [
          {
            ...room.furniture[0],
            size: { ...room.furniture[0].size, width: 0 },
          },
        ],
      },
    ],
  ])("%s이면 throw", (_, patch) => {
    expect(() =>
      migrate({ schemaVersion: 2, room: { ...room, ...patch } }),
    ).toThrow("v2 방 형식");
  });
});
