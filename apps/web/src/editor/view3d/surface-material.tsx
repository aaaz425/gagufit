import type { FloorMaterialId, WallMaterialId } from "@gagufit/core";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";

type SurfaceId = FloorMaterialId | WallMaterialId;

/** 텍스처 한 장이 덮는 실제 크기 [가로, 세로] cm */
const TEXTURE_SIZE: Readonly<Record<SurfaceId, [number, number]>> = {
  "floor-light-oak": [130, 130],
  "floor-dark-walnut": [150, 150],
  "floor-grey-tile": [240, 240],
  "floor-white-tile": [150, 150],
  "floor-vinyl": [150, 150],
  "floor-carpet": [100, 100],
  "wall-white-paint": [200, 200],
  "wall-warm-beige": [200, 200],
  "wall-light-grey": [200, 200],
  "wall-silk": [100, 100],
  "wall-stripe": [100, 100],
  "wall-concrete": [110, 55],
};

const MAPS = ["color", "normal", "roughness"] as const;

export function textureUrls(id: SurfaceId, hiRes: boolean) {
  const suffix = hiRes ? "" : "-512";
  return MAPS.map((map) => `/textures/${id}/${map}${suffix}.jpg`);
}

function prepare(texture: Texture, id: SurfaceId, color: boolean) {
  const [w, h] = TEXTURE_SIZE[id];
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  // uv가 m 단위
  texture.repeat.set(100 / w, 100 / h);
  texture.anisotropy = 4;
  if (color) texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
}

/** 바닥·벽 PBR 재질 - 처음 쓸 때 텍스처를 받아 Suspense로 대기 */
export function useSurfaceMaterial(id: SurfaceId, hiRes: boolean) {
  const [map, normalMap, roughnessMap] = useTexture(textureUrls(id, hiRes));
  const material = useMemo(() => {
    prepare(map, id, true);
    prepare(normalMap, id, false);
    prepare(roughnessMap, id, false);
    return new MeshStandardMaterial({ map, normalMap, roughnessMap });
  }, [id, map, normalMap, roughnessMap]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}
