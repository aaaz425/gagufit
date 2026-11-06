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

  it("45°", () => {
    const corners = furnitureCorners(
      { position: { x: 0, y: 0 }, rotation: 45 },
      { width: 100, depth: 100 },
    );
    const h = 50 * Math.SQRT2;
    // 로컬 오른쪽 아래 꼭짓점이 평면 오른쪽 끝으로
    expect(corners[2].x).toBeCloseTo(h);
    expect(corners[2].y).toBeCloseTo(0);
    expect(corners[1].x).toBeCloseTo(0);
    expect(corners[1].y).toBeCloseTo(-h);
  });
});

describe("polygonsOverlap", () => {
  it("맞닿기만 하면 겹침 아님", () => {
    expect(polygonsOverlap(rect(100, 100, 0), rect(200, 100, 0))).toBe(false);
    expect(polygonsOverlap(rect(100, 100, 0), rect(200, 200, 0))).toBe(false);
  });

  it("조금이라도 들어가면 겹침", () => {
    expect(polygonsOverlap(rect(100, 100, 0), rect(199, 100, 0))).toBe(true);
  });

  it("90° 회전", () => {
    // 200×100을 90° 돌리면 x 100~200
    const rotated = rect(150, 150, 90, 200, 100);
    expect(polygonsOverlap(rotated, rect(250, 150, 0))).toBe(false);
    expect(polygonsOverlap(rotated, rect(249, 150, 0))).toBe(true);
    expect(
      polygonsOverlap(rect(150, 150, 0, 200, 100), rect(250, 150, 0)),
    ).toBe(true);
  });

  it("45° 회전", () => {
    const diamond = rect(100, 100, 45);
    const h = 50 * Math.SQRT2;
    expect(polygonsOverlap(diamond, rect(100 + h + 50, 100, 0))).toBe(false);
    expect(polygonsOverlap(diamond, rect(100 + h + 49, 100, 0))).toBe(true);
    // 바운딩 박스는 겹치지만 실제로는 떨어짐
    expect(polygonsOverlap(diamond, rect(170, 170, 0, 50, 50))).toBe(false);
  });
});
