import type { FurnitureCategory, Size } from "@gagufit/core";
import type { ReactNode } from "react";
import type { TextureRef } from "./PlanDefs";
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

const DECOR: Record<
  FurnitureCategory,
  (b: Box, p: SymbolPalette) => ReactNode
> = {
  bed: (b, p) => {
    const pillows = b.w < 120 ? 1 : 2;
    const pw = (b.w - 12.5 * 2 - 10 * (pillows - 1)) / pillows;
    return (
      <>
        {body(b, p)}
        {Array.from({ length: pillows }, (_, i) => (
          <Rect
            key={i}
            x={12.5 + i * (pw + 10)}
            y={10}
            w={pw}
            h={30}
            r={6}
            fill={p.hi}
            stroke={p.line}
            strokeWidth={1}
          />
        ))}
        <Rect y={55} w={b.w} h={b.d - 55} r={R} fill={p.soft} />
      </>
    );
  },
  desk: (b, p) => (
    <>
      {body(b, p)}
      <Rect y={b.d - 7.5} w={b.w} h={2.5} fill={p.line} />
      <Rect x={(b.w - 45) / 2} y={7.5} w={45} h={6} r={2} fill={p.line} />
    </>
  ),
  chair: (b, p) => (
    <>
      <Rect
        w={b.w}
        h={b.d}
        r={10}
        fill={p.body}
        stroke={p.line}
        strokeWidth={1}
      />
      <Rect x={5} w={b.w - 10} h={9} r={4} fill={p.line} />
    </>
  ),
  sofa: (b, p) => (
    <>
      {body(b, p)}
      <Rect w={b.w} h={22.5} r={R} fill={p.line} />
      <Rect w={17.5} h={b.d} r={R} fill={p.line} />
      <Rect x={b.w - 17.5} w={17.5} h={b.d} r={R} fill={p.line} />
      <Rect x={b.w / 2 - 1.25} y={22.5} w={2.5} h={b.d - 22.5} fill={p.line} />
    </>
  ),
  "dining-table": (b, p) => (
    <>
      {body(b, p)}
      <Rect
        x={7.5}
        y={7.5}
        w={b.w - 15}
        h={b.d - 15}
        r={3}
        fill={p.hi}
        stroke={p.line}
        strokeWidth={1}
      />
    </>
  ),
  wardrobe: (b, p) => (
    <>
      {body(b, p)}
      <Rect x={b.w / 2 - 1.25} w={2.5} h={b.d} fill={p.line} />
      {front(b, p)}
    </>
  ),
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
  bookshelf: (b, p) => (
    <>
      {body(b, p)}
      {front(b, p, 4)}
      <Rect x={b.w / 3 - 1.25} w={2.5} h={b.d} fill={p.line} />
      <Rect x={(b.w * 2) / 3 - 1.25} w={2.5} h={b.d} fill={p.line} />
    </>
  ),
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
  "tv-stand": (b, p) => (
    <>
      {body(b, p)}
      <Rect x={15} y={4} w={b.w - 30} h={6} r={2} fill={p.screen} />
      {front(b, p)}
    </>
  ),
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
  fridge: (b, p) => (
    <>
      {body(b, p)}
      {front(b, p, 7.5)}
      <Rect x={b.w * 0.75} y={b.d - 15} w={7.5} h={5} r={1} fill={p.line} />
    </>
  ),
  washer: (b, p) => (
    <>
      {body(b, p)}
      <circle
        cx={b.w / 2}
        cy={b.d / 2}
        r={Math.min(b.w, b.d) * 0.29}
        fill={p.hi}
        stroke={p.line}
        strokeWidth={2}
        {...px}
      />
      {front(b, p)}
    </>
  ),
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
