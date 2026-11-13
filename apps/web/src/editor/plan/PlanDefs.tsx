import type { FloorMaterialId, Room } from "@gagufit/core";
import { FLOOR_MATERIALS } from "@gagufit/data";
import type { ReactNode } from "react";

// 바닥 패턴·가구 질감 - 패턴 좌표는 방 cm, 선 굵기는 화면 1px(1/scale)
// 간격이 화면 5px 아래로 줄면 그리지 않음 - 줌 아웃에서 뭉개지지 않게

const INK = "var(--color-scene-wall)";
const MIN_GAP_PX = 5;

type FloorSpec = {
  size: [number, number];
  /** 화면에 보이는 가장 좁은 간격 cm */
  gap: number;
  opacity: number;
  draw: (w: number) => ReactNode;
};

const planks: FloorSpec = {
  size: [120, 30],
  gap: 15,
  opacity: 0.14,
  draw: () => <path d="M0 0H120M0 15H120M0 0V15M60 15V30" />,
};

const tile = (s: number): FloorSpec => ({
  size: [s, s],
  gap: s,
  opacity: 0.16,
  draw: () => <path d={`M0 0H${s}M0 0V${s}`} />,
});

const dots = (s: number, opacity = 0.12): FloorSpec => ({
  size: [s, s],
  gap: s,
  opacity,
  draw: (w) => <circle cx={s / 2} cy={s / 2} r={w} fill={INK} stroke="none" />,
});

const FLOOR_SPECS: Record<FloorMaterialId, FloorSpec> = {
  "floor-light-oak": planks,
  "floor-dark-walnut": planks,
  "floor-grey-tile": tile(60),
  "floor-white-tile": tile(30),
  "floor-vinyl": dots(20),
  "floor-carpet": dots(10, 0.09),
};

const GRID = 50;
/** 격자 교차 십자 팔 길이 - 화면 px */
const GRID_ARM_PX = 4;
/** 이보다 줌 아웃하면 격자 교차점 생략 - 썸네일·전체 보기 */
const GRID_MIN_SCALE = 0.5;

/** 바닥색 + 재질 패턴 + 50cm 격자 교차점 */
export function PlanFloor({
  room,
  scale,
  scope,
}: {
  room: Room;
  scale: number;
  scope: string;
}) {
  const w = 1 / scale;
  const spec = FLOOR_SPECS[room.floorMaterial];
  const show = spec.gap * scale >= MIN_GAP_PX;
  const arm = GRID_ARM_PX * w;
  const rect = { width: room.width, height: room.depth };
  return (
    <>
      <defs>
        <pattern
          id={`${scope}-floor`}
          patternUnits="userSpaceOnUse"
          width={spec.size[0]}
          height={spec.size[1]}
        >
          <g stroke={INK} strokeWidth={w} fill="none" opacity={spec.opacity}>
            {spec.draw(w)}
          </g>
        </pattern>
        <pattern
          id={`${scope}-grid`}
          patternUnits="userSpaceOnUse"
          x={-GRID / 2}
          y={-GRID / 2}
          width={GRID}
          height={GRID}
        >
          <path
            d={`M${GRID / 2 - arm} ${GRID / 2}H${GRID / 2 + arm}M${GRID / 2} ${GRID / 2 - arm}V${GRID / 2 + arm}`}
            stroke={INK}
            strokeOpacity={0.22}
            strokeWidth={w * 1.5}
            fill="none"
          />
        </pattern>
      </defs>
      <rect {...rect} fill={FLOOR_MATERIALS[room.floorMaterial].color2d} />
      {show && <rect {...rect} fill={`url(#${scope}-floor)`} />}
      {scale >= GRID_MIN_SCALE && (
        <rect {...rect} fill={`url(#${scope}-grid)`} />
      )}
    </>
  );
}

/** 가구 질감 - 나무 결·패브릭 짜임, 어두운 몸체는 밝은 선 */
export type PlanTexture = "wood" | "fabric";

/** scope - 같은 화면에 도면이 여러 개여도 패턴 id가 겹치지 않게 */
export type TextureRef = { kind: PlanTexture; scope: string };

export const textureId = (t: TextureRef, onDark: boolean) =>
  `${t.scope}-${t.kind}-${onDark ? "light" : "dark"}`;

const TEXTURES: Record<
  PlanTexture,
  {
    size: [number, number];
    /** 이 줌 아래에서는 안 보임, 두 배 줌에서 완전히 보임 */
    minScale: number;
    draw: (w: number) => ReactNode;
  }
> = {
  wood: {
    size: [60, 16],
    minScale: 0.3,
    draw: () => (
      <path d="M0 3Q15 1.5 30 3T60 3M0 9Q20 11 40 9T60 9M0 14Q10 13 30 14T60 14" />
    ),
  },
  fabric: {
    size: [8, 8],
    minScale: 0.6,
    draw: (w) => <circle cx={4} cy={4} r={w * 0.7} fill="currentColor" />,
  },
};

/** 가구 질감 패턴 정의 - 가구 로컬 좌표(cm)에서 반복 */
export function TextureDefs({
  scale,
  scope,
}: {
  scale: number;
  scope: string;
}) {
  const w = 1 / scale;
  return (
    <defs>
      {(Object.keys(TEXTURES) as PlanTexture[]).flatMap((t) => {
        const spec = TEXTURES[t];
        const fade = Math.min(
          1,
          Math.max(0, (scale - spec.minScale) / spec.minScale),
        );
        return [false, true].map((onDark) => (
          <pattern
            key={`${t}${onDark}`}
            id={textureId({ kind: t, scope }, onDark)}
            patternUnits="userSpaceOnUse"
            width={spec.size[0]}
            height={spec.size[1]}
          >
            <g
              color={onDark ? "#fff" : INK}
              stroke="currentColor"
              strokeWidth={w}
              fill="none"
              opacity={0.14 * fade}
            >
              {spec.draw(w)}
            </g>
          </pattern>
        ));
      })}
    </defs>
  );
}
