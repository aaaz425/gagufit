import {
  doorPassageCorners,
  furnitureCorners,
  type FurnitureMaterial,
  wallFrame,
  type Opening,
  type PlacedFurniture,
  type Room,
  type Vec2,
} from "@gagufit/core";
import { FURNITURE_COLORS, FURNITURE_PRESETS } from "@gagufit/data";
import { useId } from "react";
import { useInitialIds } from "@/motion";
import type { WarningTone } from "../labels";
import { DOOR_AREA_OPACITY } from "../scene-colors";
import type { Selection } from "../store";
import { FurnitureSymbol } from "./FurnitureSymbol";
import { PlanFloor, TextureDefs } from "./PlanDefs";
import type { PlanTexture } from "./texture";

// 방 cm 좌표에서 그림 - 선 굵기·핸들 크기는 화면 px라 scale로 나눔

/** 벽 두께 px - 방 바깥쪽으로 */
export const WALL_PX = 8;
/** 가구 그림자 화면 오프셋 px - 빛은 왼쪽 위, 화면을 돌려도 고정 */
const SHADOW_PX = { x: 3, y: 4 };

const px = { vectorEffect: "non-scaling-stroke" } as const;
const tint = (color: string, percent: number) =>
  `color-mix(in srgb, var(--color-${color}) ${percent}%, transparent)`;

const points = (ps: Vec2[]) => ps.map((p) => `${p.x},${p.y}`).join(" ");
const add = (a: Vec2, b: Vec2, k = 1): Vec2 => ({
  x: a.x + b.x * k,
  y: a.y + b.y * k,
});

/** 벽 좌표계에 문·창문 왼쪽·오른쪽 끝 */
export function openingFrame(room: Room, o: Opening) {
  const frame = wallFrame(room, o.wall);
  const left = add(frame.start, frame.u, o.offset);
  const right = add(left, frame.u, o.width);
  return { ...frame, n: frame.inward, left, right };
}

function furnitureTransform(f: PlacedFurniture, w: number, d: number) {
  return `translate(${f.position.x} ${f.position.y}) rotate(${-f.rotation}) translate(${-w / 2} ${-d / 2})`;
}

export function RoomPlan({
  room,
  scale,
  selection,
  warned,
  angle = 0,
}: {
  room: Room;
  scale: number;
  /** 화면 회전(도) - 그림자 방향 고정용 */
  angle?: number;
  selection: Selection;
  warned: ReadonlyMap<string, WarningTone>;
}) {
  const wall = WALL_PX / scale;
  const scope = useId();
  const initialIds = useInitialIds(room.furniture.map((f) => f.id));
  // 러그 - 문 열림 영역 - 다른 가구 순서
  const isRug = (f: PlacedFurniture) =>
    FURNITURE_PRESETS[f.presetId]?.layer === "floor";
  // 행거는 속이 비쳐 그림자가 진해 보임
  const isHollow = (f: PlacedFurniture) =>
    FURNITURE_PRESETS[f.presetId]?.category === "hanger";
  const shape = (f: PlacedFurniture) => (
    <FurnitureShape
      key={f.id}
      furniture={f}
      warned={warned.get(f.id)}
      selected={selection?.kind === "furniture" && selection.id === f.id}
      enter={!initialIds.has(f.id)}
      scale={scale}
      scope={scope}
    />
  );
  const rad = (-angle * Math.PI) / 180;
  const off = {
    x: (SHADOW_PX.x * Math.cos(rad) - SHADOW_PX.y * Math.sin(rad)) / scale,
    y: (SHADOW_PX.x * Math.sin(rad) + SHADOW_PX.y * Math.cos(rad)) / scale,
  };
  const shadow = (f: PlacedFurniture) => (
    <rect
      key={f.id}
      width={f.size.width}
      height={f.size.depth}
      rx={4}
      fill="var(--color-scene-wall)"
      opacity={0.16}
      transform={furnitureTransform(
        { ...f, position: add(f.position, off) },
        f.size.width,
        f.size.depth,
      )}
      pointerEvents="none"
    />
  );
  const selectedOpening =
    selection?.kind === "opening" ? selection.id : undefined;

  return (
    <>
      <TextureDefs scale={scale} scope={scope} />
      <PlanFloor room={room} scale={scale} scope={scope} />
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
      {room.furniture.filter(isRug).map(shape)}
      {room.openings.map((o) => (
        <OpeningShape
          key={o.id}
          room={room}
          opening={o}
          scale={scale}
          selected={o.id === selectedOpening}
        />
      ))}
      {room.furniture.filter((f) => !isRug(f) && !isHollow(f)).map(shadow)}
      {room.furniture.filter((f) => !isRug(f)).map(shape)}
    </>
  );
}

function FurnitureShape({
  furniture: f,
  warned,
  selected,
  enter,
  scale,
  scope,
}: {
  furniture: PlacedFurniture;
  warned: WarningTone | undefined;
  selected: boolean;
  /** 추가 직후 등장 효과 */
  enter: boolean;
  scale: number;
  scope: string;
}) {
  const preset = FURNITURE_PRESETS[f.presetId];
  const { width: w, depth: d } = f.size;
  const outline = warned ?? "primary";
  return (
    <g transform={furnitureTransform(f, w, d)}>
      {/* 끌기·회전은 바깥 g의 transform 속성 - 등장 효과는 안쪽 g에서만 */}
      <g
        data-hit="furniture"
        data-id={f.id}
        className={enter ? "motion-plan-pop cursor-grab" : "cursor-grab"}
      >
        <FurnitureSymbol
          category={preset?.category}
          size={f.size}
          color={FURNITURE_COLORS[f.color].hex}
          texture={textureOf(preset?.material, scope)}
        />
        {warned === "danger" && (
          <rect
            width={w}
            height={d}
            rx={4}
            fill={tint("danger", 28)}
            stroke="var(--color-danger)"
            strokeWidth={2}
            {...px}
          />
        )}
        {warned === "caution" && (
          <rect
            width={w}
            height={d}
            rx={4}
            fill="none"
            stroke="var(--color-caution)"
            strokeWidth={2}
            strokeDasharray="6 4"
            {...px}
          />
        )}
      </g>
      {selected && (
        <g className="motion-select">
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
          <g data-hit="rotate" data-id={f.id} className="cursor-rotate">
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
        </g>
      )}
    </g>
  );
}

const TEXTURE_OF: Record<FurnitureMaterial, PlanTexture | undefined> = {
  wood: "wood",
  fabric: "fabric",
  appliance: undefined,
};

const textureOf = (m: FurnitureMaterial | undefined, scope: string) => {
  const kind = m && TEXTURE_OF[m];
  return kind ? { kind, scope } : undefined;
};

type OpeningFrame = ReturnType<typeof openingFrame>;

/** 방 안쪽 열림 영역 - 여닫이는 부채꼴, 미닫이는 통로 */
function OpeningInside({
  room,
  opening: o,
  frame,
  selected,
  scale,
}: {
  room: Room;
  opening: Opening;
  frame: OpeningFrame;
  selected: boolean;
  scale: number;
}) {
  const { u, n, left, right } = frame;
  const color = selected ? "primary" : "ink-muted";
  const area = {
    fill: tint(color, DOOR_AREA_OPACITY * 100),
    stroke: selected ? "var(--color-primary)" : tint("ink-muted", 50),
    strokeWidth: selected ? 1.5 : 1,
    ...px,
  };

  if (o.kind === "hinged" && o.swing === "in") {
    const hinge = o.hinge === "left" ? left : right;
    const along = o.hinge === "left" ? u : { x: -u.x, y: -u.y };
    const closed = add(hinge, along, o.width);
    const open = add(hinge, n, o.width);
    const sweep = along.x * n.y - along.y * n.x > 0 ? 1 : 0;
    return (
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
        <circle
          cx={hinge.x}
          cy={hinge.y}
          r={3 / scale}
          fill="var(--color-canvas)"
          stroke={`var(--color-${color})`}
          strokeWidth={1.5}
          {...px}
        />
      </>
    );
  }
  if (o.kind === "window") return null;
  return <polygon points={points(doorPassageCorners(room, o))} {...area} />;
}

/** 벽 속 그림 - 문틈, 창문 살, 미닫이 짝 */
function OpeningInWall({
  opening: o,
  frame,
  wall,
  gap,
}: {
  opening: Opening;
  frame: OpeningFrame;
  wall: number;
  gap: Vec2[];
}) {
  const { u, n, left, right } = frame;
  if (o.kind === "window") {
    const mid = (k: number) => add(left, n, -wall * k);
    const end = (k: number) => add(right, n, -wall * k);
    return (
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
  }
  if (o.kind === "sliding") {
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
    return (
      <>
        <polygon points={points(gap)} fill="var(--color-canvas)" />
        {leaf(0, 0.55, 0.7, "var(--color-scene-wall)")}
        {leaf(0.45, 1, 0.3, "var(--color-ink-muted)")}
      </>
    );
  }
  return <polygon points={points(gap)} fill="var(--color-canvas)" />;
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
  const frame = openingFrame(room, o);
  const { n, left, right } = frame;
  const wall = WALL_PX / scale;
  // 벽 띠 - 방 바깥쪽으로 wall 두께, 이음새 가리게 조금 넓힘
  const gap = [
    left,
    right,
    add(right, n, -wall - 0.5),
    add(left, n, -wall - 0.5),
  ];
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
      <OpeningInside
        room={room}
        opening={o}
        frame={frame}
        selected={selected}
        scale={scale}
      />
      <OpeningInWall opening={o} frame={frame} wall={wall} gap={gap} />
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
        className="cursor-grab"
      />
    </g>
  );
}

/** 화면에서 벽이 향한 각도(도)에 맞는 양방향 크기 조절 커서 */
function resizeCursor(deg: number) {
  const step = Math.round((((deg % 180) + 180) % 180) / 45) % 4;
  return ["ew-resize", "nwse-resize", "ns-resize", "nesw-resize"][step];
}

/** 선택한 문·창문 폭 핸들 - 다른 그림 위에 */
export function OpeningHandles({
  room,
  opening,
  scale,
  angle,
}: {
  room: Room;
  opening: Opening;
  scale: number;
  /** 화면 회전(도) - 벽 방향에 맞는 커서 고르기 */
  angle: number;
}) {
  const { n, u, left, right } = openingFrame(room, opening);
  const cursor = resizeCursor(Math.atan2(u.y, u.x) * (180 / Math.PI) + angle);
  const wall = WALL_PX / scale;
  const handle = (p: Vec2, side: "left" | "right") => {
    const c = add(p, n, -wall / 2);
    const s = 12 / scale;
    return (
      <g data-hit={`width-${side}`} data-id={opening.id} style={{ cursor }}>
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
  const w = text.length * 7 + 12;
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
        fontSize={12}
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
  const cs = furnitureCorners(furniture);
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
