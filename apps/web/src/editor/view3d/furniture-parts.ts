import type { FurnitureCategory, Size } from "@gagufit/core";

/** main 고른 색, light 침구 흰색, line 고른 색을 어둡게 - 서랍·문 선, 다리 */
export type PartTone = "main" | "light" | "line";

/**
 * 가구 한 조각 - cm, 바닥 면 중심 기준
 * x 너비, y 높이, z 깊이 - z 음수가 등·벽 쪽
 */
export type Part = {
  shape: "box" | "disc";
  size: [number, number, number];
  center: [number, number, number];
  tone: PartTone;
};

const LINE = 1;
const INSET = 0.5;

function box(
  [x0, y0, z0]: [number, number, number],
  [x1, y1, z1]: [number, number, number],
  tone: PartTone = "main",
): Part {
  return {
    shape: "box",
    size: [x1 - x0, y1 - y0, z1 - z0],
    center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    tone,
  };
}

/** 앞면에 선을 새긴 몸체 - 선이 바깥으로 튀어나오지 않게 몸체를 얕게 */
function cabinet(
  { width: w, depth: d, height: h }: Size,
  vertical: number,
  horizontal: number,
): Part[] {
  const front = d / 2;
  const parts = [box([-w / 2, 0, -front], [w / 2, h, front - INSET])];
  for (let i = 1; i <= vertical; i++) {
    const x = -w / 2 + (w * i) / (vertical + 1);
    parts.push(
      box(
        [x - LINE / 2, 2, front - INSET],
        [x + LINE / 2, h - 2, front],
        "line",
      ),
    );
  }
  for (let i = 1; i <= horizontal; i++) {
    const y = (h * i) / (horizontal + 1);
    parts.push(
      box(
        [-w / 2 + 2, y - LINE / 2, front - INSET],
        [w / 2 - 2, y + LINE / 2, front],
        "line",
      ),
    );
  }
  return parts;
}

function table({ width: w, depth: d, height: h }: Size, top = 3): Part[] {
  const leg = 4;
  const lx = w / 2 - leg / 2 - 2;
  const lz = d / 2 - leg / 2 - 2;
  return [
    box([-w / 2, h - top, -d / 2], [w / 2, h, d / 2]),
    ...[
      [-lx, -lz],
      [lx, -lz],
      [-lx, lz],
      [lx, lz],
    ].map(([x, z]) =>
      box(
        [x - leg / 2, 0, z - leg / 2],
        [x + leg / 2, h - top, z + leg / 2],
        "line",
      ),
    ),
  ];
}

/** 카테고리별 단순 모양 - 전체 경계 상자는 size와 같음 */
export function furnitureParts(
  category: FurnitureCategory,
  size: Size,
): Part[] {
  const { width: w, depth: d, height: h } = size;
  switch (category) {
    case "bed": {
      const frame = h * 0.5;
      const mattress = h * 0.88;
      const pillows = w < 120 ? 1 : 2;
      const gap = 6;
      const pw = (w - 2 * gap - (pillows - 1) * gap) / pillows;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, frame, d / 2]),
        box(
          [-w / 2 + 2, frame, -d / 2 + 2],
          [w / 2 - 2, mattress, d / 2 - 2],
          "light",
        ),
        ...Array.from({ length: pillows }, (_, i) => {
          const x = -w / 2 + gap + i * (pw + gap);
          return box(
            [x, mattress, -d / 2 + 6],
            [x + pw, h, -d / 2 + 6 + 35],
            "light",
          );
        }),
      ];
    }
    case "desk":
    case "dining-table":
      return table(size);
    case "dressing-table":
      return cabinet(size, 0, 1);
    case "chair": {
      const seat = h * 0.53;
      const leg = 3;
      const back = 4;
      const lx = w / 2 - leg / 2 - 1;
      const lz = d / 2 - leg / 2 - 1;
      return [
        box([-w / 2, seat - 5, -d / 2], [w / 2, seat, d / 2]),
        box([-w / 2, seat, -d / 2], [w / 2, h, -d / 2 + back]),
        ...[
          [-lx, -lz],
          [lx, -lz],
          [-lx, lz],
          [lx, lz],
        ].map(([x, z]) =>
          box(
            [x - leg / 2, 0, z - leg / 2],
            [x + leg / 2, seat - 5, z + leg / 2],
            "line",
          ),
        ),
      ];
    }
    case "sofa": {
      const arm = Math.min(15, w * 0.1);
      const back = Math.min(20, d * 0.25);
      const base = h * 0.3;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, base, d / 2]),
        box([-w / 2, 0, -d / 2], [w / 2, h, -d / 2 + back]),
        box([-w / 2, 0, -d / 2], [-w / 2 + arm, h * 0.7, d / 2]),
        box([w / 2 - arm, 0, -d / 2], [w / 2, h * 0.7, d / 2]),
        box(
          [-w / 2 + arm, base, -d / 2 + back],
          [w / 2 - arm, h * 0.55, d / 2 - 1],
          "light",
        ),
      ];
    }
    case "wardrobe":
      return cabinet(size, 1, 0);
    case "drawer":
      return cabinet(size, 0, Math.max(1, Math.round(h / 25) - 1));
    case "tv-stand":
      return cabinet(size, 2, 0);
    case "nightstand":
      return cabinet(size, 0, 1);
    case "fridge":
      return cabinet(size, 0, 1).map((p, i) =>
        // 위 냉동실이 짧게 - 선을 위로 옮김
        i === 1 ? { ...p, center: [p.center[0], h * 0.68, p.center[2]] } : p,
      );
    case "washer": {
      const r = Math.min(w, h) * 0.3;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, d / 2 - INSET]),
        {
          shape: "disc",
          size: [r * 2, r * 2, INSET],
          center: [0, h * 0.45, d / 2 - INSET / 2],
          tone: "line",
        },
      ];
    }
    case "bookshelf": {
      const t = 2;
      const shelves = Math.max(1, Math.round(h / 35) - 1);
      const parts = [
        box([-w / 2, 0, -d / 2], [w / 2, h, -d / 2 + t]),
        box([-w / 2, 0, -d / 2], [-w / 2 + t, h, d / 2]),
        box([w / 2 - t, 0, -d / 2], [w / 2, h, d / 2]),
        box([-w / 2, 0, -d / 2], [w / 2, t * 2, d / 2]),
        box([-w / 2, h - t, -d / 2], [w / 2, h, d / 2]),
      ];
      for (let i = 1; i <= shelves; i++) {
        const y = (h * i) / (shelves + 1);
        parts.push(
          box([-w / 2 + t, y - t / 2, -d / 2], [w / 2 - t, y + t / 2, d / 2]),
        );
      }
      return parts;
    }
    case "hanger": {
      const pole = 3;
      const foot = 3;
      return [-1, 1]
        .flatMap((side) => {
          const x = side * (w / 2 - pole / 2);
          return [
            box([x - pole / 2, 0, -d / 2], [x + pole / 2, foot, d / 2]),
            box([x - pole / 2, foot, -pole / 2], [x + pole / 2, h, pole / 2]),
          ];
        })
        .concat(box([-w / 2, h - pole, -pole / 2], [w / 2, h, pole / 2]));
    }
    case "rug":
    case "etc":
      return [box([-w / 2, 0, -d / 2], [w / 2, h, d / 2])];
  }
}
