import { describe, expect, it } from "vitest";
import { FURNITURE_PRESETS } from "./presets";
import { FURNITURE_CATALOG, PRODUCTS } from "./products";

const isPosInt = (n: number) => Number.isInteger(n) && n > 0;

describe("실제 상품", () => {
  const products = Object.values(PRODUCTS);

  it("기본 프리셋 id와 겹치지 않고 카탈로그에 모두 들어감", () => {
    for (const p of products) {
      expect(FURNITURE_PRESETS[p.id]).toBeUndefined();
      expect(FURNITURE_CATALOG[p.id]).toBe(p);
    }
  });

  it("크기는 cm 양의 정수이고 최소 크기 이상", () => {
    for (const p of products) {
      for (const k of ["width", "depth", "height"] as const) {
        expect(isPosInt(p.size[k]), `${p.id} ${k}`).toBe(true);
        expect(p.size[k], `${p.id} ${k}`).toBeGreaterThanOrEqual(p.minSize[k]);
      }
    }
  });

  it("링크는 https, 가격은 양의 정수, 기준일은 날짜 형식", () => {
    for (const p of products) {
      expect(p.offers?.length, p.id).toBeGreaterThan(0);
      for (const o of p.offers ?? []) {
        expect(o.url.startsWith("https://"), p.id).toBe(true);
        expect(isPosInt(o.price), p.id).toBe(true);
        expect(o.checkedAt, p.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(o.checkedAt)), p.id).toBe(false);
      }
    }
  });
});
