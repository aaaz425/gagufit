import type {
  FurnitureMaterial,
  FurniturePreset,
  PlacedFurniture,
} from "@gagufit/core";
import { FURNITURE_COLORS } from "@gagufit/data";
import { Outlines, useCursor } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useMemo, useState } from "react";
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  EdgesGeometry,
  LineBasicMaterial,
  LinearFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RGBAFormat,
  type BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
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

// 윤곽선은 후처리 노멀 패스에 안 섞이게 Line으로 그림
const EDGE_MATERIAL = new LineBasicMaterial({ color: SCENE_COLORS.inkMuted });

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
  if (part.shape === "disc") return DISC;
  const [w, h, d] = part.size.map(m);
  // 둥근 모서리 - 조각이 작아도 면 수가 늘지 않게 분할 2
  return part.round > 0
    ? new RoundedBoxGeometry(w, h, d, 2, m(part.round))
    : new BoxGeometry(w, h, d);
}

/** 윤곽선은 각진 상자 모서리 기준 - 손잡이처럼 작은 조각은 생략 */
function partEdges(part: Part): BufferGeometry | null {
  if (part.shape === "disc" || Math.min(...part.size) < 2.5) return null;
  const box = new BoxGeometry(
    ...(part.size.map(m) as [number, number, number]),
  );
  const edges = new EdgesGeometry(box, 20);
  box.dispose();
  return edges;
}

/** 접지 그림자 테두리 폭 cm */
const CONTACT_MARGIN = 14;

let contactTexture: DataTexture | undefined;
/**
 * 가장자리에서 중심으로 부드럽게 짙어지는 알파 - 아홉 조각으로 늘려 쓰므로
 * 모서리 칸(0~0.5)만 그라데이션이고 가운데 칸은 한 점으로 모임
 */
function getContactTexture() {
  if (!contactTexture) {
    const n = 32;
    const data = new Uint8Array(n * n * 4);
    const fade = (i: number) => {
      const t = Math.min(i + 0.5, n - i - 0.5) / (n / 2);
      return t * t * (3 - 2 * t);
    };
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++)
        data[(y * n + x) * 4 + 3] = Math.round(255 * fade(x) * fade(y));
    contactTexture = new DataTexture(data, n, n, RGBAFormat);
    contactTexture.magFilter = LinearFilter;
    contactTexture.minFilter = LinearFilter;
    contactTexture.needsUpdate = true;
  }
  return contactTexture;
}

// 진짜 그림자를 켜면 접지 그림자는 옅게
const CONTACT_MATERIALS = new Map<boolean, MeshBasicMaterial>();
function contactMaterial(realShadows: boolean) {
  let material = CONTACT_MATERIALS.get(realShadows);
  if (!material) {
    material = new MeshBasicMaterial({
      color: "black",
      map: getContactTexture(),
      transparent: true,
      opacity: realShadows ? 0.18 : 0.38,
      depthWrite: false,
      toneMapped: false,
    });
    CONTACT_MATERIALS.set(realShadows, material);
  }
  return material;
}

/** 가구 발자국 둘레로 번지는 바닥 판 - 아홉 조각 uv */
function contactGeometry(w: number, d: number) {
  const g = new PlaneGeometry(1, 1, 3, 3);
  const xs = [-w / 2 - CONTACT_MARGIN, -w / 2, w / 2, w / 2 + CONTACT_MARGIN];
  const zs = [-d / 2 - CONTACT_MARGIN, -d / 2, d / 2, d / 2 + CONTACT_MARGIN];
  const us = [0, 0.5, 0.5, 1];
  const pos = g.getAttribute("position");
  const uv = g.getAttribute("uv");
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 4; i++) {
      const k = j * 4 + i;
      pos.setXYZ(k, m(xs[i]), -m(zs[j]), 0);
      uv.setXY(k, us[i], 1 - us[j]);
    }
  g.rotateX(-Math.PI / 2);
  return g;
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
  /** 진짜 그림자를 켰는지 - 접지 그림자 농도만 달라짐 */
  realShadows: boolean;
  onClick: (e: ThreeEvent<MouseEvent>, id: string) => void;
};

export const FurnitureMesh = memo(function FurnitureMesh({
  furniture,
  preset,
  selected,
  warning,
  realShadows,
  onClick,
}: Props) {
  const look = preset ?? FALLBACK_LOOK;
  const { width, depth, height } = furniture.size;
  // 크기는 배치 가구마다 따로 - 크기 조절 중 지오메트리가 쌓이지 않게 바뀌면 정리
  const parts = useMemo(() => {
    const list = furnitureParts(look.category, { width, depth, height });
    return list.map((part) => ({
      part,
      geometry: partGeometry(part),
      edges: partEdges(part),
    }));
  }, [look.category, width, depth, height]);
  const contact = useMemo(() => contactGeometry(width, depth), [width, depth]);
  useEffect(() => () => contact.dispose(), [contact]);
  useEffect(
    () => () => {
      for (const { geometry, edges } of parts) {
        if (geometry !== DISC) geometry.dispose();
        edges?.dispose();
      }
    },
    [parts],
  );
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const dpr = useThree((s) => s.viewport.dpr);
  const hex = FURNITURE_COLORS[furniture.color].hex;
  const layer = look.layer;
  const shadow = layer !== "floor";
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
      {layer !== "floor" && (
        <mesh
          geometry={contact}
          material={contactMaterial(realShadows)}
          position-y={0.002}
          renderOrder={1}
          // 클릭이 가구 뒤 바닥으로 가게 막지 않음
          raycast={() => null}
        />
      )}
      {parts.map(({ part, geometry, edges }, i) => {
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
              {selected && (
                <Outlines
                  thickness={SELECTION_PX * dpr}
                  // 2D와 같이 경고 우선
                  color={warning ? SCENE_COLORS.danger : SCENE_COLORS.primary}
                />
              )}
            </mesh>
            {/* 그림자·후처리를 꺼도 가구끼리·바닥과 구분되는 윤곽선 */}
            {edges && (
              <lineSegments geometry={edges} material={EDGE_MATERIAL} />
            )}
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
