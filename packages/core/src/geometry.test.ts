import { describe, expect, it } from "vitest";
import {
  centerFromTopLeft,
  furnitureCorners,
  furnitureTopLeft,
  polygonsOverlap,
} from "./geometry";

const size = { width: 200, depth: 100 };

function rect(x: number, y: number, rotation: number, w = 100, d = 100) {
  return furnitureCorners({
    position: { x, y },
    rotation,
    size: { width: w, depth: d },
  });
}

describe("furnitureTopLeft", () => {
  it("회전 0은 중심에서 반 크기를 뺀 값", () => {
    expect(
      furnitureTopLeft({ position: { x: 300, y: 200 }, rotation: 0, size }),
    ).toEqual({ x: 200, y: 150 });
  });

  it("90°는 가로·세로가 바뀐 외곽 상자 기준", () => {
    expect(
      furnitureTopLeft({ position: { x: 300, y: 200 }, rotation: 90, size }),
    ).toEqual({ x: 250, y: 100 });
  });

  it("45°는 대각선 외곽 상자 기준 반올림", () => {
    // 100x100 정사각형 45° → 반폭 70.71
    expect(
      furnitureTopLeft({
        position: { x: 300, y: 200 },
        rotation: 45,
        size: { width: 100, depth: 100 },
      }),
    ).toEqual({ x: 229, y: 129 });
  });
});

describe("centerFromTopLeft", () => {
  it.each([0, 90, 45, 30, 270])(
    "입력 → 저장 → 표시 왕복이 같은 값 (회전 %d°)",
    (rotation) => {
      const f = { rotation, size: { width: 101, depth: 55 } };
      for (const v of [-20, 0, 37, 250]) {
        const position = centerFromTopLeft(f, { x: v, y: v + 3 });
        expect(Number.isInteger(position.x)).toBe(true);
        expect(furnitureTopLeft({ ...f, position })).toEqual({
          x: v,
          y: v + 3,
        });
      }
    },
  );
});

describe("furnitureCorners", () => {
  it("회전 0은 width가 x, depth가 y - 왼쪽 위부터 시계 방향", () => {
    expect(
      furnitureCorners({ position: { x: 300, y: 200 }, rotation: 0, size }),
    ).toEqual([
      { x: 200, y: 150 },
      { x: 400, y: 150 },
      { x: 400, y: 250 },
      { x: 200, y: 250 },
    ]);
  });

  it("양수 회전은 위에서 볼 때 반시계 - 오른쪽 끝이 위로", () => {
    // three.js rotation.y = 90°는 로컬 +x를 평면 -y(위)로 보냄
    const [topLeft, topRight] = furnitureCorners({
      position: { x: 0, y: 0 },
      rotation: 90,
      size,
    });
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
