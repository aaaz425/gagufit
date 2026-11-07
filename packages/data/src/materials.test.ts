import type {
  FloorMaterialId,
  FurnitureColorId,
  WallMaterialId,
} from "@gagufit/core";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_FLOOR_MATERIAL,
  DEFAULT_WALL_MATERIAL,
  FLOOR_MATERIALS,
  FURNITURE_COLORS,
  WALL_MATERIALS,
} from "./materials";

// Record 키가 core 유니온과 정확히 같아야 타입 검사 통과
const floorIds: Record<FloorMaterialId, true> = {
  "floor-light-oak": true,
  "floor-dark-walnut": true,
  "floor-grey-tile": true,
  "floor-white-tile": true,
  "floor-vinyl": true,
  "floor-carpet": true,
};
const wallIds: Record<WallMaterialId, true> = {
  "wall-white-paint": true,
  "wall-warm-beige": true,
  "wall-light-grey": true,
  "wall-silk": true,
  "wall-stripe": true,
  "wall-concrete": true,
};
const colorIds: Record<FurnitureColorId, true> = {
  white: true,
  oak: true,
  walnut: true,
  grey: true,
  charcoal: true,
  "beige-fabric": true,
  "green-fabric": true,
};

const HEX = /^#[0-9A-F]{6}$/;

describe.each([
  ["바닥", FLOOR_MATERIALS, floorIds],
  ["벽", WALL_MATERIALS, wallIds],
  ["가구 색", FURNITURE_COLORS, colorIds],
] as const)("%s", (_, list, ids) => {
  it("id가 core 유니온과 일치·중복 없음", () => {
    const listIds = Object.values(list).map((m) => m.id);
    expect(new Set(listIds).size).toBe(listIds.length);
    expect([...listIds].sort()).toEqual(Object.keys(ids).sort());
  });
});

describe("재질", () => {
  it("견본 경로 = materials/<id>.jpg", () => {
    for (const m of [
      ...Object.values(FLOOR_MATERIALS),
      ...Object.values(WALL_MATERIALS),
    ]) {
      expect(m.image).toBe(`materials/${m.id}.jpg`);
    }
  });

  it("색은 hex 6자리", () => {
    for (const m of Object.values(FLOOR_MATERIALS))
      expect(m.color2d).toMatch(HEX);
    for (const c of Object.values(FURNITURE_COLORS)) expect(c.hex).toMatch(HEX);
  });

  it("기본값은 목록 첫 항목", () => {
    expect(Object.values(FLOOR_MATERIALS)[0].id).toBe(DEFAULT_FLOOR_MATERIAL);
    expect(Object.values(WALL_MATERIALS)[0].id).toBe(DEFAULT_WALL_MATERIAL);
  });
});
