import type {
  FurnitureMaterial,
  FurniturePreset,
  PlacedFurniture,
} from "@gagufit/core";
import { FURNITURE_COLORS } from "@gagufit/data";
import { Edges, Outlines, useCursor } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useMemo, useState } from "react";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { SCENE_COLORS } from "../scene-colors";
import { m, rad } from "./geometry";
import { furnitureParts, type Part, type PartTone } from "./furniture-parts";

const SURFACE: Readonly<
  Record<FurnitureMaterial, { roughness: number; metalness: number }>
> = {
  wood: { roughness: 0.6, metalness: 0 },
  fabric: { roughness: 0.95, metalness: 0 },
  appliance: { roughness: 0.3, metalness: 0.1 },
};

/** 선택 외곽선 CSS px - drei Outlines 기본 모드는 그리기 버퍼 px */
const SELECTION_PX = 3;

const materialCache = new Map<string, MeshStandardMaterial>();

/** 재질·색·톤 조합마다 하나 - 가구끼리 공유 */
function furnitureMaterial(
  kind: FurnitureMaterial,
  hex: string,
  tone: PartTone,
) {
  const key = `${kind}:${hex}:${tone}`;
  let material = materialCache.get(key);
  if (!material) {
    const color =
      tone === "light"
        ? new Color(FURNITURE_COLORS.white.hex)
        : new Color(hex).multiplyScalar(tone === "line" ? 0.7 : 1);
    material = new MeshStandardMaterial({
      color,
      ...SURFACE[tone === "light" ? "fabric" : kind],
    });
    materialCache.set(key, material);
  }
  return material;
}

/** 원기둥을 앞쪽으로 눕힌 지름 1·두께 1 기준 - 세탁기 문 */
const DISC = new CylinderGeometry(0.5, 0.5, 1, 32).rotateX(Math.PI / 2);

const WARNING_MATERIAL = new MeshBasicMaterial({
  color: SCENE_COLORS.danger,
  transparent: true,
  opacity: 0.4,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -1,
  polygonOffsetUnits: -1,
});

/** 프리셋이 없는 가구 - core 판정과 같이 일반 가구로 보고 상자로 그림 */
const FALLBACK_LOOK: Pick<FurniturePreset, "category" | "material" | "layer"> =
  {
    category: "etc",
    material: "wood",
    layer: "normal",
  };

function partGeometry(part: Part) {
  return part.shape === "disc"
    ? DISC
    : new BoxGeometry(...(part.size.map(m) as [number, number, number]));
}

function partScale(part: Part): [number, number, number] {
  return part.shape === "disc"
    ? (part.size.map(m) as [number, number, number])
    : [1, 1, 1];
}

type Props = {
  furniture: PlacedFurniture;
  /** 없으면 기본 상자 */
  preset: FurniturePreset | undefined;
  selected: boolean;
  warning: boolean;
  onClick: (e: ThreeEvent<MouseEvent>, id: string) => void;
};

export const FurnitureMesh = memo(function FurnitureMesh({
  furniture,
  preset,
  selected,
  warning,
  onClick,
}: Props) {
  const look = preset ?? FALLBACK_LOOK;
  const { width, depth, height } = furniture.size;
  // 크기는 배치 가구마다 따로 - 크기 조절 중 지오메트리가 쌓이지 않게 바뀌면 정리
  const parts = useMemo(() => {
    const list = furnitureParts(look.category, { width, depth, height });
    return list.map((part) => ({ part, geometry: partGeometry(part) }));
  }, [look.category, width, depth, height]);
  useEffect(
    () => () => {
      for (const { geometry } of parts)
        if (geometry !== DISC) geometry.dispose();
    },
    [parts],
  );
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const dpr = useThree((s) => s.viewport.dpr);
  const hex = FURNITURE_COLORS[furniture.color].hex;
  const shadow = look.layer !== "floor";
  return (
    <group
      position={[m(furniture.position.x), 0, m(furniture.position.y)]}
      rotation-y={rad(furniture.rotation)}
      onClick={(e) => onClick(e, furniture.id)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {parts.map(({ part, geometry }, i) => {
        const scale = partScale(part);
        const position = part.center.map(m) as [number, number, number];
        return (
          <group key={i} position={position} scale={scale}>
            <mesh
              geometry={geometry}
              material={furnitureMaterial(look.material, hex, part.tone)}
              castShadow={shadow}
              receiveShadow
            >
              {/* 그림자·후처리를 꺼도 가구끼리·바닥과 구분되는 윤곽선 */}
              <Edges threshold={20} color={SCENE_COLORS.wall} />
              {selected && (
                <Outlines
                  thickness={SELECTION_PX * dpr}
                  // 2D와 같이 경고 우선
                  color={warning ? SCENE_COLORS.danger : SCENE_COLORS.primary}
                />
              )}
            </mesh>
            {warning && (
              <mesh
                geometry={geometry}
                material={WARNING_MATERIAL}
                renderOrder={2}
              />
            )}
          </group>
        );
      })}
    </group>
  );
});
