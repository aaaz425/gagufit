import type { FurnitureCategory, Size } from "@gagufit/core";
import type { ReactNode } from "react";
import type { TextureRef } from "./texture";
import { symbolPalette, type SymbolPalette } from "./symbol-palette";

// 가구 평면 기호 - (0,0)~(w,d) cm, 위쪽이 등·벽 쪽, 선 굵기는 화면 px

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

const body = ({ w, d }: Box, p: SymbolPalette) => (
  <>
    <Rect w={w} h={d} r={R} fill={p.body} stroke={p.line} strokeWidth={1} />
    {p.texture && <Rect w={w} h={d} r={R} fill={p.texture} />}
  </>
);

/** 앞쪽 띠 */
const front = ({ w, d }: Box, p: SymbolPalette, h = 5) => (
  <Rect y={d - h} w={w} h={h} fill={p.line} />
);

/** 작은 크기에서 장식이 몸체를 넘지 않게 치수 비율로 제한 */
const cap = (v: number, dim: number, f: number) => Math.min(v, dim * f);

const DECOR: Record<
  FurnitureCategory,
  (b: Box, p: SymbolPalette) => ReactNode
> = {
  bed: (b, p) => {
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
        {body(b, p)}
        <Rect y={blanket} w={b.w} h={b.d - blanket} r={R} fill={p.soft} />
        <Rect w={b.w} h={head} r={R} fill={p.line} />
        {Array.from({ length: pillows }, (_, i) => (
          <Rect
            key={i}
            x={edge + i * (pw + gap)}
            y={py}
            w={pw}
            h={ph}
            r={6}
            fill={p.hi}
            stroke={p.line}
            strokeWidth={1}
          />
        ))}
        <Rect
          x={cap(4, b.w, 0.1)}
          y={blanket + cap(10, b.d, 0.05)}
          w={b.w - cap(8, b.w, 0.2)}
          h={1.5}
          fill={p.line}
        />
      </>
    );
  },
  desk: (b, p) => {
    const inset = cap(4, Math.min(b.w, b.d), 0.15);
    const kw = cap(40, b.w, 0.35);
    const kh = cap(10, b.d, 0.15);
    const mw = cap(24, b.w, 0.25);
    return (
      <>
        {body(b, p)}
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
        <Rect
          x={(b.w - kw) / 2}
          y={b.d - inset - cap(8, b.d, 0.1) - kh}
          w={kw}
          h={kh}
          r={2}
          fill={p.hi}
          stroke={p.line}
          strokeWidth={1}
        />
      </>
    );
  },
  chair: (b, p) => {
    const bh = cap(10, b.d, 0.22);
    const inset = cap(7, Math.min(b.w, b.d), 0.16);
    const side = cap(5, b.w, 0.1);
    return (
      <>
        <Rect
          w={b.w}
          h={b.d}
          r={10}
          fill={p.body}
          stroke={p.line}
          strokeWidth={1}
        />
        <Rect
          x={inset}
          y={bh + inset * 0.6}
          w={b.w - inset * 2}
          h={b.d - bh - inset * 1.6}
          r={6}
          fill={p.hi}
          stroke={p.line}
          strokeWidth={1}
        />
        <path
          d={`M${side} 0H${b.w - side}V${bh * 0.6}Q${b.w / 2} ${bh * 1.6} ${side} ${bh * 0.6}Z`}
          fill={p.line}
          stroke={p.line}
          strokeWidth={2}
          strokeLinejoin="round"
          {...px}
        />
      </>
    );
  },
  sofa: (b, p) => {
    const back = cap(22.5, b.d, 0.28);
    const arm = cap(17.5, b.w, 0.14);
    const seats = b.w < 190 ? 2 : 3;
    const gap = 3;
    const rr = cap(10, Math.min(b.w, b.d), 0.2);
    const sw = (b.w - arm * 2 - gap * (seats + 1)) / seats;
    return (
      <>
        {body(b, p)}
        <Rect w={b.w} h={back} r={rr} fill={p.line} />
        <Rect w={arm} h={b.d} r={rr} fill={p.line} />
        <Rect x={b.w - arm} w={arm} h={b.d} r={rr} fill={p.line} />
        {Array.from({ length: seats }, (_, i) => (
          <Rect
            key={i}
            x={arm + gap + i * (sw + gap)}
            y={back + gap}
            w={sw}
            h={b.d - back - gap * 2}
            r={R}
            fill={p.hi}
            stroke={p.line}
            strokeWidth={1}
          />
        ))}
      </>
    );
  },
  "dining-table": (b, p) => {
    const leg = cap(8, Math.min(b.w, b.d), 0.15);
    return (
      <>
        {body(b, p)}
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
  wardrobe: (b, p) => {
    const doors = b.w >= 120 ? 3 : 2;
    const dividers = Array.from(
      { length: doors - 1 },
      (_, i) => (b.w * (i + 1)) / doors,
    );
    const off = cap(6, b.w, 0.06);
    const y = b.d - cap(10, b.d, 0.2);
    return (
      <>
        {body(b, p)}
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
  drawer: (b, p) => (
    <>
      {body(b, p)}
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
  bookshelf: (b, p) => {
    const bays = [0, 1, 2];
    const bw = b.w / 3;
    const h = cap(6, b.d, 0.25);
    return (
      <>
        {body(b, p)}
        {[1, 2].map((i) => (
          <Rect key={i} x={bw * i - 1.25} w={2.5} h={b.d} fill={p.line} />
        ))}
        {bays.map((i) => (
          <Rect
            key={i}
            x={bw * i + bw * 0.15}
            y={b.d - h - cap(4, b.d, 0.1)}
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
  "tv-stand": (b, p) => {
    const sx = cap(15, b.w, 0.1);
    const sw = cap(20, b.w, 0.15);
    return (
      <>
        {body(b, p)}
        <Rect
          x={sx}
          y={4}
          w={b.w - sx * 2}
          h={cap(6, b.d, 0.15)}
          r={2}
          fill={p.screen}
        />
        <Rect
          x={(b.w - sw) / 2}
          y={4 + cap(6, b.d, 0.15)}
          w={sw}
          h={cap(6, b.d, 0.15)}
          r={1}
          fill={p.line}
        />
        {front(b, p)}
      </>
    );
  },
  nightstand: (b, p) => (
    <>
      {body(b, p)}
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
  "dressing-table": (b, p) => (
    <>
      {body(b, p)}
      <Rect
        x={12.5}
        y={2.5}
        w={b.w - 25}
        h={5}
        r={2}
        fill={p.hi}
        stroke={p.line}
        strokeWidth={1}
      />
      {front(b, p)}
    </>
  ),
  fridge: (b, p) => {
    const fh = cap(7.5, b.d, 0.12);
    const side = b.w >= 80;
    const hh = cap(12, b.d, 0.2);
    const hy = b.d - fh - hh - cap(3, b.d, 0.05);
    return (
      <>
        {body(b, p)}
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
  washer: (b, p) => {
    const bar = cap(12, b.d, 0.2);
    const r = Math.min(b.w, b.d - bar) * 0.33;
    const cy = bar + (b.d - bar) / 2;
    return (
      <>
        {body(b, p)}
        <Rect w={b.w} h={bar} r={R} fill={p.line} />
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
  etc: body,
};

/** 프리셋이 없으면 기타 모양 */
export function FurnitureSymbol({
  category = "etc",
  size,
  color,
  texture,
}: {
  category?: FurnitureCategory;
  size: Pick<Size, "width" | "depth">;
  /** 고른 색 hex, 없으면 기본 베이지 */
  color?: string;
  texture?: TextureRef;
}) {
  return DECOR[category](
    { w: size.width, d: size.depth },
    symbolPalette(color, texture),
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
        <FurnitureSymbol category={category} size={size} color={color} />
      </svg>
    </span>
  );
}
