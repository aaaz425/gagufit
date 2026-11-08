import { describe, expect, it } from "vitest";
import {
  addFurniture,
  addOpening,
  DUPLICATE_OFFSET,
  duplicateFurniture,
  FURNITURE_SIZE_LIMITS,
  moveOpening,
  resizeFurniture,
  resizeRoom,
  setOpeningWidth,
  snapRotation,
} from "./edit";
import type { FurniturePreset, Opening, Room } from "./types";

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
        size: { width: 100, depth: 200, height: 40 },
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

const box: Room = { ...room, width: 400, depth: 300 };

function withOpening(o: Partial<Opening>): Room {
  const opening: Opening = {
    id: "w",
    kind: "window",
    wall: 0,
    offset: 0,
    width: 100,
    height: 120,
    sill: 90,
    ...o,
  } as Opening;
  return { ...box, openings: [opening] };
}

describe("addOpening", () => {
  it("빈 방은 가장 긴 벽 가운데", () => {
    const next = addOpening(box, "hinged", "d");
    expect(next?.openings[0]).toEqual({
      id: "d",
      kind: "hinged",
      wall: 0,
      offset: 160,
      width: 80,
      height: 200,
      sill: 0,
      hinge: "left",
      swing: "in",
    });
  });

  it("기존 개구부를 피해 가장 긴 빈 구간 가운데", () => {
    // 벽 0은 남은 구간 150·150, 벽 2는 400
    const base = withOpening({ offset: 150 });
    expect(addOpening(base, "window", "n")?.openings[1]).toMatchObject({
      wall: 2,
      offset: 150,
    });
  });

  it("들어갈 자리가 없으면 null", () => {
    const tiny = { ...box, width: 70, depth: 70 };
    expect(addOpening(tiny, "hinged", "d")).toBeNull();
  });
});

describe("moveOpening", () => {
  it("가장 가까운 벽에 붙고 가운데 기준 offset", () => {
    // 벽 1은 (400,0) → (400,300), 가운데 y=200 → offset 150
    const next = moveOpening(withOpening({}), "w", { x: 390, y: 200 });
    expect(next.openings[0]).toMatchObject({ wall: 1, offset: 150 });
  });

  it("모서리를 넘지 않음", () => {
    const next = moveOpening(withOpening({}), "w", { x: 395, y: -10 });
    expect(next.openings[0]).toMatchObject({ wall: 0, offset: 300 });
  });

  it("없는 개구부는 throw", () => {
    expect(() => moveOpening(box, "x", { x: 0, y: 0 })).toThrow(RangeError);
  });
});

describe("setOpeningWidth", () => {
  it("벽을 넘으면 왼쪽으로 밀리고 벽 길이까지", () => {
    const base = withOpening({ offset: 300 });
    expect(setOpeningWidth(base, "w", 150).openings[0]).toMatchObject({
      offset: 250,
      width: 150,
    });
    expect(setOpeningWidth(base, "w", 999).openings[0]).toMatchObject({
      offset: 0,
      width: 400,
    });
  });
});

describe("resizeRoom", () => {
  it("벽보다 길어진 개구부는 벽에 맞춤", () => {
    const base = withOpening({ offset: 250, width: 150 });
    const next = resizeRoom(base, { width: 120 });
    expect(next.width).toBe(120);
    expect(next.openings[0]).toMatchObject({ offset: 0, width: 120 });
  });

  it("양의 정수가 아니면 throw", () => {
    expect(() => resizeRoom(box, { depth: 0 })).toThrow(RangeError);
  });
});

describe("resizeFurniture", () => {
  const base = addFurniture(room, preset, "a");

  it("정수로 반올림하고 범위로 자름", () => {
    const next = resizeFurniture(base, "a", { width: 80.6, depth: 5000 });
    expect(next.furniture[0].size).toEqual({
      width: 81,
      depth: FURNITURE_SIZE_LIMITS.max,
      height: 40,
    });
  });

  it("바뀐 게 없으면 같은 room", () => {
    expect(resizeFurniture(base, "a", { width: 100 })).toBe(base);
  });
});
