import { describe, expect, it } from "vitest";
import {
  clampView,
  MIN_VISIBLE,
  screenDeltaToRoom,
  toRoom,
  type View,
} from "./view";

const room = { width: 400, depth: 400 };
const size = { width: 1000, height: 800 };
const base: View = { x: 300, y: 200, scale: 1, angle: 0 };

/** 캔버스 안에 실제 방 위의 점이 있는지 */
function roomVisible(view: View) {
  for (let x = 0; x <= size.width; x += 4) {
    for (let y = 0; y <= size.height; y += 4) {
      const p = toRoom(view, { x, y });
      if (p.x >= 0 && p.x <= room.width && p.y >= 0 && p.y <= room.depth)
        return true;
    }
  }
  return false;
}

describe("clampView", () => {
  it("충분히 보이면 그대로", () => {
    expect(clampView(base, room, size)).toEqual(base);
  });

  it("끝까지 끌어도 방이 최소 여백만큼 남음", () => {
    // 화면 중심에서 가장 가까운 방 점은 왼쪽 위 모서리 - 오른쪽 아래로 끌어낸 경우
    const v = clampView({ ...base, x: 5000, y: 5000 }, room, size);
    expect(v.x).toBe(size.width - MIN_VISIBLE);
    expect(v.y).toBe(size.height - MIN_VISIBLE);
  });

  it("45도 회전·확대 후 대각선으로 끌어도 방이 화면 안에 남음", () => {
    const view = { x: 5000, y: 5000, scale: 2, angle: 45 };
    expect(roomVisible(view)).toBe(false);
    expect(roomVisible(clampView(view, room, size))).toBe(true);
  });

  it("방이 아주 작게 줄어도 화면 안에 남음", () => {
    const tiny = { x: 5000, y: 0, scale: 0.2, angle: 0 };
    expect(roomVisible(clampView(tiny, room, size))).toBe(true);
  });
});

describe("screenDeltaToRoom", () => {
  it("회전 없으면 그대로", () => {
    expect(screenDeltaToRoom(0, { x: 1, y: 0 })).toEqual({ x: 1, y: 0 });
  });

  it("화면이 시계 방향 90° 돌아 있으면 화면 오른쪽은 방의 위쪽", () => {
    const d = screenDeltaToRoom(90, { x: 1, y: 0 });
    expect(d.x).toBeCloseTo(0);
    expect(d.y).toBeCloseTo(-1);
  });
});
