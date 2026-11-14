import type { FurnitureCategory, Size } from "@gagufit/core";
import { useId, type ReactNode } from "react";
import type { TextureRef } from "./texture";
import { symbolPalette, type SymbolPalette } from "./symbol-palette";

// 가구 평면 기호 - (0,0)~(w,d) cm, 위쪽이 등·벽 쪽, 선 굵기는 화면 px
// 빛은 왼쪽 위

/** 몸체 모서리 */
const R = 4;

type Box = { w: number; d: number };

const px = { vectorEffect: "non-scaling-stroke" } as const;

function Rect(props: {
  x?: number;
  y?: number;
  w: number;
  h: number;
  fill: string;
  r?: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  return (
    <rect
      x={props.x ?? 0}
      y={props.y ?? 0}
      width={Math.max(props.w, 0)}
      height={Math.max(props.h, 0)}
      rx={props.r ?? 0}
      fill={props.fill}
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
      {...px}
    />
  );
}

type Ctx = {
  /** SymbolDefs와 같은 scope */
  scope: string;
  /** 부품 블러 그림자 - 품질 설정 */
  rich: boolean;
};

const SHADOW = "var(--color-scene-wall)";

/** 입체 부품 - 명암·하이라이트·가는 선, rich면 부품 아래 부드러운 그림자 */
function Part(props: {
  c: Ctx;
  p: SymbolPalette;
  x?: number;
  y?: number;
  w: number;
  h: number;
  r?: number;
  fill: string;
  z?: number;
  /** 몸체 외곽선은 진하게 */
  strong?: boolean;
  textured?: boolean;
}) {
  const { c, p, w, h, fill, z = 0 } = props;
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const r = props.r ?? R;
  const rr = Math.max(Math.min(r, w / 2, h / 2), 0);
  return (
    <g>
      {c.rich && z > 0 && (
        <rect
          x={x + z * 0.5}
          y={y + z * 0.8}
          width={Math.max(w, 0)}
          height={Math.max(h, 0)}
          rx={r}
          fill={SHADOW}
          opacity={0.28}
          filter={`url(#${c.scope}-b)`}
        />
      )}
      <Rect x={x} y={y} w={w} h={h} r={r} fill={fill} />
      {props.textured && p.texture && (
        <Rect x={x} y={y} w={w} h={h} r={r} fill={p.texture} />
      )}
      <Rect x={x} y={y} w={w} h={h} r={r} fill={`url(#${c.scope}-s)`} />
      <rect
        x={x}
        y={y}
        width={Math.max(w, 0)}
        height={Math.max(h, 0)}
        rx={r}
        fill="none"
        stroke={p.line}
        strokeWidth={1}
        strokeOpacity={props.strong ? 1 : 0.55}
        {...px}
      />
      <path
        d={`M${x + rr} ${y + 0.4}H${x + w - rr}M${x + 0.4} ${y + rr}V${y + h - rr}`}
        stroke="#fff"
        strokeOpacity={0.55}
        strokeWidth={1}
        fill="none"
        {...px}
      />
    </g>
  );
}

const body = ({ w, d }: Box, p: SymbolPalette, c: Ctx, r = R) => (
  <Part c={c} p={p} w={w} h={d} r={r} fill={p.body} strong textured />
);

/** 작은 크기에서 장식이 몸체를 넘지 않게 치수 비율로 제한 */
const cap = (v: number, dim: number, f: number) => Math.min(v, dim * f);

/** 앞쪽 띠 */
const front = ({ w, d }: Box, p: SymbolPalette, h = 5) => (
  <Rect y={d - cap(h, d, 0.2)} w={w} h={cap(h, d, 0.2)} fill={p.line} />
);

const DECOR: Record<
  FurnitureCategory,
  (b: Box, p: SymbolPalette, c: Ctx) => ReactNode
> = {
  bed: (b, p, c) => {
    const pillows = b.w < 120 ? 1 : 2;
    const head = cap(12, b.d, 0.06);
    const gap = cap(10, b.w, 0.08);
    const edge = cap(12.5, b.w, 0.1);
    const pw = (b.w - edge * 2 - gap * (pillows - 1)) / pillows;
    const py = head + cap(6, b.d, 0.03);
    const ph = cap(30, b.d, 0.15);
    const blanket = cap(55, b.d, 0.3);
    return (
      <>
        {body(b, p, c)}
        <Part c={c} p={p} y={blanket} w={b.w} h={b.d - blanket} fill={p.soft} />
        <Part c={c} p={p} w={b.w} h={head} fill={p.line} />
        {Array.from({ length: pillows }, (_, i) => (
          <Part
            key={i}
            c={c}
            p={p}
            x={edge + i * (pw + gap)}
            y={py}
            w={pw}
            h={ph}
            r={6}
            fill={p.hi}
            z={2}
          />
        ))}
        <line
          x1={cap(4, b.w, 0.1)}
          x2={b.w - cap(4, b.w, 0.1)}
          y1={blanket + cap(10, b.d, 0.05)}
          y2={blanket + cap(10, b.d, 0.05)}
          stroke={p.line}
          strokeWidth={1}
          {...px}
        />
      </>
    );
  },
  desk: (b, p, c) => {
    const inset = cap(4, Math.min(b.w, b.d), 0.15);
    const kw = cap(40, b.w, 0.35);
    const kh = cap(10, b.d, 0.15);
    const mw = cap(24, b.w, 0.25);
    return (
      <>
        {body(b, p, c)}
        <Rect
          x={inset}
          y={inset}
          w={b.w - inset * 2}
          h={b.d - inset * 2}
          r={2}
          fill="none"
          stroke={p.line}
          strokeWidth={1}
        />
        <Rect
          x={(b.w - mw) / 2}
          y={cap(10, b.d, 0.15)}
          w={mw}
          h={cap(6, b.d, 0.1)}
          r={2}
          fill={p.line}
        />
        <Part
          c={c}
          p={p}
          x={(b.w - kw) / 2}
          y={b.d - inset - cap(8, b.d, 0.1) - kh}
          w={kw}
          h={kh}
          r={2}
          fill={p.hi}
          z={1}
        />
      </>
    );
  },
  chair: (b, p, c) => {
    const bh = cap(10, b.d, 0.22);
    const inset = cap(7, Math.min(b.w, b.d), 0.16);
    const side = cap(10, b.w, 0.3);
    return (
      <>
        {body(b, p, c, 10)}
        <Part
          c={c}
          p={p}
          x={inset}
          y={bh + inset * 0.6}
          w={b.w - inset * 2}
          h={b.d - bh - inset * 1.6}
          r={6}
          fill={p.hi}
          z={1.5}
        />
        <path
          d={`M${side} 0H${b.w - side}V${bh * 0.6}Q${b.w / 2} ${bh * 1.6} ${side} ${bh * 0.6}Z`}
          fill={p.line}
          stroke={p.line}
          strokeWidth={1}
          strokeLinejoin="round"
          {...px}
        />
      </>
    );
  },
  sofa: (b, p, c) => {
    const back = cap(22.5, b.d, 0.28);
    const arm = cap(17.5, b.w, 0.14);
    const seats = b.w < 190 ? 2 : 3;
    const gap = 3;
    const rr = cap(10, Math.min(b.w, b.d), 0.2);
    const sw = (b.w - arm * 2 - gap * (seats + 1)) / seats;
    return (
      <>
        {body(b, p, c)}
        <Part c={c} p={p} w={b.w} h={back} r={rr} fill={p.soft} />
        <Part c={c} p={p} w={arm} h={b.d} r={rr} fill={p.soft} />
        <Part c={c} p={p} x={b.w - arm} w={arm} h={b.d} r={rr} fill={p.soft} />
        {Array.from({ length: seats }, (_, i) => (
          <Part
            key={i}
            c={c}
            p={p}
            x={arm + gap + i * (sw + gap)}
            y={back + gap}
            w={sw}
            h={b.d - back - gap * 2}
            r={R}
            fill={p.hi}
            z={1.5}
          />
        ))}
      </>
    );
  },
  "dining-table": (b, p, c) => {
    const leg = cap(8, Math.min(b.w, b.d), 0.15);
    return (
      <>
        {body(b, p, c)}
        <Rect
          x={leg / 2}
          y={leg / 2}
          w={b.w - leg}
          h={b.d - leg}
          r={3}
          fill="none"
          stroke={p.line}
          strokeWidth={1}
        />
        {[leg, b.w - leg].flatMap((x) =>
          [leg, b.d - leg].map((y) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={cap(3.5, Math.min(b.w, b.d), 0.07)}
              fill={p.line}
              {...px}
            />
          )),
        )}
      </>
    );
  },
  wardrobe: (b, p, c) => {
    const doors = b.w >= 120 ? 3 : 2;
    const dividers = Array.from(
      { length: doors - 1 },
      (_, i) => (b.w * (i + 1)) / doors,
    );
    const off = cap(6, b.w, 0.06);
    const y = b.d - cap(12, b.d, 0.25);
    return (
      <>
        {body(b, p, c)}
        {front(b, p)}
        {dividers.map((x) => (
          <Rect key={x} x={x - 1.25} w={2.5} h={b.d} fill={p.line} />
        ))}
        {dividers.flatMap((x) =>
          [x - off, x + off].map((cx) => (
            <circle
              key={cx}
              cx={cx}
              cy={y}
              r={cap(2.5, Math.min(b.w, b.d), 0.06)}
              fill={p.line}
              {...px}
            />
          )),
        )}
      </>
    );
  },
  drawer: (b, p, c) => (
    <>
      {body(b, p, c)}
      {front(b, p)}
      {[0.23, 0.5, 0.77].map((t) => (
        <Rect
          key={t}
          x={b.w * t - 3.75}
          y={b.d - 14}
          w={7.5}
          h={4}
          r={1}
          fill={p.line}
        />
      ))}
    </>
  ),
  bookshelf: (b, p, c) => {
    const bays = [0, 1, 2];
    const bw = b.w / bays.length;
    const h = cap(6, b.d, 0.25);
    return (
      <>
        {body(b, p, c)}
        {front(b, p, 4)}
        {bays.slice(1).map((i) => (
          <Rect key={i} x={bw * i - 1.25} w={2.5} h={b.d} fill={p.line} />
        ))}
        {bays.map((i) => (
          <Rect
            key={i}
            x={bw * i + bw * 0.15}
            y={b.d - h - cap(8, b.d, 0.3)}
            w={bw * 0.7}
            h={h}
            r={1}
            fill={p.line}
          />
        ))}
      </>
    );
  },
  hanger: (b, p) => {
    const hooks = Math.max(2, Math.round(b.w / 16));
    return (
      <>
        <Rect
          w={b.w}
          h={b.d}
          r={3}
          fill={p.ghost}
          stroke={p.line}
          strokeWidth={2}
        />
        <Rect x={5} y={b.d / 2 - 1.25} w={b.w - 10} h={2.5} fill={p.line} />
        {Array.from({ length: hooks }, (_, i) => (
          <Rect
            key={i}
            x={(b.w * (i + 1)) / (hooks + 1) - 1.25}
            y={b.d / 2 - 8.75}
            w={2.5}
            h={17.5}
            fill={p.line}
          />
        ))}
      </>
    );
  },
  "tv-stand": (b, p, c) => {
    const sx = cap(15, b.w, 0.1);
    const sw = cap(20, b.w, 0.15);
    const sh = cap(6, b.d, 0.15);
    return (
      <>
        {body(b, p, c)}
        <Rect x={sx} y={4} w={b.w - sx * 2} h={sh} r={2} fill={p.screen} />
        <Rect x={(b.w - sw) / 2} y={4 + sh} w={sw} h={sh} r={1} fill={p.line} />
        {front(b, p)}
      </>
    );
  },
  nightstand: (b, p, c) => (
    <>
      {body(b, p, c)}
      <circle
        cx={b.w / 2}
        cy={b.d / 2}
        r={Math.min(b.w, b.d) * 0.22}
        fill={p.hi}
        stroke={p.line}
        strokeWidth={1}
        {...px}
      />
    </>
  ),
  "dressing-table": (b, p, c) => (
    <>
      {body(b, p, c)}
      <Part c={c} p={p} x={12.5} y={2.5} w={b.w - 25} h={5} r={2} fill={p.hi} />
      {front(b, p)}
    </>
  ),
  fridge: (b, p, c) => {
    const fh = cap(7.5, b.d, 0.12);
    const side = b.w >= 80;
    const hh = cap(12, b.d, 0.2);
    const hy = b.d - fh - hh - cap(3, b.d, 0.05);
    return (
      <>
        {body(b, p, c)}
        {front(b, p, fh)}
        {side ? (
          <>
            <Rect x={b.w / 2 - 1.25} w={2.5} h={b.d} fill={p.line} />
            <Rect x={b.w / 2 - 8} y={hy} w={3.5} h={hh} r={1} fill={p.line} />
            <Rect x={b.w / 2 + 4.5} y={hy} w={3.5} h={hh} r={1} fill={p.line} />
          </>
        ) : (
          <Rect x={b.w * 0.75} y={hy} w={3.5} h={hh} r={1} fill={p.line} />
        )}
      </>
    );
  },
  washer: (b, p, c) => {
    const bar = cap(12, b.d, 0.2);
    const r = Math.min(b.w, b.d - bar) * 0.33;
    const cy = bar + (b.d - bar) / 2;
    return (
      <>
        {body(b, p, c)}
        <Part c={c} p={p} w={b.w} h={bar} fill={p.line} />
        <circle
          cx={b.w / 2}
          cy={cy}
          r={r}
          fill={p.hi}
          stroke={p.line}
          strokeWidth={2}
          {...px}
        />
        <circle
          cx={b.w / 2}
          cy={cy}
          r={r * 0.62}
          fill="none"
          stroke={p.line}
          strokeWidth={1}
          {...px}
        />
      </>
    );
  },
  rug: (b, p) => (
    <>
      <Rect w={b.w} h={b.d} r={R} fill={p.rug} />
      {p.texture && <Rect w={b.w} h={b.d} r={R} fill={p.texture} />}
      <Rect
        x={10}
        y={10}
        w={b.w - 20}
        h={b.d - 20}
        r={2}
        fill="none"
        stroke={p.rugLine}
        strokeWidth={2}
      />
    </>
  ),
  etc: (b, p, c) => body(b, p, c),
};

/** 입체 표현 공용 gradient·filter - 도면(방)·썸네일 svg마다 한 번만 */
export function SymbolDefs({
  scope,
  rich = false,
}: {
  scope: string;
  rich?: boolean;
}) {
  return (
    <defs>
      <linearGradient id={`${scope}-s`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.38} />
        <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" style={{ stopColor: SHADOW }} stopOpacity={0.14} />
      </linearGradient>
      {rich && (
        <filter id={`${scope}-b`} x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation={1.4} />
        </filter>
      )}
    </defs>
  );
}

/** 프리셋이 없으면 기타 모양 */
export function FurnitureSymbol({
  category = "etc",
  size,
  color,
  texture,
  scope,
  rich = false,
}: {
  category?: FurnitureCategory;
  size: Pick<Size, "width" | "depth">;
  /** 고른 색 hex, 없으면 기본 베이지 */
  color?: string;
  texture?: TextureRef;
  /** 같은 svg의 SymbolDefs scope */
  scope: string;
  /** 부품 그림자 - 편집기 그림자 품질 설정 */
  rich?: boolean;
}) {
  return DECOR[category](
    { w: size.width, d: size.depth },
    symbolPalette(color, texture),
    { scope, rich },
  );
}

/** 목록 썸네일 - 회전 0 */
export function FurnitureThumb({
  category,
  size,
  color,
  px = 48,
}: {
  category?: FurnitureCategory;
  size: Pick<Size, "width" | "depth">;
  color?: string;
  px?: number;
}) {
  const { width, depth } = size;
  const scope = useId();
  const pad = Math.max(width, depth) * 0.12;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md bg-scene-floor"
      style={{ width: px, height: px }}
    >
      <svg
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${depth + pad * 2}`}
        width={px}
        height={px}
        aria-hidden
      >
        <SymbolDefs scope={scope} />
        <FurnitureSymbol
          category={category}
          size={size}
          color={color}
          scope={scope}
        />
      </svg>
    </span>
  );
}
