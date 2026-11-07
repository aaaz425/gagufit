import { describe, expect, it } from "vitest";
import {
  addFurniture,
  DUPLICATE_OFFSET,
  duplicateFurniture,
  snapRotation,
} from "./edit";
import type { FurniturePreset, Room } from "./types";

const room: Room = {
  name: "방",
  width: 301,
  depth: 200,
  height: 240,
  floorMaterial: "floor-light-oak",
  wallMaterial: "wall-white-paint",
  openings: [],
  furniture: [],
};

const preset: FurniturePreset = {
  id: "bed-single",
  category: "bed",
  name: "싱글 침대",
  size: { width: 100, depth: 200, height: 40 },
  material: "wood",
  defaultColor: "oak",
  layer: "normal",
};

describe("snapRotation", () => {
  it("90° 배수 근처면 붙음", () => {
    expect(snapRotation(94)).toBe(90);
    expect(snapRotation(-3)).toBe(0);
    expect(snapRotation(357)).toBe(0);
  });

  it("범위 밖이면 정수 반올림 후 0~359", () => {
    expect(snapRotation(96.4)).toBe(96);
    expect(snapRotation(-30)).toBe(330);
    expect(snapRotation(400)).toBe(40);
  });
});

describe("addFurniture", () => {
  it("방 중앙 정수 위치에 기본색으로 추가", () => {
    const next = addFurniture(room, preset, "a");
    expect(next.furniture).toEqual([
      {
        id: "a",
        presetId: "bed-single",
        position: { x: 151, y: 100 },
        rotation: 0,
        color: "oak",
      },
    ]);
    expect(room.furniture).toEqual([]);
  });
});

describe("duplicateFurniture", () => {
  it("새 id로 옮겨서 복제", () => {
    const base = addFurniture(room, preset, "a");
    const next = duplicateFurniture(base, "a", "b");
    expect(next.furniture[1]).toEqual({
      ...base.furniture[0],
      id: "b",
      position: { x: 151 + DUPLICATE_OFFSET, y: 100 + DUPLICATE_OFFSET },
    });
  });

  it("없는 가구는 throw", () => {
    expect(() => duplicateFurniture(room, "x", "b")).toThrow(RangeError);
  });
});
