import { describe, expect, it } from "vitest";
import { FURNITURE_PRESETS } from "./presets";
import { productsFromRows, type ProductRow } from "./products";

const row = (id: string, over: Partial<ProductRow> = {}): ProductRow => ({
  id,
  base: "desk",
  name: id,
  width: 100,
  depth: 50,
  height: 70,
  color: null,
  url: "https://link.coupang.com/a/x",
  price: 10000,
  checked_at: "2026-11-21",
  image_url: null,
  ...over,
});

describe("productsFromRows", () => {
  it("base에서 분류·최소 크기·layer를 이어받고 참고가를 담음", () => {
    const [p] = productsFromRows([row("rug-a", { base: "rug" })]);
    const base = FURNITURE_PRESETS.rug;
    expect(p.category).toBe(base.category);
    expect(p.minSize).toEqual(base.minSize);
    expect(p.layer).toBe("floor");
    expect(p.baseId).toBe("rug");
    expect(p.size).toEqual({ width: 100, depth: 50, height: 70 });
    expect(p.offers).toEqual([
      {
        url: "https://link.coupang.com/a/x",
        price: 10000,
        checkedAt: "2026-11-21",
      },
    ]);
  });

  it("DB 사진 주소가 null이면 imageUrl 없음", () => {
    const [a] = productsFromRows([row("a")]);
    expect(a.imageUrl).toBeUndefined();
  });

  it("color가 비었거나 모르는 값이면 base 기본색", () => {
    const [a, b, c] = productsFromRows([
      row("a"),
      row("b", { color: "no-such-color" }),
      row("c", { color: "white" }),
    ]);
    expect(a.defaultColor).toBe(FURNITURE_PRESETS.desk.defaultColor);
    expect(b.defaultColor).toBe(a.defaultColor);
    expect(c.defaultColor).toBe("white");
  });

  it("모르는 base와 기본 프리셋과 겹치는 id는 건너뜀", () => {
    const out = productsFromRows([
      row("a", { base: "no-such-base" }),
      row("chair"),
      row("ok"),
    ]);
    expect(out.map((p) => p.id)).toEqual(["ok"]);
  });

  it("옛 base도 새 id로 읽음", () => {
    const [p] = productsFromRows([row("old", { base: "rug-160" })]);
    expect(p.baseId).toBe("rug");
    expect(p.layer).toBe("floor");
  });

  it("base 프리셋 순서, 같으면 이름순", () => {
    const out = productsFromRows([
      row("1", { base: "chair", name: "나" }),
      row("2", { base: "desk", name: "다" }),
      row("3", { base: "chair", name: "가" }),
      row("4", { base: "bed", name: "라" }),
    ]);
    expect(out.map((p) => p.id)).toEqual(["4", "2", "3", "1"]);
  });
});
