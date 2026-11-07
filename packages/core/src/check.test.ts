import { describe, expect, it } from "vitest";
import { checkRoom } from "./check";
import type {
  FurniturePreset,
  Opening,
  PlacedFurniture,
  Room,
  Vec2,
} from "./types";

function preset(
  id: string,
  width: number,
  depth: number,
  layer: FurniturePreset["layer"] = "normal",
): FurniturePreset {
  return {
    id,
    category: layer === "floor" ? "rug" : "etc",
    name: id,
    size: { width, depth, height: 50 },
    material: "wood",
    defaultColor: "white",
    layer,
  };
}

const presets = Object.fromEntries(
  [
    preset("box", 100, 100),
    preset("dot", 2, 2),
    preset("bar", 200, 4),
    preset("stick", 120, 4),
    preset("rug", 100, 100, "floor"),
  ].map((p) => [p.id, p]),
);

function item(
  id: string,
  presetId: string,
  position: Vec2,
  rotation = 0,
): PlacedFurniture {
  return { id, presetId, position, rotation, color: "white" };
}

function room(furniture: PlacedFurniture[], openings: Opening[] = []): Room {
  return {
    name: "방",
    width: 300,
    depth: 400,
    height: 240,
    floorMaterial: "floor-light-oak",
    wallMaterial: "wall-white-paint",
    openings,
    furniture,
  };
}

function hinged(
  wall: number,
  hinge: "left" | "right",
  swing: "in" | "out" = "in",
): Opening {
  return {
    id: "door",
    kind: "hinged",
    wall,
    offset: 20,
    width: 80,
    height: 200,
    sill: 0,
    hinge,
    swing,
  };
}

describe("checkRoom 겹침", () => {
  it("겹치는 쌍마다 경고 하나", () => {
    const warnings = checkRoom(
      room([
        item("a", "box", { x: 100, y: 100 }),
        item("b", "box", { x: 150, y: 100 }),
        item("c", "box", { x: 200, y: 300 }),
      ]),
      presets,
    );
    expect(warnings).toEqual([{ type: "overlap", furnitureIds: ["a", "b"] }]);
  });

  it("맞닿음은 겹침 아님", () => {
    const warnings = checkRoom(
      room([
        item("a", "box", { x: 100, y: 100 }),
        item("b", "box", { x: 200, y: 100 }),
      ]),
      presets,
    );
    expect(warnings).toEqual([]);
  });

  it("45° 회전", () => {
    const h = 50 * Math.SQRT2;
    const furniture = (x: number) => [
      item("a", "box", { x: 100, y: 200 }, 45),
      item("b", "box", { x, y: 200 }),
    ];
    expect(checkRoom(room(furniture(100 + h + 50)), presets)).toEqual([]);
    expect(checkRoom(room(furniture(100 + h + 49)), presets)).toHaveLength(1);
  });

  it("러그는 겹침 제외", () => {
    const warnings = checkRoom(
      room([
        item("rug", "rug", { x: 100, y: 100 }),
        item("a", "box", { x: 100, y: 100 }),
      ]),
      presets,
    );
    expect(warnings).toEqual([]);
  });
});

describe("checkRoom 벽 밖", () => {
  it("벽에 붙은 건 괜찮음", () => {
    expect(
      checkRoom(room([item("a", "box", { x: 50, y: 50 })]), presets),
    ).toEqual([]);
    expect(
      checkRoom(room([item("a", "box", { x: 250, y: 350 })]), presets),
    ).toEqual([]);
  });

  it("꼭짓점 하나라도 밖이면 경고", () => {
    for (const position of [
      { x: 49, y: 200 },
      { x: 251, y: 200 },
      { x: 150, y: 49 },
      { x: 150, y: 351 },
    ]) {
      expect(checkRoom(room([item("a", "box", position)]), presets)).toEqual([
        { type: "outOfRoom", furnitureId: "a" },
      ]);
    }
  });

  it("회전해서 모서리가 나가면 경고", () => {
    expect(
      checkRoom(room([item("a", "box", { x: 60, y: 200 }, 45)]), presets),
    ).toEqual([{ type: "outOfRoom", furnitureId: "a" }]);
  });

  it("러그도 판정", () => {
    expect(
      checkRoom(room([item("rug", "rug", { x: 0, y: 0 })]), presets),
    ).toEqual([{ type: "outOfRoom", furnitureId: "rug" }]);
  });
});

describe("checkRoom 문 막힘", () => {
  // 방 300×400, 문 offset 20 폭 80
  // left - 왼쪽 경첩 문만 닿는 점, right - 오른쪽 경첩 문만 닿는 점
  const points: { wall: number; left: Vec2; right: Vec2 }[] = [
    { wall: 0, left: { x: 30, y: 60 }, right: { x: 90, y: 60 } },
    { wall: 1, left: { x: 240, y: 30 }, right: { x: 240, y: 90 } },
    { wall: 2, left: { x: 270, y: 340 }, right: { x: 210, y: 340 } },
    { wall: 3, left: { x: 60, y: 370 }, right: { x: 60, y: 310 } },
  ];

  const blocked = { type: "doorBlocked", openingId: "door", furnitureId: "a" };

  for (const { wall, left, right } of points) {
    it(`벽 ${wall} 경첩 좌우`, () => {
      const check = (door: Opening, p: Vec2) =>
        checkRoom(room([item("a", "dot", p)], [door]), presets);
      expect(check(hinged(wall, "left"), left)).toEqual([blocked]);
      expect(check(hinged(wall, "left"), right)).toEqual([]);
      expect(check(hinged(wall, "right"), right)).toEqual([blocked]);
      expect(check(hinged(wall, "right"), left)).toEqual([]);
    });
  }

  it("밖으로 열리는 문은 무시", () => {
    expect(
      checkRoom(
        room([item("a", "dot", { x: 30, y: 60 })], [hinged(0, "left", "out")]),
        presets,
      ),
    ).toEqual([]);
  });

  it("미닫이·창문은 무시", () => {
    const base = { wall: 0, offset: 20, width: 80, height: 200, sill: 0 };
    const openings: Opening[] = [
      { ...base, id: "s", kind: "sliding" },
      { ...base, id: "w", kind: "window" },
    ];
    expect(
      checkRoom(room([item("a", "box", { x: 60, y: 50 })], openings), presets),
    ).toEqual([]);
  });

  it("러그는 제외", () => {
    expect(
      checkRoom(
        room([item("rug", "rug", { x: 60, y: 50 })], [hinged(0, "left")]),
        presets,
      ),
    ).toEqual([]);
  });

  it("호·문 옆 선에 맞닿음은 막힘 아님", () => {
    const door = [hinged(0, "left")];
    // 경첩 (20,0)에서 정확히 80 떨어진 곳부터 시작
    expect(
      checkRoom(room([item("a", "box", { x: 70, y: 130 })], door), presets),
    ).toEqual([]);
    expect(
      checkRoom(room([item("a", "box", { x: 70, y: 129 })], door), presets),
    ).toEqual([blocked]);
    // 경첩 쪽 x = 20 선에 맞닿음
    expect(
      checkRoom(
        room([item("a", "box", { x: -30, y: 50 })], door),
        presets,
      ).filter((w) => w.type === "doorBlocked"),
    ).toEqual([]);
  });

  it("문 폭 안이지만 부채꼴 바깥 모서리는 막힘 아님", () => {
    // 경첩 (20,0) 기준 (75,75) 근처 - 사각 범위 안, 호 밖
    expect(
      checkRoom(
        room([item("a", "dot", { x: 96, y: 76 })], [hinged(0, "left")]),
        presets,
      ),
    ).toEqual([]);
  });

  it("꼭짓점이 모두 부채꼴 밖이어도 가로지르면 막힘", () => {
    // 경첩 (110,0), 막대 x 50~250 y 38~42 - 양끝은 경첩 뒤쪽과 호 밖
    const door: Opening = { ...hinged(0, "left"), offset: 110 };
    expect(
      checkRoom(room([item("a", "bar", { x: 150, y: 40 })], [door]), presets),
    ).toEqual([blocked]);
  });

  it("30° 회전 가구도 판정", () => {
    // 경첩 (20,0), 양끝 (112,30)·(8,90) 근처는 부채꼴 밖, 가운데 (60,60)은 안
    const door = [hinged(0, "left")];
    expect(
      checkRoom(
        room([item("a", "stick", { x: 60, y: 60 }, 30)], door),
        presets,
      ),
    ).toEqual([blocked]);
    // 같은 막대를 문에서 멀리 - 막힘 아님
    expect(
      checkRoom(
        room([item("a", "stick", { x: 160, y: 160 }, 30)], door),
        presets,
      ),
    ).toEqual([]);
  });
});

describe("checkRoom 공통", () => {
  it("가구 배열 순서대로 - 벽 밖 → 문 막힘 → 겹침", () => {
    const warnings = checkRoom(
      room(
        [
          item("a", "box", { x: 40, y: 50 }),
          item("b", "box", { x: 100, y: 100 }),
        ],
        [hinged(0, "left")],
      ),
      presets,
    );
    expect(warnings).toEqual([
      { type: "outOfRoom", furnitureId: "a" },
      { type: "doorBlocked", openingId: "door", furnitureId: "a" },
      { type: "overlap", furnitureIds: ["a", "b"] },
      { type: "doorBlocked", openingId: "door", furnitureId: "b" },
    ]);
  });

  it("프리셋 없는 가구는 판정 제외", () => {
    const warnings = checkRoom(
      room([
        item("a", "toString", { x: 0, y: 0 }),
        item("b", "box", { x: 0, y: 0 }),
      ]),
      presets,
    );
    expect(warnings).toEqual([{ type: "outOfRoom", furnitureId: "b" }]);
  });
});
