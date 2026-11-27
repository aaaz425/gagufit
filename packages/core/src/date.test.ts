import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { formatDay, formatTimestamp } from "./date";

describe("formatDay", () => {
  it("연도를 두 자리로 줄임", () => {
    expect(formatDay("2026-11-21")).toBe("26.11.21");
  });
});

describe("formatTimestamp", () => {
  beforeAll(() => {
    vi.stubEnv("TZ", "Asia/Seoul");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("사용자 시간대 기준 날짜 - UTC 15:00부터 다음 날", () => {
    expect(formatTimestamp("2026-01-05T14:59:00Z")).toBe("26.01.05");
    expect(formatTimestamp("2026-01-05T15:00:00Z")).toBe("26.01.06");
  });
});
