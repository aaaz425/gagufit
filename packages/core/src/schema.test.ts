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
    expect(() => migrate({ ...saved, schemaVersion: "1" })).toThrow('"1"');
  });

  it("v1 방 형식이 아니면 throw", () => {
    expect(() => migrate({ schemaVersion: 1 })).toThrow();
  });

  const room = saved.room;
  const [door] = room.openings;
  const [item] = room.furniture;
  const withRoom = (patch: object) => ({ ...room, ...patch });
  const withOpening = (patch: object) =>
    withRoom({ openings: [{ ...door, ...patch }] });
  const withFurniture = (patch: object) =>
    withRoom({ furniture: [{ ...item, ...patch }] });

  it.each([
    ["width 소수", withRoom({ width: 300.5 })],
    ["width 0", withRoom({ width: 0 })],
    ["depth 음수", withRoom({ depth: -1 })],
    ["height 0", withRoom({ height: 0 })],
    ["name 없음", withRoom({ name: undefined })],
    ["floorMaterial 숫자", withRoom({ floorMaterial: 1 })],
    ["openings 배열 아님", withRoom({ openings: undefined })],
    ["furniture 배열 아님", withRoom({ furniture: {} })],
    ["opening 객체 아님", withRoom({ openings: [null] })],
    ["opening id 숫자", withOpening({ id: 1 })],
    ["opening kind 모름", withOpening({ kind: "arch" })],
    ["opening wall 7", withOpening({ wall: 7 })],
    ["opening wall 음수", withOpening({ wall: -1 })],
    ["opening wall 소수", withOpening({ wall: 1.5 })],
    ["opening offset 음수", withOpening({ offset: -1 })],
    ["opening width 0", withOpening({ width: 0 })],
    ["opening height 소수", withOpening({ height: 199.5 })],
    ["opening sill 음수", withOpening({ sill: -1 })],
    ["hinged hinge 없음", withOpening({ hinge: undefined })],
    ["hinged swing 모름", withOpening({ swing: "up" })],
    ["furniture 객체 아님", withRoom({ furniture: ["x"] })],
    ["furniture id 없음", withFurniture({ id: undefined })],
    ["furniture presetId 숫자", withFurniture({ presetId: 1 })],
    ["position 없음", withFurniture({ position: undefined })],
    ["position x 소수", withFurniture({ position: { x: 1.5, y: 0 } })],
    ["position y 없음", withFurniture({ position: { x: 0 } })],
    ["rotation 360", withFurniture({ rotation: 360 })],
    ["rotation 음수", withFurniture({ rotation: -90 })],
    ["rotation 소수", withFurniture({ rotation: 45.5 })],
    ["color 없음", withFurniture({ color: undefined })],
  ])("%s이면 throw", (_, badRoom) => {
    expect(() => migrate({ schemaVersion: 1, room: badRoom })).toThrow(
      "v1 방 형식",
    );
  });
});
