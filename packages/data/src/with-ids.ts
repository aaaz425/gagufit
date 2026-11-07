/** 키를 각 항목 id로 - Object.values 순서가 표시 순서 */
export function withIds<K extends string, T>(
  items: Record<K, T>,
): Readonly<Record<K, T & { id: K }>> {
  return Object.fromEntries(
    Object.entries<T>(items).map(([id, item]) => [id, { ...item, id }]),
  ) as Record<K, T & { id: K }>;
}
