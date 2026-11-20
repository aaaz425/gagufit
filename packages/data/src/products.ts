import type { FurniturePreset, Offer, Size } from "@gagufit/core";
import type { FURNITURE_COLORS } from "./materials";
import { FURNITURE_PRESETS, type PresetId } from "./presets";

// 실제 상품 추가 - RAW에 항목 하나 복사해 채우기
// - 키(id)는 저장 데이터에 남음 - 바꾸지 말 것, 기본 프리셋 id와 겹치면 안 됨
// - base 기본 프리셋 id - 분류·최소 크기·재질·기본색을 이어받음
// - size cm 정수, color 생략하면 base 기본색
// - offers 쿠팡 파트너스 화면에서 만든 링크, price 원 정수, checkedAt 가격 확인일 YYYY-MM-DD
type Product = {
  base: PresetId;
  name: string;
  size: Size;
  color?: keyof typeof FURNITURE_COLORS;
  offers: [Offer, ...Offer[]];
};

const RAW = {
  // 아래 항목은 예시 - url·가격은 운영자가 실제 값으로 교체
  "sample-desk-120": {
    base: "desk-120",
    name: "원목 책상 120",
    size: { width: 120, depth: 60, height: 74 },
    color: "oak",
    offers: [
      {
        url: "https://link.coupang.com/a/sample-desk",
        price: 89000,
        checkedAt: "2026-11-20",
      },
    ],
  },
  "sample-bed-ss": {
    base: "bed-super-single",
    name: "슈퍼싱글 침대 프레임",
    size: { width: 108, depth: 205, height: 35 },
    offers: [
      {
        url: "https://link.coupang.com/a/sample-bed",
        price: 129000,
        checkedAt: "2026-11-20",
      },
    ],
  },
  "sample-sofa-2": {
    base: "sofa-2seat",
    name: "2인 패브릭 소파",
    size: { width: 145, depth: 78, height: 82 },
    color: "grey",
    offers: [
      {
        url: "https://link.coupang.com/a/sample-sofa",
        price: 159000,
        checkedAt: "2026-11-20",
      },
    ],
  },
  "sample-bookshelf-5": {
    base: "bookshelf-80",
    name: "5단 책장 80",
    size: { width: 80, depth: 28, height: 178 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/sample-shelf",
        price: 59000,
        checkedAt: "2026-11-20",
      },
    ],
  },
} satisfies Record<string, Product>;

export const PRODUCTS: Readonly<Record<string, FurniturePreset>> =
  Object.fromEntries(
    Object.entries<Product>(RAW).map(([id, p]) => {
      const base = FURNITURE_PRESETS[p.base];
      const preset: FurniturePreset = {
        id,
        category: base.category,
        name: p.name,
        size: p.size,
        minSize: base.minSize,
        material: base.material,
        defaultColor: p.color ?? base.defaultColor,
        layer: base.layer,
        offers: p.offers,
      };
      return [id, preset];
    }),
  );

/** 기본 프리셋 + 실제 상품 - 배치된 가구의 presetId는 여기서 찾음 */
export const FURNITURE_CATALOG: Readonly<Record<string, FurniturePreset>> = {
  ...FURNITURE_PRESETS,
  ...PRODUCTS,
};
