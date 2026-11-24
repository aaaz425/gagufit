import { FURNITURE_PRESETS } from "@gagufit/data";
import { describe, expect, it } from "vitest";
import { CATEGORY_GROUPS } from "./labels";

describe("CATEGORY_GROUPS", () => {
  it("모든 기본 가구 종류가 칩 하나에만 들어감", () => {
    const listed = CATEGORY_GROUPS.flatMap((g) => g.categories ?? []);
    expect(listed.toSorted()).toEqual(
      Object.values(FURNITURE_PRESETS)
        .map((p) => p.category)
        .toSorted(),
    );
  });
});
