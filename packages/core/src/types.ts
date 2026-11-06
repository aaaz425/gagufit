// 길이는 모두 cm 정수, 각도는 도 단위 정수 0~359

/** 평면 좌표 - three.js (x, 0, y), 위에서 본 평면에서 x 오른쪽·y 아래쪽 */
export type Vec2 = { x: number; y: number };

export type Size = { width: number; depth: number; height: number };

/**
 * 벽 번호 - 벽 i = 꼭짓점 i → i+1 (마지막 벽은 마지막 꼭짓점 → 0)
 * - 꼭짓점은 위에서 본 평면 왼쪽 위 (0,0)부터 시계 방향
 * - 방 안에서 벽을 볼 때 왼쪽 끝이 꼭짓점 i
 * - 직사각형은 0 위, 1 오른쪽, 2 아래, 3 왼쪽 - 다각형도 같은 규칙
 */
export type WallIndex = number;

export type FloorMaterialId =
  | "floor-light-oak"
  | "floor-dark-walnut"
  | "floor-grey-tile"
  | "floor-white-tile"
  | "floor-vinyl"
  | "floor-carpet";

export type WallMaterialId =
  | "wall-white-paint"
  | "wall-warm-beige"
  | "wall-light-grey"
  | "wall-silk"
  | "wall-stripe"
  | "wall-concrete";

export type FurnitureColorId =
  | "white"
  | "oak"
  | "walnut"
  | "grey"
  | "charcoal"
  | "beige-fabric"
  | "green-fabric";

export type FloorMaterial = {
  id: FloorMaterialId;
  name: string;
  /** 2D 도면 바닥 대표색 hex */
  color2d: string;
  image: string;
};

export type WallMaterial = { id: WallMaterialId; name: string; image: string };

export type FurnitureColor = {
  id: FurnitureColorId;
  name: string;
  hex: string;
};

type OpeningBase = {
  id: string;
  wall: WallIndex;
  /** 방 안에서 벽을 볼 때 벽 왼쪽 끝부터 개구부 왼쪽 끝까지 */
  offset: number;
  width: number;
  height: number;
  /** 바닥에서 개구부 아래까지 */
  sill: number;
};

export type HingedDoor = OpeningBase & {
  kind: "hinged";
  /** 방 안에서 볼 때 경첩 쪽 */
  hinge: "left" | "right";
  swing: "in" | "out";
};

export type SlidingDoor = OpeningBase & { kind: "sliding" };

export type WindowOpening = OpeningBase & { kind: "window" };

export type Opening = HingedDoor | SlidingDoor | WindowOpening;

export type OpeningKind = Opening["kind"];

export type FurnitureCategory =
  | "bed"
  | "desk"
  | "chair"
  | "sofa"
  | "dining-table"
  | "wardrobe"
  | "drawer"
  | "bookshelf"
  | "hanger"
  | "tv-stand"
  | "nightstand"
  | "dressing-table"
  | "fridge"
  | "washer"
  | "rug"
  | "etc";

export type FurnitureMaterial = "wood" | "fabric" | "appliance";

/** floor - 바닥에 까는 가구(러그), 겹침·문 막힘 판정 제외 */
export type FurnitureLayer = "floor" | "normal";

export type FurniturePreset = {
  id: string;
  category: FurnitureCategory;
  name: string;
  /** 회전 0일 때 width는 x, depth는 y 방향 */
  size: Size;
  material: FurnitureMaterial;
  defaultColor: FurnitureColorId;
  layer: FurnitureLayer;
};

export type PlacedFurniture = {
  id: string;
  presetId: string;
  /** 바닥 면 중심 */
  position: Vec2;
  /** three.js rotation.y를 도로 - 위에서 본 평면에서 반시계 방향 */
  rotation: number;
  color: FurnitureColorId;
};

export type Room = {
  name: string;
  /** x 방향 */
  width: number;
  /** y 방향 */
  depth: number;
  /** 층고 */
  height: number;
  floorMaterial: FloorMaterialId;
  wallMaterial: WallMaterialId;
  openings: Opening[];
  furniture: PlacedFurniture[];
};

export type Warning =
  | { type: "overlap"; furnitureIds: [string, string] }
  | { type: "outOfRoom"; furnitureId: string }
  | { type: "doorBlocked"; openingId: string; furnitureId: string };
