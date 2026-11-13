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
  /** 모서리 둥글기 cm - 가장 얇은 변의 절반까지만 적용됨 */
  round: number;
};

const LINE = 1;
/** 서랍·문 선이 몸체 앞으로 튀어나오는 두께 */
const INSET = 0.5;
/** 손잡이가 몸체 앞으로 튀어나오는 두께 */
const HANDLE = 1.5;
/** 기본 모서리 둥글기 */
const SOFT = 1.5;

function box(
  [x0, y0, z0]: [number, number, number],
  [x1, y1, z1]: [number, number, number],
  tone: PartTone = "main",
  round = SOFT,
): Part {
  return {
    shape: "box",
    size: [x1 - x0, y1 - y0, z1 - z0],
    center: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    tone,
    round,
  };
}

/** 앞면에 선·손잡이를 붙인 몸체 - 세로선은 문, 가로선은 서랍 */
function cabinet(
  { width: w, depth: d, height: h }: Size,
  vertical: number,
  horizontal: number,
  handles = true,
): Part[] {
  const front = d / 2;
  const face = front - HANDLE;
  const parts = [box([-w / 2, 0, -front], [w / 2, h, face])];
  for (let i = 1; i <= vertical; i++) {
    const x = -w / 2 + (w * i) / (vertical + 1);
    parts.push(
      box(
        [x - LINE / 2, 2, face],
        [x + LINE / 2, h - 2, face + INSET],
        "line",
        0,
      ),
    );
  }
  for (let i = 1; i <= horizontal; i++) {
    const y = (h * i) / (horizontal + 1);
    parts.push(
      box(
        [-w / 2 + 2, y - LINE / 2, face],
        [w / 2 - 2, y + LINE / 2, face + INSET],
        "line",
        0,
      ),
    );
  }
  if (!handles) return parts;
  if (vertical > 0) {
    // 문 손잡이는 이웃 문과 맞닿는 선 쪽
    const doorW = w / (vertical + 1);
    const bar = Math.min(20, h * 0.2);
    for (let j = 0; j <= vertical; j++) {
      const x =
        -w / 2 + doorW * (j + 0.5) + (j % 2 === 0 ? 1 : -1) * doorW * 0.38;
      parts.push(
        box(
          [x - 0.6, h / 2 - bar / 2, face],
          [x + 0.6, h / 2 + bar / 2, front],
          "line",
          0.5,
        ),
      );
    }
  } else {
    const rows = horizontal + 1;
    const bar = Math.min(14, w * 0.3);
    for (let k = 0; k < rows; k++) {
      const y = (h * (k + 0.5)) / rows;
      parts.push(
        box([-bar / 2, y - 0.6, face], [bar / 2, y + 0.6, front], "line", 0.5),
      );
    }
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
        0.5,
      ),
    ),
  ];
}

/**
 * 카테고리별 단순 모양 - 전체 경계 상자는 size와 같음
 * 크기를 크게 줄여도 조각이 경계를 넘거나 뒤집히지 않게 잘라냄
 */
export function furnitureParts(
  category: FurnitureCategory,
  size: Size,
): Part[] {
  const { width: w, depth: d, height: h } = size;
  const max: [number, number, number] = [w / 2, h, d / 2];
  const min: [number, number, number] = [-w / 2, 0, -d / 2];
  return shapes(category, size).flatMap((part) => {
    const lo = part.center.map((c, i) =>
      Math.max(min[i], c - part.size[i] / 2),
    );
    const hi = part.center.map((c, i) =>
      Math.min(max[i], c + part.size[i] / 2),
    );
    if (hi.some((v, i) => v - lo[i] <= 0)) return [];
    return [
      {
        ...part,
        size: hi.map((v, i) => v - lo[i]) as Part["size"],
        center: hi.map((v, i) => (v + lo[i]) / 2) as Part["center"],
      },
    ];
  });
}

function shapes(category: FurnitureCategory, size: Size): Part[] {
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
        // 머리판
        box([-w / 2, 0, -d / 2], [w / 2, h * 0.95, -d / 2 + 5], "main", 2),
        box(
          [-w / 2 + 2, frame, -d / 2 + 5],
          [w / 2 - 2, mattress, d / 2 - 2],
          "light",
          4,
        ),
        ...Array.from({ length: pillows }, (_, i) => {
          const x = -w / 2 + gap + i * (pw + gap);
          return box(
            [x, mattress, -d / 2 + 8],
            [x + pw, h, -d / 2 + 8 + 32],
            "light",
            5,
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
      const leg = 3.5;
      const back = 4;
      const lx = w / 2 - leg / 2 - 1;
      const lz = d / 2 - leg / 2 - 1;
      return [
        box([-w / 2, seat - 5, -d / 2], [w / 2, seat, d / 2], "main", 2),
        box([-w / 2, seat, -d / 2], [w / 2, h, -d / 2 + back], "main", 2),
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
            0.5,
          ),
        ),
      ];
    }
    case "sofa": {
      const arm = Math.min(15, w * 0.1);
      const back = Math.min(20, d * 0.25);
      const foot = 5;
      const base = h * 0.3;
      const inner = w - 2 * arm;
      const seats = Math.max(1, Math.round(inner / 60));
      const sw = inner / seats;
      const cushions = Array.from({ length: seats }, (_, i) => {
        const x = -w / 2 + arm + i * sw;
        return [
          box(
            [x + 0.5, base, -d / 2 + back],
            [x + sw - 0.5, h * 0.5, d / 2 - 1],
            "light",
            5,
          ),
          // 등받이 쿠션
          box(
            [x + 1, h * 0.5, -d / 2 + back],
            [x + sw - 1, h * 0.9, -d / 2 + back + 12],
            "light",
            5,
          ),
        ];
      }).flat();
      return [
        ...[
          [-w / 2 + 4, -d / 2 + 4],
          [w / 2 - 4, -d / 2 + 4],
          [-w / 2 + 4, d / 2 - 4],
          [w / 2 - 4, d / 2 - 4],
        ].map(([x, z]) =>
          box([x - 2, 0, z - 2], [x + 2, foot, z + 2], "line", 0.5),
        ),
        box([-w / 2, foot, -d / 2], [w / 2, base, d / 2], "main", 3),
        box(
          [-w / 2, foot, -d / 2],
          [w / 2, h * 0.95, -d / 2 + back],
          "main",
          6,
        ),
        box([-w / 2, foot, -d / 2], [-w / 2 + arm, h * 0.7, d / 2], "main", 6),
        box([w / 2 - arm, foot, -d / 2], [w / 2, h * 0.7, d / 2], "main", 6),
        ...cushions,
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
    case "fridge": {
      const body = cabinet(size, 0, 1, false).map((p, i) =>
        // 위 냉동실이 짧게 - 선을 위로 옮김
        i === 1
          ? {
              ...p,
              center: [p.center[0], h * 0.68, p.center[2]] as Part["center"],
            }
          : p,
      );
      const x = w / 2 - 6;
      const front = d / 2;
      const face = front - HANDLE;
      return [
        ...body,
        box(
          [x - 0.7, h * 0.7, face],
          [x + 0.7, h * 0.7 + Math.min(25, h * 0.18), front],
          "line",
          0.5,
        ),
        box(
          [x - 0.7, h * 0.68 - Math.min(40, h * 0.3), face],
          [x + 0.7, h * 0.66, front],
          "line",
          0.5,
        ),
      ];
    }
    case "washer": {
      const r = Math.min(w, h) * 0.3;
      const front = d / 2;
      const face = front - HANDLE;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, face], "main", 2),
        // 조작부
        box(
          [-w / 2 + 4, h - 12, face],
          [w / 2 - 4, h - 5, face + 0.5],
          "line",
          0,
        ),
        {
          shape: "disc",
          size: [r * 2, r * 2, 1],
          center: [0, h * 0.42, face + 0.5],
          tone: "light",
          round: 0,
        },
        {
          shape: "disc",
          size: [r * 1.5, r * 1.5, 1],
          center: [0, h * 0.42, face + 1],
          tone: "line",
          round: 0,
        },
      ];
    }
    case "bookshelf": {
      const t = 2;
      const shelves = Math.max(1, Math.round(h / 35) - 1);
      const parts = [
        box([-w / 2, 0, -d / 2], [w / 2, h, -d / 2 + t], "main", 0.5),
        box([-w / 2, 0, -d / 2], [-w / 2 + t, h, d / 2], "main", 0.5),
        box([w / 2 - t, 0, -d / 2], [w / 2, h, d / 2], "main", 0.5),
        box([-w / 2, 0, -d / 2], [w / 2, t * 2, d / 2], "main", 0.5),
        box([-w / 2, h - t, -d / 2], [w / 2, h, d / 2], "main", 0.5),
      ];
      const ys = [t * 2];
      for (let i = 1; i <= shelves; i++) {
        const y = (h * i) / (shelves + 1);
        parts.push(
          box(
            [-w / 2 + t, y - t / 2, -d / 2],
            [w / 2 - t, y + t / 2, d / 2],
            "main",
            0.5,
          ),
        );
        ys.push(y + t / 2);
      }
      // 칸마다 책 덩어리 몇 개 - 높이·너비가 조금씩 다름
      const widths = [9, 12, 7, 10];
      const heights = [0.72, 0.88, 0.62, 0.8];
      const tones: PartTone[] = ["light", "line", "light", "line"];
      const tops = [...ys.slice(1), h - t];
      ys.forEach((bottom, row) => {
        const room = tops[row] - bottom;
        let x = -w / 2 + t + 2;
        for (let k = 0; k < 4; k++) {
          const bw = widths[(k + row) % 4];
          if (x + bw > w / 2 - t - 2) break;
          parts.push(
            box(
              [x, bottom, -d / 2 + t + 2],
              [x + bw, bottom + room * heights[(k + row) % 4], d / 2 - 3],
              tones[(k + row) % 4],
              0.5,
            ),
          );
          x += bw + 2;
        }
      });
      return parts;
    }
    case "hanger": {
      const pole = 3;
      const foot = 3;
      return [-1, 1]
        .flatMap((side) => {
          const x = side * (w / 2 - pole / 2);
          return [
            box(
              [x - pole / 2, 0, -d / 2],
              [x + pole / 2, foot, d / 2],
              "main",
              1,
            ),
            box(
              [x - pole / 2, foot, -pole / 2],
              [x + pole / 2, h, pole / 2],
              "main",
              1,
            ),
          ];
        })
        .concat(
          box([-w / 2, h - pole, -pole / 2], [w / 2, h, pole / 2], "main", 1),
        );
    }
    case "rug":
      return [box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 0.5)];
    case "etc":
      return [box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 2)];
  }
}
