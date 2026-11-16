import { describe, expect, it } from "vitest";
import {
  addFurniture,
  addOpening,
  clampPosition,
  cycleFurnitureId,
  DUPLICATE_OFFSET,
  duplicateFurniture,
  FURNITURE_SIZE_LIMITS,
  lockAxis,
  MOVE_MARGIN,
  moveOpening,
  OPENING_MIN_WIDTH,
  resizeFurniture,
  resizeRoom,
  ROOM_LIMITS,
  setOpeningEdge,
  setOpeningKind,
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
  minSize: { width: 1, depth: 1, height: 1 },
  material: "wood",
  defaultColor: "oak",
  layer: "normal",
};

describe("snapRotation", () => {
  it("90° 배수와 5° 이내면 붙고 넘으면 정수 반올림", () => {
    expect(snapRotation(95)).toBe(90);
    expect(snapRotation(96)).toBe(96);
  });

  it("0~359로 정규화", () => {
    expect(snapRotation(-30.4)).toBe(330);
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

  it("offset 0이면 같은 자리에 복제", () => {
    const base = addFurniture(room, preset, "a");
    const next = duplicateFurniture(base, "a", "b", 0);
    expect(next.furniture[1].position).toEqual(base.furniture[0].position);
  });

  it("없는 가구는 throw", () => {
    expect(() => duplicateFurniture(room, "x", "b")).toThrow(RangeError);
  });
});

describe("clampPosition", () => {
  it("정수로 반올림하고 방 밖 여유까지만 허용", () => {
    expect(clampPosition(room, { x: 10.6, y: 20.4 })).toEqual({ x: 11, y: 20 });
    expect(clampPosition(room, { x: -500, y: 900 })).toEqual({
      x: -MOVE_MARGIN,
      y: room.depth + MOVE_MARGIN,
    });
  });
});

describe("lockAxis", () => {
  const from = { x: 100, y: 100 };
  it("더 많이 움직인 축만 남김", () => {
    expect(lockAxis(from, { x: 150, y: 120 })).toEqual({ x: 150, y: 100 });
    expect(lockAxis(from, { x: 90, y: 40 })).toEqual({ x: 100, y: 40 });
  });

  it("같으면 가로", () => {
    expect(lockAxis(from, { x: 120, y: 80 })).toEqual({ x: 120, y: 100 });
  });
});

describe("cycleFurnitureId", () => {
  const withThree = ["a", "b", "c"].reduce(
    (r, id) => addFurniture(r, preset, id),
    room,
  );

  it("다음·이전으로 돌고 끝에서 처음으로 이어짐", () => {
    expect(cycleFurnitureId(withThree, "a", 1)).toBe("b");
    expect(cycleFurnitureId(withThree, "c", 1)).toBe("a");
    expect(cycleFurnitureId(withThree, "a", -1)).toBe("c");
  });

  it("선택이 없으면 앞으로는 첫째, 뒤로는 마지막", () => {
    expect(cycleFurnitureId(withThree, null, 1)).toBe("a");
    expect(cycleFurnitureId(withThree, null, -1)).toBe("c");
  });

  it("가구가 없으면 null", () => {
    expect(cycleFurnitureId(room, null, 1)).toBeNull();
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

describe("setOpeningEdge", () => {
  // 벽 0 길이 400, 개구부 100~200
  const base = withOpening({ offset: 100 });

  it("반대쪽 끝은 고정", () => {
    expect(setOpeningEdge(base, "w", "left", 49.6).openings[0]).toMatchObject({
      offset: 50,
      width: 150,
    });
    expect(setOpeningEdge(base, "w", "right", 250).openings[0]).toMatchObject({
      offset: 100,
      width: 150,
    });
  });

  it("벽 끝 너머로 끌어도 벽 안, 반대쪽 그대로", () => {
    expect(setOpeningEdge(base, "w", "right", 999).openings[0]).toMatchObject({
      offset: 100,
      width: 300,
    });
    expect(setOpeningEdge(base, "w", "left", -50).openings[0]).toMatchObject({
      offset: 0,
      width: 200,
    });
  });

  it("최소 폭 아래로 안 줄어듦", () => {
    expect(setOpeningEdge(base, "w", "right", 0).openings[0].width).toBe(
      OPENING_MIN_WIDTH,
    );
  });

  it("바뀐 게 없으면 같은 room", () => {
    expect(setOpeningEdge(base, "w", "right", 200)).toBe(base);
  });
});

describe("setOpeningKind", () => {
  // 창문 100~200, 가운데 150
  const base = withOpening({ offset: 100 });

  it("새 종류 기본값으로, 가운데 유지", () => {
    expect(setOpeningKind(base, "w", "hinged").openings[0]).toEqual({
      id: "w",
      kind: "hinged",
      wall: 0,
      offset: 110,
      width: 80,
      height: 200,
      sill: 0,
      hinge: "left",
      swing: "in",
    });
  });

  it("여닫이에서 바꾸면 경첩·열림 방향 없음", () => {
    const door = setOpeningKind(base, "w", "hinged");
    expect(setOpeningKind(door, "w", "sliding").openings[0]).not.toHaveProperty(
      "hinge",
    );
  });

  it("같은 종류면 같은 room", () => {
    expect(setOpeningKind(base, "w", "window")).toBe(base);
  });
});

describe("resizeRoom", () => {
  it("벽보다 길어진 개구부는 벽에 맞춤", () => {
    const base = withOpening({ offset: 250, width: 150 });
    const next = resizeRoom(base, { width: 120 });
    expect(next.width).toBe(120);
    expect(next.openings[0]).toMatchObject({ offset: 0, width: 120 });
  });

  it("정수로 반올림하고 범위로 자름", () => {
    const next = resizeRoom(box, { depth: 0, height: 250.4 });
    expect(next.depth).toBe(ROOM_LIMITS.depth.min);
    expect(next.height).toBe(250);
  });

  it("바뀐 게 없으면 같은 room", () => {
    expect(resizeRoom(box, { width: 400 })).toBe(box);
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

  describe("minSize", () => {
    const minSize = { width: 40, depth: 30, height: 20 };

    it("최소 아래는 최소로, 최소 값은 그대로", () => {
      const low = resizeFurniture(base, "a", { width: 39, depth: 30 }, minSize);
      expect(low.furniture[0].size).toMatchObject({ width: 40, depth: 30 });
    });

    it("저장된 값이 최소보다 작아도 안 건드린 항목은 그대로", () => {
      const small = resizeFurniture(base, "a", { width: 10 });
      const next = resizeFurniture(small, "a", { depth: 150 }, minSize);
      expect(next.furniture[0].size).toMatchObject({ width: 10, depth: 150 });
    });
  });
});
