// 길이 cm 정수, 각도 도 단위 정수 0~359
// 평면 Vec2 = three.js (x, 0, y) - 위에서 볼 때 x 오른쪽·y 아래

export type Vec2 = { x: number; y: number };

export type Size = { width: number; depth: number; height: number };

// 꼭짓점은 (0,0)부터 시계 방향, 벽 i = 꼭짓점 i → i+1 - 방 안에서 볼 때 꼭짓점 i가 왼쪽 끝
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
  /** 2D 도면 대표색 */
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
  /** 벽 왼쪽 끝부터 개구부 왼쪽 끝까지 */
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

/** floor는 러그 - 겹침·문 막힘 판정 제외 */
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
  /** three.js rotation.y와 같은 방향 - 위에서 볼 때 반시계 */
  rotation: number;
  /** 추가할 때 프리셋 크기 복사, 이후 따로 조절 */
  size: Size;
  color: FurnitureColorId;
};

export type Room = {
  name: string;
  width: number;
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
