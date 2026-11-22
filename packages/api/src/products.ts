import { productsFromRows } from "@gagufit/data";
import type { FurniturePreset } from "@gagufit/core";
import type { ApiClient } from "./client";

// 읽기는 세션 없이 가능 - 표시 순서와 변환 규칙은 data 몫
export async function listProducts(
  client: ApiClient,
): Promise<FurniturePreset[]> {
  const { data, error } = await client
    .from("products")
    .select(
      "id, base, name, width, depth, height, color, url, price, checked_at",
    );
  if (error) throw error;
  return productsFromRows(
    data.map(({ checked_at, ...r }) => ({ ...r, checkedAt: checked_at })),
  );
}
