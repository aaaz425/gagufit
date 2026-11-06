import { describe, expect, it } from "vitest";
import { roomCorners, wallSegment } from "./room";

const room = { width: 300, depth: 200 };

describe("roomCorners", () => {
  it("왼쪽 위부터 시계 방향", () => {
    expect(roomCorners(room)).toEqual([
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 200 },
      { x: 0, y: 200 },
    ]);
  });
});

describe("wallSegment", () => {
  it("방 안에서 볼 때 왼쪽 → 오른쪽", () => {
    expect(wallSegment(room, 0)).toEqual({
      start: { x: 0, y: 0 },
      end: { x: 300, y: 0 },
    });
    expect(wallSegment(room, 1)).toEqual({
      start: { x: 300, y: 0 },
      end: { x: 300, y: 200 },
    });
    expect(wallSegment(room, 2)).toEqual({
      start: { x: 300, y: 200 },
      end: { x: 0, y: 200 },
    });
    expect(wallSegment(room, 3)).toEqual({
      start: { x: 0, y: 200 },
      end: { x: 0, y: 0 },
    });
  });

  it("없는 벽 번호는 throw", () => {
    expect(() => wallSegment(room, 4)).toThrow(RangeError);
    expect(() => wallSegment(room, -1)).toThrow(RangeError);
    expect(() => wallSegment(room, 1.5)).toThrow(RangeError);
  });
});
