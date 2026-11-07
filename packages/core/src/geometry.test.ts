import { describe, expect, it } from "vitest";
import { furnitureCorners, polygonsOverlap } from "./geometry";

const size = { width: 200, depth: 100 };

function rect(x: number, y: number, rotation: number, w = 100, d = 100) {
  return furnitureCorners(
    { position: { x, y }, rotation },
    { width: w, depth: d },
  );
}

describe("furnitureCorners", () => {
  it("회전 0은 width가 x, depth가 y - 왼쪽 위부터 시계 방향", () => {
    expect(
      furnitureCorners({ position: { x: 300, y: 200 }, rotation: 0 }, size),
    ).toEqual([
      { x: 200, y: 150 },
      { x: 400, y: 150 },
      { x: 400, y: 250 },
      { x: 200, y: 250 },
    ]);
  });

  it("양수 회전은 위에서 볼 때 반시계 - 오른쪽 끝이 위로", () => {
    // three.js rotation.y = 90°는 로컬 +x를 평면 -y(위)로 보냄
    const [topLeft, topRight] = furnitureCorners(
      { position: { x: 0, y: 0 }, rotation: 90 },
      size,
    );
    expect(topRight).toEqual({ x: -50, y: -100 });
    expect(topLeft).toEqual({ x: -50, y: 100 });
  });
});

describe("polygonsOverlap", () => {
  it("바운딩 박스는 겹쳐도 실제로 떨어지면 겹침 아님", () => {
    expect(polygonsOverlap(rect(100, 100, 45), rect(170, 170, 0, 50, 50))).toBe(
      false,
    );
  });
});
