import type {
  FurnitureMaterial,
  FurniturePreset,
  PlacedFurniture,
} from "@gagufit/core";
import { FURNITURE_COLORS } from "@gagufit/data";
import { Outlines } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useMemo } from "react";
import {
  Color,
  CylinderGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { SCENE_COLORS } from "../scene-colors";
import { m, rad, sharedBox } from "./geometry";
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

function partGeometry(part: Part) {
  return part.shape === "disc" ? DISC : sharedBox(...part.size);
}

function partScale(part: Part): [number, number, number] {
  return part.shape === "disc"
    ? (part.size.map(m) as [number, number, number])
    : [1, 1, 1];
}

type Props = {
  furniture: PlacedFurniture;
  preset: FurniturePreset;
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
  const parts = useMemo(
    () => furnitureParts(preset.category, preset.size),
    [preset],
  );
  const dpr = useThree((s) => s.viewport.dpr);
  const hex = FURNITURE_COLORS[furniture.color].hex;
  const shadow = preset.layer !== "floor";
  return (
    <group
      position={[m(furniture.position.x), 0, m(furniture.position.y)]}
      rotation-y={rad(furniture.rotation)}
      onClick={(e) => onClick(e, furniture.id)}
    >
      {parts.map((part, i) => {
        const geometry = partGeometry(part);
        const scale = partScale(part);
        const position = part.center.map(m) as [number, number, number];
        return (
          <group key={i} position={position} scale={scale}>
            <mesh
              geometry={geometry}
              material={furnitureMaterial(preset.material, hex, part.tone)}
              castShadow={shadow}
              receiveShadow
            >
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
