import type { FurniturePreset, Room } from "./types";

/** own 내 가격, ref 상품 참고가, none 가격 없음 - 합계에서 제외 */
export type QuoteItem = {
  furnitureId: string;
  source: "own" | "ref" | "none";
  /** 원, none이면 0 */
  price: number;
};

export type Quote = {
  /** 원 */
  total: number;
  items: QuoteItem[];
  counts: Record<QuoteItem["source"], number>;
  /** 합계에 쓰인 참고가 중 가장 오래된 checkedAt YYYY-MM-DD, 없으면 null */
  refCheckedAt: string | null;
};

/** 가구마다 내 가격 → 상품 참고가 순 - products는 상품 id로 찾는 상품 프리셋 */
export function quoteRoom(
  room: Room,
  products: Readonly<Record<string, FurniturePreset>>,
): Quote {
  const items: QuoteItem[] = [];
  const counts = { own: 0, ref: 0, none: 0 };
  let total = 0;
  let refCheckedAt: string | null = null;
  for (const f of room.furniture) {
    const offer =
      f.product && Object.hasOwn(products, f.product.id)
        ? products[f.product.id].offers?.[0]
        : undefined;
    let item: QuoteItem;
    if (f.price !== undefined) {
      item = { furnitureId: f.id, source: "own", price: f.price };
    } else if (offer) {
      item = { furnitureId: f.id, source: "ref", price: offer.price };
      if (refCheckedAt === null || offer.checkedAt < refCheckedAt) {
        refCheckedAt = offer.checkedAt;
      }
    } else {
      item = { furnitureId: f.id, source: "none", price: 0 };
    }
    items.push(item);
    counts[item.source]++;
    total += item.price;
  }
  return { total, items, counts, refCheckedAt };
}
