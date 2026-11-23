import { describe, expect, it } from "vitest";
import { CURRENT_SCHEMA_VERSION, migrate, type SavedRoom } from "./schema";

const saved: SavedRoom = {
  schemaVersion: 3,
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
        presetId: "bed",
        position: { x: -10, y: 150 },
        rotation: 90,
        size: { width: 110, depth: 200, height: 40 },
        color: "oak",
      },
    ],
  },
};

describe("migrate", () => {
  it("v3는 그대로", () => {
    const data: unknown = JSON.parse(JSON.stringify(saved));
    expect(migrate(data)).toEqual(saved);
  });

  describe("v1 -> v3", () => {
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
        presetId: "rug",
        product: {
          id: "rug-ongyeol-washable-200x400",
          name: "온결 워셔블 단모 사각 러그 200x400",
        },
      });
    });

    it("일반 가구와 모르는 id는 그대로", () => {
      const out = migrate(v1("bed-super-single", "no-such", "toString"));
      expect(out.room.furniture.map((f) => f.presetId)).toEqual([
        "bed",
        "no-such",
        "toString",
      ]);
      expect(out.room.furniture.some((f) => f.product)).toBe(false);
    });
  });

  describe("v2 -> v3", () => {
    // 실제 모양의 v2 - 옛 id, 상품 배치, 최소 크기보다 작은 저장 크기
    const v2 = {
      schemaVersion: 2,
      room: {
        ...saved.room,
        furniture: [
          {
            id: "a",
            presetId: "desk-120",
            position: { x: 80, y: 60 },
            rotation: 90,
            size: { width: 120, depth: 60, height: 74 },
            color: "white",
            product: { id: "desk-rockyhomes-gaming-1200", name: "락키홈즈" },
          },
          {
            id: "b",
            presetId: "etc-box",
            position: { x: 10, y: 20 },
            rotation: 0,
            size: { width: 3, depth: 3, height: 2 },
            color: "grey",
          },
          {
            id: "c",
            presetId: "old-unknown",
            position: { x: 0, y: 0 },
            rotation: 0,
            size: { width: 50, depth: 50, height: 50 },
            color: "grey",
          },
          {
            id: "d",
            presetId: "toString",
            position: { x: 0, y: 0 },
            rotation: 0,
            size: { width: 50, depth: 50, height: 50 },
            color: "grey",
          },
        ],
      },
    };

    it("presetId만 새 id로, 나머지는 그대로", () => {
      const out = migrate(JSON.parse(JSON.stringify(v2)));
      expect(out.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(out.room.furniture[0]).toEqual({
        ...v2.room.furniture[0],
        presetId: "desk",
      });
      // 최소 크기보다 작아도 보정하지 않음
      expect(out.room.furniture[1]).toEqual({
        ...v2.room.furniture[1],
        presetId: "etc",
      });
    });

    it("모르는 id는 지우지 않고 보존", () => {
      const out = migrate(JSON.parse(JSON.stringify(v2)));
      expect(out.room.furniture.slice(2).map((f) => f.presetId)).toEqual([
        "old-unknown",
        "toString",
      ]);
    });
  });

  it("모르는 버전이면 throw", () => {
    expect(() => migrate({ ...saved, schemaVersion: 4 })).toThrow(
      "schemaVersion",
    );
    expect(() => migrate({ room: saved.room })).toThrow("schemaVersion");
    expect(() => migrate({ ...saved, schemaVersion: "3" })).toThrow('"3"');
    expect(() => migrate({ ...saved, schemaVersion: 0 })).toThrow(
      "schemaVersion",
    );
  });

  const { room } = saved;

  it("내 가격은 0 이상 정수만", () => {
    const withPrice = (price: unknown) => ({
      schemaVersion: 3,
      room: { ...room, furniture: [{ ...room.furniture[0], price }] },
    });
    expect(migrate(withPrice(0)).room.furniture[0].price).toBe(0);
    expect(() => migrate(withPrice(-1))).toThrow("v3 방 형식");
    expect(() => migrate(withPrice(1.5))).toThrow("v3 방 형식");
  });

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
      migrate({ schemaVersion: 3, room: { ...room, ...patch } }),
    ).toThrow("v3 방 형식");
  });
});
