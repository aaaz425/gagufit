import type { FurnitureCategory, FurniturePreset } from "@gagufit/core";
import type { ReactNode } from "react";

// 가구 평면 기호 - (0,0)~(w,d) cm, 위쪽이 등·벽 쪽, 선 굵기는 화면 px

const BODY = "var(--color-scene-furniture)";
const LINE = "var(--color-scene-furniture-line)";
const SOFT = "var(--color-scene-furniture-soft)";
const WHITE = "rgb(255 255 255 / 0.5)";
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

const body = ({ w, d }: Box) => (
  <Rect w={w} h={d} r={R} fill={BODY} stroke={LINE} strokeWidth={1} />
);

/** 앞쪽 띠 */
const front = ({ w, d }: Box, h = 5) => (
  <Rect y={d - h} w={w} h={h} fill={LINE} />
);

const DECOR: Record<FurnitureCategory, (b: Box) => ReactNode> = {
  bed: (b) => {
    const pillows = b.w < 120 ? 1 : 2;
    const pw = (b.w - 12.5 * 2 - 10 * (pillows - 1)) / pillows;
    return (
      <>
        {body(b)}
        {Array.from({ length: pillows }, (_, i) => (
          <Rect
            key={i}
            x={12.5 + i * (pw + 10)}
            y={10}
            w={pw}
            h={30}
            r={6}
            fill={WHITE}
          />
        ))}
        <Rect y={55} w={b.w} h={b.d - 55} r={R} fill={SOFT} />
      </>
    );
  },
  desk: (b) => (
    <>
      {body(b)}
      <Rect y={b.d - 7.5} w={b.w} h={2.5} fill={LINE} />
      <Rect x={(b.w - 45) / 2} y={7.5} w={45} h={6} r={2} fill={LINE} />
    </>
  ),
  chair: (b) => (
    <>
      <Rect w={b.w} h={b.d} r={10} fill={BODY} stroke={LINE} strokeWidth={1} />
      <Rect x={5} w={b.w - 10} h={9} r={4} fill={LINE} />
    </>
  ),
  sofa: (b) => (
    <>
      {body(b)}
      <Rect w={b.w} h={22.5} r={R} fill={LINE} />
      <Rect w={17.5} h={b.d} r={R} fill={LINE} />
      <Rect x={b.w - 17.5} w={17.5} h={b.d} r={R} fill={LINE} />
      <Rect x={b.w / 2 - 1.25} y={22.5} w={2.5} h={b.d - 22.5} fill={LINE} />
    </>
  ),
  "dining-table": (b) => (
    <>
      {body(b)}
      <Rect x={7.5} y={7.5} w={b.w - 15} h={b.d - 15} r={3} fill={WHITE} />
    </>
  ),
  wardrobe: (b) => (
    <>
      {body(b)}
      <Rect x={b.w / 2 - 1.25} w={2.5} h={b.d} fill={LINE} />
      {front(b)}
    </>
  ),
  drawer: (b) => (
    <>
      {body(b)}
      {front(b)}
      {[0.23, 0.5, 0.77].map((t) => (
        <Rect
          key={t}
          x={b.w * t - 3.75}
          y={b.d - 14}
          w={7.5}
          h={4}
          r={1}
          fill={LINE}
        />
      ))}
    </>
  ),
  bookshelf: (b) => (
    <>
      {body(b)}
      {front(b, 4)}
      <Rect x={b.w / 3 - 1.25} w={2.5} h={b.d} fill={LINE} />
      <Rect x={(b.w * 2) / 3 - 1.25} w={2.5} h={b.d} fill={LINE} />
    </>
  ),
  hanger: (b) => {
    const hooks = Math.max(2, Math.round(b.w / 16));
    return (
      <>
        <Rect w={b.w} h={b.d} r={3} fill="none" stroke={LINE} strokeWidth={2} />
        <Rect x={5} y={b.d / 2 - 1.25} w={b.w - 10} h={2.5} fill={LINE} />
        {Array.from({ length: hooks }, (_, i) => (
          <Rect
            key={i}
            x={(b.w * (i + 1)) / (hooks + 1) - 1.25}
            y={b.d / 2 - 8.75}
            w={2.5}
            h={17.5}
            fill={LINE}
          />
        ))}
      </>
    );
  },
  "tv-stand": (b) => (
    <>
      {body(b)}
      <Rect
        x={15}
        y={4}
        w={b.w - 30}
        h={6}
        r={2}
        fill="var(--color-scene-wall)"
      />
      {front(b)}
    </>
  ),
  nightstand: (b) => (
    <>
      {body(b)}
      <circle
        cx={b.w / 2}
        cy={b.d / 2}
        r={Math.min(b.w, b.d) * 0.22}
        fill={WHITE}
        stroke={LINE}
        strokeWidth={1}
        {...px}
      />
    </>
  ),
  "dressing-table": (b) => (
    <>
      {body(b)}
      <Rect
        x={12.5}
        y={2.5}
        w={b.w - 25}
        h={5}
        r={2}
        fill={WHITE}
        stroke={LINE}
        strokeWidth={1}
      />
      {front(b)}
    </>
  ),
  fridge: (b) => (
    <>
      {body(b)}
      {front(b, 7.5)}
      <Rect x={b.w * 0.75} y={b.d - 15} w={7.5} h={5} r={1} fill={LINE} />
    </>
  ),
  washer: (b) => (
    <>
      {body(b)}
      <circle
        cx={b.w / 2}
        cy={b.d / 2}
        r={Math.min(b.w, b.d) * 0.29}
        fill={WHITE}
        stroke={LINE}
        strokeWidth={2}
        {...px}
      />
      {front(b)}
    </>
  ),
  rug: (b) => (
    <>
      <Rect w={b.w} h={b.d} r={R} fill="var(--color-scene-rug)" />
      <Rect
        x={10}
        y={10}
        w={b.w - 20}
        h={b.d - 20}
        r={2}
        fill="none"
        stroke={BODY}
        strokeWidth={2}
      />
    </>
  ),
  etc: body,
};

export function FurnitureSymbol({ preset }: { preset: FurniturePreset }) {
  return DECOR[preset.category]({ w: preset.size.width, d: preset.size.depth });
}

/** 목록 썸네일 - 회전 0 */
export function FurnitureThumb({
  preset,
  size = 48,
}: {
  preset: FurniturePreset;
  size?: number;
}) {
  const { width, depth } = preset.size;
  const pad = Math.max(width, depth) * 0.12;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-md bg-scene-floor"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${depth + pad * 2}`}
        width={size}
        height={size}
        aria-hidden
      >
        <FurnitureSymbol preset={preset} />
      </svg>
    </span>
  );
}
