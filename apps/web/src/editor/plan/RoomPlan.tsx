import {
  doorPassageCorners,
  furnitureCorners,
  wallSegment,
  type Opening,
  type PlacedFurniture,
  type Room,
  type Vec2,
} from "@gagufit/core";
import { FLOOR_MATERIALS, FURNITURE_PRESETS } from "@gagufit/data";
import type { ReactNode } from "react";
import type { Selection } from "../store";
import { FurnitureSymbol } from "./FurnitureSymbol";

// 방 cm 좌표에서 그림 - 선 굵기·핸들 크기는 화면 px라 scale로 나눔

/** 벽 두께 px - 방 바깥쪽으로 */
const WALL_PX = 8;
/** 격자 간격 */
const GRID = 50;

const px = { vectorEffect: "non-scaling-stroke" } as const;
const tint = (color: string, percent: number) =>
  `color-mix(in srgb, var(--color-${color}) ${percent}%, transparent)`;

const points = (ps: Vec2[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
const add = (a: Vec2, b: Vec2, k = 1): Vec2 => ({
  x: a.x + b.x * k,
  y: a.y + b.y * k,
});

/** 벽 방향 u, 방 안쪽 n, 왼쪽·오른쪽 끝 */
export function openingFrame(room: Room, o: Opening) {
  const { start, end } = wallSegment(room, o.wall);
  const len = Math.hypot(end.x - start.x, end.y - start.y);
  const u = { x: (end.x - start.x) / len, y: (end.y - start.y) / len };
  const n = { x: -u.y, y: u.x };
  const left = add(start, u, o.offset);
  const right = add(left, u, o.width);
  return { start, len, u, n, left, right };
}

function furnitureTransform(f: PlacedFurniture, w: number, d: number) {
  return `translate(${f.position.x} ${f.position.y}) rotate(${-f.rotation}) translate(${-w / 2} ${-d / 2})`;
}

export function RoomPlan({
  room,
  scale,
  selection,
  warned,
}: {
  room: Room;
  scale: number;
  selection: Selection;
  warned: ReadonlySet<string>;
}) {
  const wall = WALL_PX / scale;
  const gridX = Array.from(
    { length: Math.ceil(room.width / GRID) - 1 },
    (_, i) => (i + 1) * GRID,
  );
  const gridY = Array.from(
    { length: Math.ceil(room.depth / GRID) - 1 },
    (_, i) => (i + 1) * GRID,
  );
  // 러그는 다른 가구 아래
  const ordered = [
    ...room.furniture.filter(
      (f) => FURNITURE_PRESETS[f.presetId]?.layer === "floor",
    ),
    ...room.furniture.filter(
      (f) => FURNITURE_PRESETS[f.presetId]?.layer !== "floor",
    ),
  ];
  const selectedOpening =
    selection?.kind === "opening" ? selection.id : undefined;

  return (
    <>
      <rect
        width={room.width}
        height={room.depth}
        fill={FLOOR_MATERIALS[room.floorMaterial].color2d}
      />
      <g stroke="var(--color-scene-grid)" strokeWidth={1} {...px}>
        {gridX.map((x) => (
          <line key={`x${x}`} x1={x} x2={x} y1={0} y2={room.depth} {...px} />
        ))}
        {gridY.map((y) => (
          <line key={`y${y}`} y1={y} y2={y} x1={0} x2={room.width} {...px} />
        ))}
      </g>
      <rect
        x={-wall / 2}
        y={-wall / 2}
        width={room.width + wall}
        height={room.depth + wall}
        fill="none"
        stroke="var(--color-scene-wall)"
        strokeWidth={WALL_PX}
        {...px}
      />
      {room.openings.map((o) => (
        <OpeningShape
          key={o.id}
          room={room}
          opening={o}
          scale={scale}
          selected={o.id === selectedOpening}
        />
      ))}
      {ordered.map((f) => (
        <FurnitureShape
          key={f.id}
          furniture={f}
          warned={warned.has(f.id)}
          selected={selection?.kind === "furniture" && selection.id === f.id}
          scale={scale}
        />
      ))}
    </>
  );
}

function FurnitureShape({
  furniture: f,
  warned,
  selected,
  scale,
}: {
  furniture: PlacedFurniture;
  warned: boolean;
  selected: boolean;
  scale: number;
}) {
  const preset = FURNITURE_PRESETS[f.presetId];
  if (!preset) return null;
  const { width: w, depth: d } = preset.size;
  const outline = warned ? "danger" : "primary";
  return (
    <g transform={furnitureTransform(f, w, d)}>
      <g data-hit="furniture" data-id={f.id} className="cursor-move">
        <FurnitureSymbol preset={preset} />
        {warned && (
          <rect
            width={w}
            height={d}
            rx={4}
            fill={tint("danger-soft", 70)}
            stroke="var(--color-danger)"
            strokeWidth={2}
            {...px}
          />
        )}
      </g>
      {selected && (
        <>
          <rect
            width={w}
            height={d}
            rx={4}
            fill="none"
            stroke={tint(outline, 20)}
            strokeWidth={11}
            pointerEvents="none"
            {...px}
          />
          <rect
            width={w}
            height={d}
            rx={4}
            fill="none"
            stroke={`var(--color-${outline})`}
            strokeWidth={3}
            pointerEvents="none"
            {...px}
          />
          <g data-hit="rotate" data-id={f.id} className="cursor-grab">
            <circle cx={w / 2} cy={0} r={22 / scale} fill="transparent" />
            <circle
              cx={w / 2}
              cy={0}
              r={7 / scale}
              fill="var(--color-canvas)"
              stroke="var(--color-primary)"
              strokeWidth={3}
              {...px}
            />
          </g>
        </>
      )}
    </g>
  );
}

function OpeningShape({
  room,
  opening: o,
  scale,
  selected,
}: {
  room: Room;
  opening: Opening;
  scale: number;
  selected: boolean;
}) {
  const { u, n, left, right } = openingFrame(room, o);
  const wall = WALL_PX / scale;
  // 벽 띠 - 방 바깥쪽으로 wall 두께, 이음새 가리게 조금 넓힘
  const gap = [
    left,
    right,
    add(right, n, -wall - 0.5),
    add(left, n, -wall - 0.5),
  ];
  const color = selected ? "primary" : "ink-muted";
  const area = {
    fill: tint(color, selected ? 12 : 8),
    stroke: selected ? "var(--color-primary)" : tint("ink-muted", 50),
    strokeWidth: selected ? 1.5 : 1,
    ...px,
  };

  let inside: ReactNode = null;
  if (o.kind === "hinged" && o.swing === "in") {
    const hinge = o.hinge === "left" ? left : right;
    const along = o.hinge === "left" ? u : { x: -u.x, y: -u.y };
    const closed = add(hinge, along, o.width);
    const open = add(hinge, n, o.width);
    const sweep = along.x * n.y - along.y * n.x > 0 ? 1 : 0;
    inside = (
      <>
        <path
          d={`M${hinge.x} ${hinge.y} L${closed.x} ${closed.y} A${o.width} ${o.width} 0 0 ${sweep} ${open.x} ${open.y} Z`}
          {...area}
        />
        <line
          x1={hinge.x}
          y1={hinge.y}
          x2={open.x}
          y2={open.y}
          stroke={`var(--color-${color})`}
          strokeWidth={selected ? 3 : 2}
          {...px}
        />
      </>
    );
  } else if (o.kind !== "window") {
    inside = <polygon points={points(doorPassageCorners(room, o))} {...area} />;
  }

  let inWall: ReactNode;
  if (o.kind === "window") {
    const mid = (k: number) => add(left, n, -wall * k);
    const end = (k: number) => add(right, n, -wall * k);
    inWall = (
      <>
        <polygon points={points(gap)} fill="var(--color-canvas)" />
        {[0.15, 0.5, 0.85].map((k) => (
          <line
            key={k}
            x1={mid(k).x}
            y1={mid(k).y}
            x2={end(k).x}
            y2={end(k).y}
            stroke="var(--color-scene-wall)"
            strokeWidth={1}
            {...px}
          />
        ))}
      </>
    );
  } else if (o.kind === "sliding") {
    // 두 짝 - 바깥쪽 고정짝, 안쪽 움직짝
    const leaf = (from: number, to: number, k: number, stroke: string) => {
      const a = add(add(left, u, o.width * from), n, -wall * k);
      const b = add(add(left, u, o.width * to), n, -wall * k);
      return (
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={stroke}
          strokeWidth={3}
          {...px}
        />
      );
    };
    inWall = (
      <>
        <polygon points={points(gap)} fill="var(--color-canvas)" />
        {leaf(0, 0.55, 0.7, "var(--color-scene-wall)")}
        {leaf(0.45, 1, 0.3, "var(--color-ink-muted)")}
      </>
    );
  } else {
    inWall = <polygon points={points(gap)} fill="var(--color-canvas)" />;
  }

  // 끌기 대상 - 벽 따라 화면 40px 띠
  const reach = 20 / scale;
  const hit = [
    add(left, n, -reach),
    add(right, n, -reach),
    add(right, n, reach),
    add(left, n, reach),
  ];
  return (
    <g>
      {inside}
      {inWall}
      {selected && (
        <polygon
          points={points(gap)}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={3}
          {...px}
        />
      )}
      <polygon
        points={points(hit)}
        fill="transparent"
        data-hit="opening"
        data-id={o.id}
        className="cursor-move"
      />
    </g>
  );
}

/** 선택한 문·창문 폭 핸들 - 다른 그림 위에 */
export function OpeningHandles({
  room,
  opening,
  scale,
}: {
  room: Room;
  opening: Opening;
  scale: number;
}) {
  const { n, left, right } = openingFrame(room, opening);
  const wall = WALL_PX / scale;
  const handle = (p: Vec2, side: "left" | "right") => {
    const c = add(p, n, -wall / 2);
    const s = 12 / scale;
    return (
      <g
        data-hit={`width-${side}`}
        data-id={opening.id}
        className="cursor-ew-resize"
      >
        <circle cx={c.x} cy={c.y} r={22 / scale} fill="transparent" />
        <rect
          x={c.x - s / 2}
          y={c.y - s / 2}
          width={s}
          height={s}
          rx={3 / scale}
          fill="var(--color-canvas)"
          stroke="var(--color-primary)"
          strokeWidth={2}
          {...px}
        />
      </g>
    );
  };
  return (
    <>
      {handle(left, "left")}
      {handle(right, "right")}
    </>
  );
}

/** 화면 px 크기로 보이는 치수 글자 */
export function Label({
  at,
  text,
  scale,
  angle,
  anchor = "middle",
}: {
  at: Vec2;
  text: string;
  scale: number;
  angle: number;
  anchor?: "start" | "middle";
}) {
  const w = text.length * 6.5 + 12;
  return (
    <g
      transform={`translate(${at.x} ${at.y}) scale(${1 / scale}) rotate(${-angle})`}
      pointerEvents="none"
    >
      <rect
        x={anchor === "middle" ? -w / 2 : 0}
        y={-9}
        width={w}
        height={18}
        rx={4}
        fill="var(--color-canvas)"
      />
      <text
        x={anchor === "middle" ? 0 : 6}
        y={4}
        textAnchor={anchor}
        fontSize={11}
        fontWeight={600}
        fill="var(--color-ink-muted)"
        className="tabular-nums"
      >
        {text}
      </text>
    </g>
  );
}

function Guide({
  from,
  to,
  scale,
  angle,
}: {
  from: Vec2;
  to: Vec2;
  scale: number;
  angle: number;
}) {
  const length = Math.round(Math.hypot(to.x - from.x, to.y - from.y));
  if (length <= 0) return null;
  return (
    <>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="var(--color-ink-muted)"
        strokeWidth={1}
        pointerEvents="none"
        {...px}
      />
      <Label
        at={{ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }}
        text={`${length} cm`}
        scale={scale}
        angle={angle}
      />
    </>
  );
}

/** 끌기 중 가구에서 가까운 벽까지 */
export function FurnitureGuides({
  room,
  furniture,
  scale,
  angle,
}: {
  room: Room;
  furniture: PlacedFurniture;
  scale: number;
  angle: number;
}) {
  const preset = FURNITURE_PRESETS[furniture.presetId];
  if (!preset) return null;
  const cs = furnitureCorners(furniture, preset.size);
  const minX = Math.min(...cs.map((c) => c.x));
  const maxX = Math.max(...cs.map((c) => c.x));
  const minY = Math.min(...cs.map((c) => c.y));
  const maxY = Math.max(...cs.map((c) => c.y));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const toLeft = minX <= room.width - maxX;
  const toTop = minY <= room.depth - maxY;
  return (
    <>
      <Guide
        from={{ x: toLeft ? 0 : maxX, y: cy }}
        to={{ x: toLeft ? minX : room.width, y: cy }}
        scale={scale}
        angle={angle}
      />
      <Guide
        from={{ x: cx, y: toTop ? 0 : maxY }}
        to={{ x: cx, y: toTop ? minY : room.depth }}
        scale={scale}
        angle={angle}
      />
    </>
  );
}

/** 벽 왼쪽 끝부터 문·창문 왼쪽 끝까지 - 방 안쪽으로 조금 띄움 */
export function OpeningGuide({
  room,
  opening,
  scale,
  angle,
}: {
  room: Room;
  opening: Opening;
  scale: number;
  angle: number;
}) {
  const { start, n, left } = openingFrame(room, opening);
  const k = 16 / scale;
  return (
    <Guide
      from={add(start, n, k)}
      to={add(left, n, k)}
      scale={scale}
      angle={angle}
    />
  );
}
