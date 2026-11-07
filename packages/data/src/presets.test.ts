import type { FurnitureCategory } from "@gagufit/core";
import { describe, expect, it } from "vitest";
import { FURNITURE_COLORS } from "./materials";
import { FURNITURE_PRESETS as presetMap } from "./presets";

const FURNITURE_PRESETS = Object.values(presetMap);

const categories: Record<FurnitureCategory, true> = {
  bed: true,
  desk: true,
  chair: true,
  sofa: true,
  "dining-table": true,
  wardrobe: true,
  drawer: true,
  bookshelf: true,
  hanger: true,
  "tv-stand": true,
  nightstand: true,
  "dressing-table": true,
  fridge: true,
  washer: true,
  rug: true,
  etc: true,
};

describe("가구 프리셋", () => {
  it("id 중복 없음", () => {
    const ids = FURNITURE_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("16종 카테고리마다 1개 이상", () => {
    for (const c of Object.keys(categories)) {
      expect(FURNITURE_PRESETS.some((p) => p.category === c)).toBe(true);
    }
  });

  it("치수는 양의 정수", () => {
    for (const { size } of FURNITURE_PRESETS) {
      for (const v of [size.width, size.depth, size.height]) {
        expect(Number.isInteger(v) && v > 0).toBe(true);
      }
    }
  });

  it("기본색은 색 목록에 있음", () => {
    const colorIds = Object.keys(FURNITURE_COLORS);
    for (const p of FURNITURE_PRESETS) {
      expect(colorIds).toContain(p.defaultColor);
    }
  });

  it("러그만 바닥 층", () => {
    for (const p of FURNITURE_PRESETS) {
      expect(p.layer).toBe(p.category === "rug" ? "floor" : "normal");
    }
  });
});
