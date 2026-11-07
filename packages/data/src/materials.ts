import type {
  FloorMaterial,
  FloorMaterialId,
  FurnitureColor,
  FurnitureColorId,
  WallMaterial,
  WallMaterialId,
} from "@gagufit/core";
import { withIds } from "./with-ids";

/** 견본 이미지 - web public 기준 상대 경로 */
const image = (id: string) => `materials/${id}.jpg`;

// color2d - 견본 평균색 색조 유지, 벽선(scene-wall) 대비 4.5 이상 되게 명도 보정
export const FLOOR_MATERIALS = withIds<
  FloorMaterialId,
  Omit<FloorMaterial, "id">
>({
  "floor-light-oak": {
    name: "밝은 마루",
    color2d: "#D8BA91",
    image: image("floor-light-oak"),
  },
  "floor-dark-walnut": {
    name: "진한 마루",
    color2d: "#C0A08B",
    image: image("floor-dark-walnut"),
  },
  "floor-grey-tile": {
    name: "회색 타일",
    color2d: "#A7A7A4",
    image: image("floor-grey-tile"),
  },
  "floor-white-tile": {
    name: "흰 타일",
    color2d: "#E1E1E1",
    image: image("floor-white-tile"),
  },
  "floor-vinyl": {
    name: "장판",
    color2d: "#D6C8B3",
    image: image("floor-vinyl"),
  },
  "floor-carpet": {
    name: "카펫",
    color2d: "#CAB9A3",
    image: image("floor-carpet"),
  },
});

export const WALL_MATERIALS = withIds<WallMaterialId, Omit<WallMaterial, "id">>(
  {
    "wall-white-paint": { name: "흰 페인트", image: image("wall-white-paint") },
    "wall-warm-beige": { name: "웜 베이지", image: image("wall-warm-beige") },
    "wall-light-grey": { name: "연회색", image: image("wall-light-grey") },
    "wall-silk": { name: "실크 도배", image: image("wall-silk") },
    "wall-stripe": { name: "줄무늬 도배", image: image("wall-stripe") },
    "wall-concrete": { name: "콘크리트", image: image("wall-concrete") },
  },
);

export const FURNITURE_COLORS = withIds<
  FurnitureColorId,
  Omit<FurnitureColor, "id">
>({
  white: { name: "화이트", hex: "#F4F2EE" },
  oak: { name: "오크", hex: "#C8A271" },
  walnut: { name: "월넛", hex: "#6B4A33" },
  grey: { name: "그레이", hex: "#9A9A98" },
  charcoal: { name: "차콜", hex: "#3F4146" },
  "beige-fabric": { name: "베이지 패브릭", hex: "#D9C8AE" },
  "green-fabric": { name: "그린 패브릭", hex: "#6F8B6A" },
});

export const DEFAULT_FLOOR_MATERIAL: FloorMaterialId = "floor-light-oak";
export const DEFAULT_WALL_MATERIAL: WallMaterialId = "wall-white-paint";
