import { describe, expect, it } from "vitest";
import { clampView, MIN_VISIBLE, toScreen, type View } from "./view";

const room = { width: 400, depth: 300 };
const size = { width: 1000, height: 800 };
const none = { left: 0, right: 0, top: 0, bottom: 0 };
const base: View = { x: 300, y: 200, scale: 1, angle: 0 };

describe("clampView", () => {
  it("충분히 보이면 그대로", () => {
    expect(clampView(base, room, size, none)).toBe(base);
  });

  it("오른쪽 끝까지 끌어도 방이 최소 여백만큼 남음", () => {
    const v = clampView({ ...base, x: 5000 }, room, size, none);
    expect(v.x).toBe(size.width - MIN_VISIBLE);
    expect(v.y).toBe(base.y);
  });

  it("왼쪽·위로 끌면 반대쪽 끝이 최소 여백만큼 남음", () => {
    const v = clampView({ ...base, x: -5000, y: -5000 }, room, size, none);
    expect(v.x + room.width).toBe(MIN_VISIBLE);
    expect(v.y + room.depth).toBe(MIN_VISIBLE);
  });

  it("패널이 가린 영역은 제외하고 계산", () => {
    const insets = { ...none, left: 300 };
    const v = clampView({ ...base, x: -5000 }, room, size, insets);
    expect(v.x + room.width).toBe(300 + MIN_VISIBLE);
  });

  it("확대·회전 뒤에도 방 일부가 보임", () => {
    const view = { x: 9000, y: -9000, scale: 8, angle: 37 };
    const v = clampView(view, room, size, none);
    const pts = [
      { x: 0, y: 0 },
      { x: room.width, y: 0 },
      { x: 0, y: room.depth },
      { x: room.width, y: room.depth },
    ].map((p) => toScreen(v, p));
    expect(Math.min(...pts.map((p) => p.x))).toBeLessThanOrEqual(
      size.width - MIN_VISIBLE,
    );
    expect(Math.max(...pts.map((p) => p.y))).toBeGreaterThanOrEqual(
      MIN_VISIBLE,
    );
  });

  it("방이 최소 여백보다 작게 줄면 방 크기만큼만 요구", () => {
    const tiny = { x: 5000, y: 0, scale: 0.2, angle: 0 };
    const v = clampView(tiny, room, size, none);
    expect(v.x).toBe(size.width - room.width * 0.2);
  });
});
