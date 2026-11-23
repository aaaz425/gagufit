import { FURNITURE_PRESETS } from "@gagufit/data";
import { describe, expect, it } from "vitest";
import { furnitureParts } from "./furniture-parts";

// 저사양 기기 - 가구 하나의 조각 수 상한
const MAX_PARTS = 40;

describe("furnitureParts", () => {
  it("모든 기본 가구가 기본·최소 크기에서 조각 수 상한 안에서 그려짐", () => {
    for (const p of Object.values(FURNITURE_PRESETS)) {
      for (const size of [p.size, p.minSize]) {
        const parts = furnitureParts(p.category, size);
        expect(parts.length, p.id).toBeGreaterThan(0);
        expect(parts.length, p.id).toBeLessThanOrEqual(MAX_PARTS);
      }
    }
  });

  it("기울지 않은 조각은 가구 경계 안 - 최소 크기까지 줄여도", () => {
    const eps = 1e-6;
    for (const p of Object.values(FURNITURE_PRESETS)) {
      const { width: w, depth: d, height: h } = p.minSize;
      for (const part of furnitureParts(p.category, p.minSize)) {
        if (part.rot) continue;
        const [x, y, z] = part.center;
        const [sx, sy, sz] = part.size;
        expect(x - sx / 2, p.id).toBeGreaterThanOrEqual(-w / 2 - eps);
        expect(x + sx / 2, p.id).toBeLessThanOrEqual(w / 2 + eps);
        expect(y - sy / 2, p.id).toBeGreaterThanOrEqual(-eps);
        expect(y + sy / 2, p.id).toBeLessThanOrEqual(h + eps);
        expect(z - sz / 2, p.id).toBeGreaterThanOrEqual(-d / 2 - eps);
        expect(z + sz / 2, p.id).toBeLessThanOrEqual(d / 2 + eps);
      }
    }
  });
});
