import { describe, expect, it } from "vitest";
import { wallFrame } from "./room";

const room = { width: 300, depth: 200 };

describe("wallFrame", () => {
  it("방 안에서 볼 때 왼쪽 → 오른쪽, inward는 방 안쪽", () => {
    const expected = [
      [
        { x: 0, y: 0 },
        { x: 300, y: 0 },
        { x: 150, y: 10 },
      ],
      [
        { x: 300, y: 0 },
        { x: 300, y: 200 },
        { x: 290, y: 100 },
      ],
      [
        { x: 300, y: 200 },
        { x: 0, y: 200 },
        { x: 150, y: 190 },
      ],
      [
        { x: 0, y: 200 },
        { x: 0, y: 0 },
        { x: 10, y: 100 },
      ],
    ];
    expected.forEach(([start, end, inside], wall) => {
      const f = wallFrame(room, wall);
      expect([f.start, f.end]).toEqual([start, end]);
      const mid = f.length / 2;
      expect({
        x: f.start.x + f.u.x * mid + f.inward.x * 10,
        y: f.start.y + f.u.y * mid + f.inward.y * 10,
      }).toEqual(inside);
    });
  });

  it("없는 벽 번호는 throw", () => {
    expect(() => wallFrame(room, 4)).toThrow(RangeError);
  });
});
