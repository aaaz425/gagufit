import type { FurnitureCategory, Size } from "@gagufit/core";

/** main 고른 색, light 침구 흰색, line 고른 색을 어둡게 - 서랍·문 선, 다리 */
export type PartTone = "main" | "light" | "line";

/**
 * 가구 한 조각 - cm, 바닥 면 중심 기준
 * x 너비, y 높이, z 깊이 - z 음수가 등·벽 쪽
 */
export type Part = {
  /** disc는 앞(z)을 보는 원판, round는 위(y)로 선 원기둥 - size는 지름·높이·지름 */
  shape: "box" | "disc" | "round";
  size: [number, number, number];
  center: [number, number, number];
  tone: PartTone;
  /** 모서리 둥글기 cm - 가장 얇은 변의 절반까지만 적용됨 */
  round: number;
  /** 기울임 라디안 [x, y, z], 순서 YXZ - 기운 조각은 경계 자르기에서 빠짐 */
  rot?: [number, number, number];
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
        -w / 2 + doorW * (j + 0.5) + (j < vertical / 2 ? 1 : -1) * doorW * 0.38;
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

/** 위로 선 원기둥 - 지름 dx·dz, 높이 dy */
function round(
  dx: number,
  dy: number,
  dz: number,
  center: [number, number, number],
  tone: PartTone = "main",
): Part {
  return { shape: "round", size: [dx, dy, dz], center, tone, round: 0 };
}

/** 몸체를 바닥에서 dy만큼 띄움 */
function lifted(parts: Part[], dy: number): Part[] {
  return parts.map((p) => ({
    ...p,
    center: [p.center[0], p.center[1] + dy, p.center[2]],
  }));
}

/** 네 모서리 다리 - 높이 hgt */
function legs(w: number, d: number, hgt: number): Part[] {
  const x = w / 2 - 3;
  const z = d / 2 - 3;
  return [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ].map(([cx, cz]) =>
    box([cx - 1.5, 0, cz - 1.5], [cx + 1.5, hgt, cz + 1.5], "line", 0.5),
  );
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
    if (part.rot) return [part];
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
      const bottoms = [t * 2];
      const tops: number[] = [];
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
        tops.push(y - t / 2);
        bottoms.push(y + t / 2);
      }
      tops.push(h - t);
      // 칸마다 책 덩어리 둘 - 높이가 서로 다름
      const inner = w - 2 * t - 4;
      bottoms.forEach((bottom, row) => {
        const room = tops[row] - bottom;
        const books: [number, number, number, PartTone][] = [
          [0, 0.45, 0.8, "light"],
          [0.5, 0.35, 0.65, "line"],
        ];
        for (const [from, size, height, tone] of books) {
          const x = -w / 2 + t + 2 + inner * from;
          parts.push(
            box(
              [x, bottom, -d / 2 + t + 2],
              [x + inner * size, bottom + room * height, d / 2 - 3],
              tone,
              0.5,
            ),
          );
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
    case "low-table":
      return table(size);
    case "bar-table": {
      const t = 4;
      return [
        box([-w / 2, h - t, -d / 2], [w / 2, h, d / 2]),
        ...[-1, 1].map((side) => {
          const x = side * (w / 2 - 6);
          return box(
            [x - 2, 0, -d / 2 + 3],
            [x + 2, h - t, d / 2 - 3],
            "line",
            0.5,
          );
        }),
        box(
          [-w / 2 + 6, h * 0.3, -d / 2 + 3],
          [w / 2 - 6, h * 0.3 + 3, d / 2 - 3],
        ),
      ];
    }
    case "shelf": {
      const t = 2;
      const parts = [
        box([-w / 2, 0, -d / 2], [-w / 2 + t, h, d / 2], "main", 0.5),
        box([w / 2 - t, 0, -d / 2], [w / 2, h, d / 2], "main", 0.5),
        box([-w / 2 + t, 0, -d / 2], [w / 2 - t, h, -d / 2 + 1], "main", 0),
        ...[0, h / 3, (h * 2) / 3, h - t].map((y) =>
          box([-w / 2 + t, y, -d / 2], [w / 2 - t, y + t, d / 2], "main", 0.5),
        ),
      ];
      // 렌지 자리
      parts.push(
        box(
          [-w / 2 + 5, h * 0.67 + t, -d / 2 + 4],
          [w / 2 - 5, h * 0.67 + t + 24, d / 2 - 4],
          "light",
          2,
        ),
      );
      return parts;
    }
    case "shoe-cabinet":
    case "cabinet":
      return lifted(cabinet({ ...size, height: h - 4 }, 1, 0), 4).concat(
        legs(w, d, 4),
      );
    case "mirror":
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 2),
        box(
          [-w / 2 + 3, 3, d / 2 - 1],
          [w / 2 - 3, h - 3, d / 2 + 0.5],
          "light",
          0.5,
        ),
      ];
    case "drying-rack": {
      const bar = 2;
      const ends = [-1, 1].flatMap((side) => {
        const x = side * (w / 2 - bar / 2);
        return [
          box([x - bar / 2, 0, -d / 2], [x + bar / 2, 3, d / 2], "line", 0.5),
          ...[-1, 1].map((s) =>
            box(
              [x - bar / 2, 0, s * (d / 2 - bar) - bar / 2],
              [x + bar / 2, h, s * (d / 2 - bar) + bar / 2],
              "line",
              0.5,
            ),
          ),
        ];
      });
      const rods = [0.2, 0.45, 0.7, 0.95].map((t) =>
        box([-w / 2, h * t - 1, -1], [w / 2, h * t + 1, 1], "main", 0.5),
      );
      return [...ends, ...rods];
    }
    case "floor-lamp": {
      const base = Math.min(w, d) * 0.75;
      const shade = Math.min(w, d);
      return [
        round(base, 3, base, [0, 1.5, 0], "main"),
        box([-1, 3, -1], [1, h - 24, 1], "line", 0.5),
        box(
          [-shade / 2, h - 28, -shade / 2],
          [shade / 2, h - 3, shade / 2],
          "light",
          3,
        ),
      ];
    }
    case "plant": {
      const s = Math.min(w, d);
      const pot = Math.min(28, h * 0.3);
      const parts: Part[] = [
        round(s * 0.7, pot, s * 0.7, [0, pot / 2, 0], "light"),
        round(s * 0.62, 1, s * 0.62, [0, pot - 0.5, 0], "line"),
      ];
      // 산세베리아형 - 세로 잎 판이 화분에서 바깥으로 살짝 기울어 퍼짐
      for (let i = 0; i < 9; i++) {
        const ring = i % 3;
        const yaw = (i / 9) * Math.PI * 2 + 0.4;
        const lean = ([4, 11, 17][ring] * Math.PI) / 180;
        const len = (h - pot) * [1, 0.8, 0.64][ring];
        const r0 = ([2, 4, 6][ring] * s) / 40;
        const half = len / 2;
        const lw = ([9, 8, 7.5][ring] * s) / 40;
        parts.push({
          shape: "box",
          size: [lw, len, 1.6],
          center: [
            r0 * Math.sin(yaw) + Math.sin(lean) * Math.sin(yaw) * half,
            pot + Math.cos(lean) * half,
            r0 * Math.cos(yaw) + Math.sin(lean) * Math.cos(yaw) * half,
          ],
          rot: [lean, yaw, 0],
          tone: ring === 1 ? "line" : "main",
          round: 0.5,
        });
      }
      return parts;
    }
    case "mattress":
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 6),
        ...[1 / 3, 2 / 3].map((t) =>
          box(
            [-w / 2 + 4, h - 0.4, d * (t - 0.5) - 0.4],
            [w / 2 - 4, h, d * (t - 0.5) + 0.4],
            "line",
            0,
          ),
        ),
      ];
    case "loft-bed": {
      const post = 6;
      const deck = h * 0.6;
      const rail = 25;
      const lx = w * 0.22;
      return [
        ...[-1, 1].flatMap((sx) =>
          [-1, 1].map((sz) =>
            box(
              [
                sx * (w / 2 - post / 2) - post / 2,
                0,
                sz * (d / 2 - post / 2) - post / 2,
              ],
              [
                sx * (w / 2 - post / 2) + post / 2,
                h,
                sz * (d / 2 - post / 2) + post / 2,
              ],
              "line",
              1,
            ),
          ),
        ),
        box([-w / 2, deck - 4, -d / 2], [w / 2, deck, d / 2], "main", 1),
        box(
          [-w / 2 + 3, deck, -d / 2 + 8],
          [w / 2 - 3, deck + 18, d / 2 - 8],
          "light",
          5,
        ),
        box(
          [-w / 2, deck, -d / 2],
          [w / 2, deck + rail, -d / 2 + 3],
          "main",
          1,
        ),
        box([w / 2 - 3, deck, -d / 2], [w / 2, deck + rail, d / 2], "main", 1),
        // 앞쪽 사다리
        ...[-lx, lx].map((x) =>
          box([x - 1.5, 0, d / 2 - 4], [x + 1.5, deck, d / 2 - 1], "line", 0.5),
        ),
        ...[0.2, 0.4, 0.6, 0.8].map((t) =>
          box(
            [-lx, deck * t - 1, d / 2 - 3.5],
            [lx, deck * t + 1, d / 2 - 1.5],
            "line",
            0.5,
          ),
        ),
      ];
    }
    case "stool": {
      const leg = 2.5;
      const lx = w / 2 - leg / 2 - 3;
      const lz = d / 2 - leg / 2 - 3;
      return [
        round(w, 5, d, [0, h - 2.5, 0], "main"),
        ...[
          [-lx, -lz],
          [lx, -lz],
          [-lx, lz],
          [lx, lz],
        ].map(([x, z]) =>
          box(
            [x - leg / 2, 0, z - leg / 2],
            [x + leg / 2, h - 5, z + leg / 2],
            "line",
            0.5,
          ),
        ),
        box(
          [-lx, h * 0.3 - 0.75, -0.75],
          [lx, h * 0.3 + 0.75, 0.75],
          "line",
          0.5,
        ),
      ];
    }
    case "cart": {
      const post = 1.5;
      const lx = w / 2 - post / 2 - 1;
      const lz = d / 2 - post / 2 - 1;
      const bh = h * 0.2;
      return [
        ...[
          [-lx, -lz],
          [lx, -lz],
          [-lx, lz],
          [lx, lz],
        ].flatMap(([x, z]) => [
          box(
            [x - post / 2, 5, z - post / 2],
            [x + post / 2, h, z + post / 2],
            "line",
            0.5,
          ),
          round(5, 5, 4, [x, 2.5, z], "line"),
        ]),
        ...[0, 1, 2].map((i) => {
          const y = 8 + i * ((h - 8 - bh) / 2);
          return box(
            [-w / 2 + 1, y, -d / 2 + 1],
            [w / 2 - 1, y + bh, d / 2 - 1],
            "light",
            1.5,
          );
        }),
      ];
    }
    case "storage-box":
      return [
        box(
          [-w / 2 + 1.5, 0, -d / 2 + 1.5],
          [w / 2 - 1.5, h - 4, d / 2 - 1.5],
          "main",
          3,
        ),
        box([-w / 2, h - 4, -d / 2], [w / 2, h, d / 2], "light", 2),
        box(
          [-w * 0.2, h - 9, d / 2 - 2.5],
          [w * 0.2, h - 7, d / 2 - 1],
          "line",
          0.5,
        ),
      ];
    case "floor-chair": {
      const back = Math.min(10, d * 0.2);
      return [
        ...[-1, 1].map((side) => {
          const x = side * (w / 2 - 5);
          return box(
            [x - 3, 0, -d / 2 + 2],
            [x + 3, 6, d / 2 - 2],
            "line",
            0.5,
          );
        }),
        box([-w / 2, 6, -d / 2], [w / 2, h, -d / 2 + back], "main", 6),
        box(
          [-w / 2 + 3, 6, -d / 2 + back],
          [w / 2 - 3, 6 + h * 0.25, d / 2],
          "light",
          5,
        ),
      ];
    }
    case "bean-bag":
      return [
        round(w, h * 0.45, d, [0, h * 0.225, 0], "main"),
        round(w * 0.85, h * 0.4, d * 0.85, [0, h * 0.5, 0], "main"),
        round(w * 0.55, h * 0.32, d * 0.55, [0, h * 0.84, 0], "main"),
      ];
    case "dryer": {
      const body = h - 4;
      const front = d / 2;
      const face = front - HANDLE;
      const r = Math.min(w, body) * 0.3;
      return [
        ...legs(w, d, 4),
        box([-w / 2, 4, -d / 2], [w / 2, h, face], "main", 2),
        box(
          [-w / 2 + 4, h - 12, face],
          [w / 2 - 4, h - 5, face + 0.5],
          "light",
          0,
        ),
        {
          shape: "disc",
          size: [r * 2, r * 2, 1],
          center: [0, 4 + body * 0.42, face + 0.5],
          tone: "light",
          round: 0,
        },
        {
          shape: "disc",
          size: [r * 1.5, r * 1.5, 1],
          center: [0, 4 + body * 0.42, face + 1],
          tone: "line",
          round: 0,
        },
      ];
    }
    case "clothes-care": {
      const face = d / 2 - HANDLE;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, face], "main", 2),
        box(
          [-w / 2 + 4, h * 0.72, face],
          [w / 2 - 4, h - 6, face + 0.5],
          "light",
          1,
        ),
        box(
          [-w / 2 + 2, h * 0.68 - 0.5, face],
          [w / 2 - 2, h * 0.68 + 0.5, face + 0.5],
          "line",
          0,
        ),
        box(
          [w / 2 - 6, h * 0.4, face],
          [w / 2 - 4.5, h * 0.55, d / 2],
          "line",
          0.5,
        ),
      ];
    }
    case "air-conditioner": {
      const face = d / 2;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 5),
        ...[0, 1, 2].map((i) =>
          box(
            [-w / 2 + 5, h * 0.86 - i * 4, face - 0.5],
            [w / 2 - 5, h * 0.86 - i * 4 + 1, face + 0.3],
            "line",
            0,
          ),
        ),
        box(
          [-w / 2 + 4, h * 0.05, face - 0.5],
          [w / 2 - 4, h * 0.27, face + 0.3],
          "light",
          1,
        ),
      ];
    }
    case "air-purifier": {
      const face = d / 2;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 8),
        box([-w * 0.3, h - 1.5, -d * 0.3], [w * 0.3, h, d * 0.3], "light", 0.5),
        ...[-1, 0, 1].map((i) =>
          box(
            [i * 6 - 0.6, h * 0.15, face - 0.5],
            [i * 6 + 0.6, h * 0.65, face + 0.3],
            "line",
            0,
          ),
        ),
      ];
    }
    case "fan": {
      const head = w * 0.9;
      return [
        round(w * 0.8, 3, d * 0.8, [0, 1.5, 0], "main"),
        box([-1, 3, -1], [1, h - head / 2, 1], "line", 0.5),
        {
          shape: "disc",
          size: [head, head, Math.min(8, d)],
          center: [0, h - head / 2, 0],
          tone: "light",
          round: 0,
        },
      ];
    }
    case "tv": {
      const screen = h * 0.34;
      const top = h - screen;
      return [
        box([-w / 2 + 5, 0, -d * 0.3], [w / 2 - 5, 4, d * 0.3], "main", 2),
        box([-2, 4, -2], [2, top, 2], "line", 0.5),
        box([-w / 2, top, -2], [w / 2, h, 2], "main", 1.5),
        box(
          [-w / 2 + 2.5, top + 2.5, 2],
          [w / 2 - 2.5, h - 2.5, 2.4],
          "line",
          0,
        ),
      ];
    }
    case "treadmill": {
      const rail = Math.min(4, w * 0.1);
      return [
        box([-w / 2, 6, -d / 2 + 6], [w / 2, 16, d / 2], "main", 2),
        box(
          [-w / 2 + 8, 16, -d / 2 + 14],
          [w / 2 - 8, 17, d / 2 - 5],
          "line",
          0.5,
        ),
        ...[-1, 1].flatMap((side) => {
          const x = side * (w / 2 - rail / 2);
          return [
            box(
              [x - rail / 2, 16, -d / 2 + 6],
              [x + rail / 2, 24, d / 2 - 12],
              "line",
              1,
            ),
            box(
              [x - 1.5, 16, -d / 2 + 6],
              [x + 1.5, h * 0.82, -d / 2 + 9],
              "main",
              1,
            ),
          ];
        }),
        box(
          [-w / 2 + 4, h * 0.78, -d / 2 + 4],
          [w / 2 - 4, h, -d / 2 + 16],
          "light",
          3,
        ),
      ];
    }
    case "exercise-bike": {
      const wheel = Math.min(40, h * 0.36);
      return [
        box([-w / 2 + 5, 0, d / 2 - 8], [w / 2 - 5, 3, d / 2 - 2], "line", 1),
        box([-w / 2 + 8, 0, -d / 2 + 2], [w / 2 - 8, 3, -d / 2 + 8], "line", 1),
        box([-3, 3, -d * 0.1 - 3], [3, h * 0.8, -d * 0.1 + 3], "main", 2),
        {
          shape: "disc",
          size: [wheel, wheel, 5],
          center: [0, wheel / 2 + 8, -d * 0.1 + 11],
          tone: "light",
          rot: [0, Math.PI / 2, 0],
          round: 0,
        },
        box(
          [-1.5, h * 0.52, d * 0.12 - 1.5],
          [1.5, h * 0.66, d * 0.12 + 1.5],
          "line",
          0.5,
        ),
        box(
          [-w * 0.18, h * 0.66, d * 0.05],
          [w * 0.18, h * 0.72, d * 0.3],
          "light",
          3,
        ),
        box(
          [-1.5, h * 0.8, -d / 2 + 8],
          [1.5, h * 0.9, -d / 2 + 11],
          "line",
          0.5,
        ),
        box(
          [-w * 0.35, h * 0.9, -d / 2 + 4],
          [w * 0.35, h, -d / 2 + 14],
          "main",
          3,
        ),
      ];
    }
    case "piano": {
      const legH = h * 0.6;
      const top = h * 0.72;
      return [
        ...[-1, 1].map((side) => {
          const x = side * (w / 2 - 3);
          return box([x - 3, 0, -d / 2], [x + 3, legH, d / 2], "main", 1);
        }),
        box([-w / 2, legH, -d / 2], [w / 2, top, d / 2], "main", 1.5),
        box([-w / 2 + 4, top, -d / 2], [w / 2 - 4, h, -d / 2 + 6], "main", 1.5),
        box(
          [-w / 2 + 6, top, d / 2 - 18],
          [w / 2 - 6, top + 2, d / 2 - 1],
          "light",
          0.5,
        ),
        box(
          [-w / 2 + 6, top + 2, d / 2 - 18],
          [w / 2 - 6, top + 3, d / 2 - 9],
          "line",
          0,
        ),
      ];
    }
    case "partition": {
      const foot = 4;
      const panel = (w - 2) / 3;
      return [
        ...[0, 1, 2].map((i) =>
          box(
            [-w / 2 + i * (panel + 1), foot, -d / 2],
            [-w / 2 + i * (panel + 1) + panel, h, d / 2],
            "main",
            1.5,
          ),
        ),
        ...[-1, 1].map((side) =>
          box(
            [side * (w / 2 - 6) - 6, 0, -d / 2],
            [side * (w / 2 - 6) + 6, foot, d / 2],
            "line",
            0.5,
          ),
        ),
      ];
    }
    case "cat-tower": {
      const t = 6;
      return [
        box([-w / 2, 0, -d / 2], [w / 2, t, d / 2], "main", 3),
        box([-4, t, -4], [4, h - t, 4], "line", 1),
        box([-w * 0.3, t, -d * 0.3], [w * 0.3, h * 0.24, d * 0.3], "light", 3),
        box(
          [-w * 0.45, h * 0.36, -d * 0.45],
          [w * 0.45, h * 0.36 + t, d * 0.45],
          "main",
          3,
        ),
        box(
          [-w * 0.4, h * 0.66, -d * 0.4],
          [w * 0.4, h * 0.66 + t, d * 0.4],
          "main",
          3,
        ),
        box([-w / 2, h - t, -d / 2], [w / 2, h, d / 2], "main", 3),
      ];
    }
    case "pet-house":
      return [
        box([-w / 2, 0, -d / 2], [w / 2, h * 0.68, d / 2], "main", 3),
        box([-w / 2, h * 0.68, -d / 2], [w / 2, h * 0.84, d / 2], "line", 2),
        box([-w * 0.3, h * 0.84, -d * 0.35], [w * 0.3, h, d * 0.35], "line", 2),
        box([-w * 0.17, 0, d / 2 - 0.5], [w * 0.17, h * 0.5, d / 2], "line", 3),
      ];
    case "bicycle": {
      const dia = h * 0.68;
      const wx = w / 2 - dia / 2;
      const wheel = (x: number): Part => ({
        shape: "disc",
        size: [dia, dia, Math.min(4, d)],
        center: [x, dia / 2, 0],
        tone: "line",
        round: 0,
      });
      return [
        wheel(-wx),
        wheel(wx),
        box(
          [-wx, dia * 0.52, -1.5],
          [wx - 4, dia * 0.52 + 3, 1.5],
          "main",
          0.5,
        ),
        box(
          [-wx, dia * 0.2, -1.5],
          [wx * 0.2, dia * 0.2 + 3, 1.5],
          "main",
          0.5,
        ),
        box(
          [-wx * 0.5 - 1.5, dia * 0.2, -1.5],
          [-wx * 0.5 + 1.5, h * 0.78, 1.5],
          "main",
          0.5,
        ),
        box(
          [-wx * 0.5 - 6, h * 0.78, -3],
          [-wx * 0.5 + 8, h * 0.82, 3],
          "light",
          1.5,
        ),
        box([wx - 1.5, dia * 0.2, -1.5], [wx + 1.5, h * 0.9, 1.5], "main", 0.5),
        box([wx - 1.5, h * 0.9, -d * 0.3], [wx + 1.5, h, d * 0.3], "line", 1),
      ];
    }
    case "trash-can":
      return [
        round(w * 0.9, h - 3, d * 0.9, [0, (h - 3) / 2, 0], "main"),
        round(w, 3, d, [0, h - 1.5, 0], "light"),
      ];
    case "rug":
      return [box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 0.5)];
    case "etc":
      return [box([-w / 2, 0, -d / 2], [w / 2, h, d / 2], "main", 2)];
  }
}
