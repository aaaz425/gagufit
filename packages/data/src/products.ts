import type { FurnitureColorId, FurniturePreset } from "@gagufit/core";
import { FURNITURE_COLORS } from "./materials";
import { FURNITURE_PRESETS } from "./presets";

/** products 테이블 한 줄 - 크기 cm, price 원, checked_at YYYY-MM-DD */
export type ProductRow = {
  id: string;
  base: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  color: string | null;
  url: string;
  price: number;
  checked_at: string;
};

const BASE_ORDER = Object.keys(FURNITURE_PRESETS);

/**
 * 줄 → 상품 프리셋, base 프리셋 순서 → 이름순
 * - 분류·최소 크기·재질·layer는 base에서, color가 없거나 모르는 값이면 base 기본색
 * - 모르는 base나 기본 프리셋과 겹치는 id는 건너뜀
 */
export function productsFromRows(
  rows: readonly ProductRow[],
): FurniturePreset[] {
  const ranked: { rank: number; preset: FurniturePreset }[] = [];
  for (const r of rows) {
    if (
      !Object.hasOwn(FURNITURE_PRESETS, r.base) ||
      Object.hasOwn(FURNITURE_PRESETS, r.id)
    ) {
      continue;
    }
    const base = FURNITURE_PRESETS[r.base];
    const color =
      r.color !== null && Object.hasOwn(FURNITURE_COLORS, r.color)
        ? (r.color as FurnitureColorId)
        : base.defaultColor;
    ranked.push({
      rank: BASE_ORDER.indexOf(r.base),
      preset: {
        id: r.id,
        category: base.category,
        name: r.name,
        size: { width: r.width, depth: r.depth, height: r.height },
        minSize: base.minSize,
        material: base.material,
        defaultColor: color,
        layer: base.layer,
        baseId: r.base,
        offers: [{ url: r.url, price: r.price, checkedAt: r.checked_at }],
      },
    });
  }
  return ranked
    .sort(
      (a, b) => a.rank - b.rank || a.preset.name.localeCompare(b.preset.name),
    )
    .map((x) => x.preset);
}
