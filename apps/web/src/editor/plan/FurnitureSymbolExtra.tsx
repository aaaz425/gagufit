import type { ReactNode } from "react";
import type { SymbolPalette } from "./symbol-palette";

// 가구 평면 기호 중 v3에서 추가한 종류 - 좌표는 기본 크기 cm 기준이고 실제 크기에 맞춰 늘림
// 규칙은 FurnitureSymbol과 같음 - (0,0)~(w,d), 위쪽이 등·벽 쪽, 선 굵기는 화면 px

type Fill = "body" | "hi" | "soft" | "line" | "screen" | "none";

const px = { vectorEffect: "non-scaling-stroke" } as const;

/** 기본 크기 W×D로 그린 조각을 실제 크기에 맞춰 늘림 */
function Scaled({
  w,
  d,
  size,
  children,
}: {
  w: number;
  d: number;
  size: { w: number; d: number };
  children: ReactNode;
}) {
  return <g transform={`scale(${size.w / w} ${size.d / d})`}>{children}</g>;
}

function kit(p: SymbolPalette, scope: string) {
  const fill = (f: Fill) => (f === "none" ? "none" : p[f]);
  const rc = (
    x: number,
    y: number,
    w: number,
    h: number,
    r = 2,
    f: Fill = "body",
  ) => (
    <rect
      key={`${x}-${y}-${w}-${h}`}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={fill(f)}
      stroke={p.line}
      strokeWidth={1}
      {...px}
    />
  );
  /** 몸체 - 질감과 빛 방향 명암까지 */
  const bd = (w: number, h: number, r = 4) => (
    <g>
      {rc(0, 0, w, h, r)}
      {p.texture && <rect width={w} height={h} rx={r} fill={p.texture} />}
      <rect width={w} height={h} rx={r} fill={`url(#${scope}-s)`} />
    </g>
  );
  /** 선 색으로 채운 조각 - 손잡이·다리·앞쪽 띠 */
  const fl = (x: number, y: number, w: number, h: number, r = 0) => (
    <rect
      key={`${x}-${y}-${w}-${h}`}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={p.line}
    />
  );
  const ci = (cx: number, cy: number, r: number, f: Fill = "body") => (
    <circle
      key={`${cx}-${cy}-${r}`}
      cx={cx}
      cy={cy}
      r={r}
      fill={fill(f)}
      stroke={p.line}
      strokeWidth={1}
      {...px}
    />
  );
  const ln = (d: string, w = 1.5) => (
    <path
      key={d}
      d={d}
      fill="none"
      stroke={p.line}
      strokeWidth={w}
      strokeLinecap="round"
      {...px}
    />
  );
  /** 아래쪽 앞면 띠 - 앞이 있는 가구 */
  const front = (w: number, y: number, h: number, r = 4) => (
    <path
      d={`M0 ${y}h${w}v${h - r}a${r} ${r} 0 0 1-${r} ${r}H${r}a${r} ${r} 0 0 1-${r}-${r}Z`}
      fill={p.line}
    />
  );
  return { rc, bd, fl, ci, ln, front };
}

type Box = { w: number; d: number };
type Make = (b: Box, p: SymbolPalette, c: { scope: string }) => ReactNode;

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const EXTRA_DECOR = {
  "low-table": (b, p, c) => {
    const { rc, bd } = kit(p, c.scope);
    return (
      <Scaled w={80} d={50} size={b}>
        {bd(80, 50)}
        {rc(4, 4, 72, 42, 2, "none")}
        {rc(28, 15, 24, 20, 2, "hi")}
      </Scaled>
    );
  },
  shelf: (b, p, c) => {
    const { rc, bd, ci, front } = kit(p, c.scope);
    return (
      <Scaled w={60} d={40} size={b}>
        {bd(60, 40)}
        {rc(8, 7, 34, 22, 2, "hi")}
        {ci(51, 18, 6, "hi")}
        {front(60, 35, 5)}
      </Scaled>
    );
  },
  "shoe-cabinet": (b, p, c) => {
    const { bd, fl, ln, front } = kit(p, c.scope);
    return (
      <Scaled w={80} d={35} size={b}>
        {bd(80, 35)}
        {front(80, 30, 5)}
        {ln("M40 4v22")}
        {fl(35.5, 12, 2.5, 8, 1)}
        {fl(42, 12, 2.5, 8, 1)}
      </Scaled>
    );
  },
  mirror: (b, p, c) => {
    const { rc } = kit(p, c.scope);
    return (
      <Scaled w={40} d={5} size={b}>
        {rc(0, 0, 40, 5, 1.5)}
        <rect x={3} y={1.2} width={34} height={2.6} rx={1} fill={p.hi} />
      </Scaled>
    );
  },
  "drying-rack": (b, p, c) => {
    const { fl } = kit(p, c.scope);
    return (
      <Scaled w={150} d={60} size={b}>
        <rect
          width={150}
          height={60}
          rx={3}
          fill={p.ghost}
          stroke={p.line}
          strokeWidth={2}
          {...px}
        />
        {range(7).map((i) => fl(14 + i * 20.3, 5, 2.5, 50))}
        {fl(0, 28, 150, 2.5)}
      </Scaled>
    );
  },
  "floor-lamp": (b, p, c) => {
    const { ci } = kit(p, c.scope);
    return (
      <Scaled w={30} d={30} size={b}>
        {ci(15, 15, 14.5)}
        {ci(15, 15, 9, "hi")}
        <circle cx={15} cy={15} r={2.2} fill={p.line} />
      </Scaled>
    );
  },
  plant: (b, p, c) => {
    const { ci } = kit(p, c.scope);
    return (
      <Scaled w={40} d={40} size={b}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse
            key={a}
            cx={20}
            cy={9}
            rx={5.5}
            ry={11}
            transform={`rotate(${a} 20 20)`}
            fill={p.body}
            stroke={p.line}
            strokeWidth={1}
            {...px}
          />
        ))}
        <circle cx={20} cy={20} r={7.5} fill={p.line} />
        {ci(20, 20, 4.5, "soft")}
      </Scaled>
    );
  },
  mattress: (b, p, c) => {
    const { rc, bd, ln } = kit(p, c.scope);
    return (
      <Scaled w={110} d={200} size={b}>
        {bd(110, 200, 6)}
        {rc(5, 5, 100, 190, 4, "none")}
        {[1, 2, 3, 4].map((i) => ln(`M8 ${i * 40}H102`, 1))}
      </Scaled>
    );
  },
  "loft-bed": (b, p, c) => {
    const { rc, fl, ln, bd } = kit(p, c.scope);
    return (
      <Scaled w={110} d={205} size={b}>
        {bd(110, 205, 3)}
        {rc(8, 8, 94, 189, 4, "soft")}
        {rc(14, 14, 82, 34, 6, "hi")}
        {[0, 104].flatMap((x) => [0, 199].map((y) => fl(x, y, 6, 6, 1)))}
        {rc(94, 100, 14, 70, 1, "none")}
        {range(5).map((i) => ln(`M94 ${112 + i * 14}H108`))}
      </Scaled>
    );
  },
  stool: (b, p, c) => {
    const { ci } = kit(p, c.scope);
    return (
      <Scaled w={35} d={35} size={b}>
        {ci(17.5, 17.5, 17)}
        {ci(17.5, 17.5, 11, "hi")}
      </Scaled>
    );
  },
  cabinet: (b, p, c) => {
    const { rc, bd, fl, ln, front } = kit(p, c.scope);
    return (
      <Scaled w={80} d={40} size={b}>
        {bd(80, 40)}
        {rc(4, 4, 72, 28, 2, "none")}
        {front(80, 35, 5)}
        {ln("M40 6V30")}
        {fl(35.5, 15, 2.5, 8, 1)}
        {fl(42, 15, 2.5, 8, 1)}
      </Scaled>
    );
  },
  cart: (b, p, c) => {
    const { rc, bd, ci } = kit(p, c.scope);
    return (
      <Scaled w={40} d={30} size={b}>
        {bd(40, 30, 3)}
        {rc(4, 4, 32, 22, 2, "hi")}
        {[
          [3, 3],
          [37, 3],
          [3, 27],
          [37, 27],
        ].map(([x, y]) => ci(x, y, 2.6, "line"))}
      </Scaled>
    );
  },
  "storage-box": (b, p, c) => {
    const { rc, bd } = kit(p, c.scope);
    return (
      <Scaled w={50} d={40} size={b}>
        {bd(50, 40)}
        {rc(4, 4, 42, 32, 3, "none")}
        {rc(15, 1.6, 20, 3, 1.5, "hi")}
        {rc(15, 35.4, 20, 3, 1.5, "hi")}
      </Scaled>
    );
  },
  "floor-chair": (b, p, c) => {
    const { rc, bd } = kit(p, c.scope);
    return (
      <Scaled w={50} d={60} size={b}>
        {bd(50, 60, 8)}
        {rc(0, 0, 50, 16, 8, "soft")}
        {rc(6, 20, 38, 34, 6, "hi")}
      </Scaled>
    );
  },
  "bean-bag": (b, p, c) => {
    const { ci, ln } = kit(p, c.scope);
    return (
      <Scaled w={80} d={80} size={b}>
        <path
          d="M12 6C30 -2 52 -2 68 6c10 8 14 30 10 48-3 14-14 22-38 22S6 68 3 54C-1 36 2 14 12 6Z"
          fill={p.body}
          stroke={p.line}
          strokeWidth={1}
          {...px}
        />
        {ln("M20 30C34 22 46 22 60 30M22 52C36 62 48 62 58 52", 1)}
        {ci(40, 42, 6, "hi")}
      </Scaled>
    );
  },
  "bar-table": (b, p, c) => {
    const { rc, bd, ln } = kit(p, c.scope);
    return (
      <Scaled w={120} d={45} size={b}>
        {bd(120, 45)}
        {rc(4, 4, 112, 37, 2, "none")}
        <path d="M0 32h120v9a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z" fill={p.soft} />
        {ln("M0 32H120", 1)}
      </Scaled>
    );
  },
  dryer: (b, p, c) => {
    const { rc, bd, ci, front } = kit(p, c.scope);
    return (
      <Scaled w={60} d={65} size={b}>
        {bd(60, 65)}
        {rc(6, 5, 48, 10, 2, "hi")}
        {ci(14, 10, 2.6, "line")}
        {ci(24, 10, 2.6, "line")}
        {rc(40, 7, 10, 6, 1, "line")}
        {front(60, 59, 6)}
      </Scaled>
    );
  },
  "clothes-care": (b, p, c) => {
    const { rc, bd, ln, front } = kit(p, c.scope);
    return (
      <Scaled w={45} d={60} size={b}>
        {bd(45, 60)}
        {range(4).map((i) => ln(`M8 ${10 + i * 6}H37`, 1))}
        {rc(8, 38, 29, 10, 2, "hi")}
        {front(45, 54, 6)}
      </Scaled>
    );
  },
  "air-conditioner": (b, p, c) => {
    const { bd, ln } = kit(p, c.scope);
    return (
      <Scaled w={35} d={30} size={b}>
        {bd(35, 30, 8)}
        {range(4).map((i) => ln(`M7 ${6 + i * 4}H28`, 1))}
        {ln("M3 26h29", 3)}
      </Scaled>
    );
  },
  "air-purifier": (b, p, c) => {
    const { bd, ci, fl } = kit(p, c.scope);
    return (
      <Scaled w={35} d={35} size={b}>
        {bd(35, 35, 8)}
        {ci(17.5, 16, 10, "hi")}
        {ci(17.5, 16, 4, "line")}
        {fl(8, 30, 19, 2.4, 1)}
      </Scaled>
    );
  },
  fan: (b, p, c) => {
    const { rc, ci } = kit(p, c.scope);
    return (
      <Scaled w={35} d={35} size={b}>
        {ci(17.5, 22, 13)}
        {ci(17.5, 22, 3.5, "line")}
        {rc(6, 4, 23, 8, 4, "hi")}
      </Scaled>
    );
  },
  tv: (b, p, c) => {
    const { rc, ci } = kit(p, c.scope);
    return (
      <Scaled w={60} d={60} size={b}>
        {rc(0, 0, 60, 60, 5, "none")}
        {ci(30, 38, 18)}
        {rc(28, 14, 4, 20, 1, "line")}
        {rc(0, 8, 60, 6, 2, "screen")}
      </Scaled>
    );
  },
  treadmill: (b, p, c) => {
    const { rc, bd, fl, ln } = kit(p, c.scope);
    return (
      <Scaled w={70} d={160} size={b}>
        {bd(70, 160, 5)}
        {rc(10, 36, 50, 112, 4, "soft")}
        {range(6).map((i) => ln(`M12 ${48 + i * 18}H58`, 1))}
        {rc(6, 4, 58, 24, 4, "line")}
        {rc(14, 8, 28, 14, 2, "hi")}
        {fl(0, 28, 5, 40, 2)}
        {fl(65, 28, 5, 40, 2)}
      </Scaled>
    );
  },
  "exercise-bike": (b, p, c) => {
    const { rc, fl, ci } = kit(p, c.scope);
    return (
      <Scaled w={50} d={100} size={b}>
        {fl(5, 0, 40, 6, 3)}
        {fl(8, 92, 34, 6, 3)}
        {rc(22, 6, 6, 86, 2, "line")}
        {rc(7, 10, 36, 8, 4, "hi")}
        {ci(25, 36, 11, "soft")}
        {rc(13, 62, 24, 20, 8, "hi")}
      </Scaled>
    );
  },
  piano: (b, p, c) => {
    const { rc, bd, ln } = kit(p, c.scope);
    return (
      <Scaled w={140} d={40} size={b}>
        {bd(140, 40, 3)}
        {rc(4, 3, 132, 14, 2, "none")}
        {rc(0, 24, 140, 16, 2, "hi")}
        {range(27).map((i) => ln(`M${5 + i * 5} 24V40`, 1))}
      </Scaled>
    );
  },
  partition: (b, p, c) => {
    const { rc, ln } = kit(p, c.scope);
    return (
      <Scaled w={120} d={5} size={b}>
        {rc(0, 0, 120, 5, 1.5)}
        {ln("M40 0V5M80 0V5", 1.5)}
      </Scaled>
    );
  },
  "cat-tower": (b, p, c) => {
    const { rc, bd, ci } = kit(p, c.scope);
    return (
      <Scaled w={50} d={50} size={b}>
        {bd(50, 50, 5)}
        {ci(25, 25, 22, "soft")}
        {ci(25, 25, 14, "hi")}
        {ci(25, 25, 5, "line")}
        {rc(30, 30, 14, 14, 3, "hi")}
      </Scaled>
    );
  },
  "pet-house": (b, p, c) => {
    const { bd, ln } = kit(p, c.scope);
    return (
      <Scaled w={60} d={45} size={b}>
        {bd(60, 45, 10)}
        {ln("M30 4V34", 2)}
        <path d="M18 45v-9a12 12 0 0 1 24 0v9Z" fill={p.line} />
      </Scaled>
    );
  },
  bicycle: (b, p, c) => {
    const { rc } = kit(p, c.scope);
    return (
      <Scaled w={170} d={60} size={b}>
        {rc(0, 24, 40, 12, 6)}
        {rc(130, 24, 40, 12, 6)}
        {rc(30, 27, 110, 6, 3, "line")}
        {rc(138, 4, 8, 52, 3, "line")}
        {rc(48, 22, 16, 16, 6, "hi")}
      </Scaled>
    );
  },
  "trash-can": (b, p, c) => {
    const { rc, ci } = kit(p, c.scope);
    return (
      <Scaled w={30} d={30} size={b}>
        {ci(15, 15, 14.5)}
        {ci(15, 15, 11, "hi")}
        {rc(10, 12, 10, 6, 3, "line")}
      </Scaled>
    );
  },
} satisfies Record<string, Make>;
