import { describe, expect, it } from "vitest";
import { quoteRoom } from "./quote";
import type { FurniturePreset, PlacedFurniture, Room } from "./types";

const furniture = (
  id: string,
  extra: Partial<PlacedFurniture> = {},
): PlacedFurniture => ({
  id,
  presetId: "desk",
  position: { x: 0, y: 0 },
  rotation: 0,
  size: { width: 100, depth: 50, height: 70 },
  color: "oak",
  ...extra,
});

const room = (list: PlacedFurniture[]): Room => ({
  name: "",
  width: 300,
  depth: 300,
  height: 240,
  floorMaterial: "floor-light-oak",
  wallMaterial: "wall-white-paint",
  openings: [],
  furniture: list,
});

const product = (id: string, price: number, checkedAt: string) =>
  ({ id, offers: [{ url: "u", price, checkedAt }] }) as FurniturePreset;

const products = {
  a: product("a", 50000, "2026-11-18"),
  b: product("b", 30000, "2026-11-21"),
};

describe("quoteRoom", () => {
  it("내 가격, 참고가, 없음 순으로 쓰고 없음은 합계에서 제외", () => {
    const q = quoteRoom(
      room([
        furniture("f1", { price: 10000, product: { id: "a", name: "a" } }),
        furniture("f2", { product: { id: "b", name: "b" } }),
        furniture("f3"),
        furniture("f4", { product: { id: "gone", name: "x" } }),
      ]),
      products,
    );
    expect(q.items.map((i) => [i.source, i.price])).toEqual([
      ["own", 10000],
      ["ref", 30000],
      ["none", 0],
      ["none", 0],
    ]);
    expect(q.total).toBe(40000);
    expect(q.counts).toEqual({ own: 1, ref: 1, none: 2 });
  });

  it("기준일은 합계에 쓰인 참고가 중 가장 오래된 날", () => {
    const q = quoteRoom(
      room([
        furniture("f1", { product: { id: "b", name: "b" } }),
        furniture("f2", { product: { id: "a", name: "a" } }),
        // 내 가격이 있으면 참고가가 안 쓰여 기준일에서 빠짐
        furniture("f3", { price: 1, product: { id: "a", name: "a" } }),
      ]),
      products,
    );
    expect(q.refCheckedAt).toBe("2026-11-18");
    expect(
      quoteRoom(room([furniture("f1", { price: 0 })]), products).refCheckedAt,
    ).toBeNull();
  });

  it("내 가격 0원도 입력한 값", () => {
    const q = quoteRoom(room([furniture("f1", { price: 0 })]), products);
    expect(q.counts.own).toBe(1);
    expect(q.total).toBe(0);
  });
});
