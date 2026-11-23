import type { Room } from "./types";

export const CURRENT_SCHEMA_VERSION = 2;

export type SavedRoom = {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  room: Room;
};

// v1 당시 실제 상품 id → 기본 프리셋 id·이름 - 당시 값 기록, 바꾸지 말 것
const V1_PRODUCTS: Record<string, { base: string; name: string }> = {
  "bed-gagutown-dw102-ss": {
    base: "bed-super-single",
    name: "가구타운 철제 DW102 슈퍼싱글 단층 침대",
  },
  "desk-rockyhomes-gaming-1200": {
    base: "desk-120",
    name: "락키홈즈 게이밍 컴퓨터 책상 1200",
  },
  "chair-chairclub-m2": { base: "chair", name: "체어클럽 M2 헤더형 메쉬의자" },
  "sofa-domo-poco-edge-2": {
    base: "sofa-2seat",
    name: "도모디자인 포코 엣지 2인 소파",
  },
  "dining-samik-dale-2": {
    base: "dining-table-2",
    name: "삼익가구 데일 2인용 원목 식탁",
  },
  "wardrobe-somssibang-simple": {
    base: "wardrobe-90",
    name: "솜씨방가구 심플장롱 투서랍장",
  },
  "drawer-comet-slim-5": {
    base: "drawer-80",
    name: "코멧 국내생산 모던 슬림서랍장 5단",
  },
  "bookshelf-samik-teddy-1200-5": {
    base: "bookshelf-80",
    name: "삼익가구 테디 1200 5단 책장 A타입",
  },
  "hanger-comet-basic-stand": {
    base: "hanger-100",
    name: "코멧 홈 베이직 스탠드 행거",
  },
  "tv-stand-jd-remi-1200": {
    base: "tv-stand-150",
    name: "제이디퍼니처 레미 거실장",
  },
  "nightstand-comet-basic-2": {
    base: "nightstand",
    name: "코멧 홈 베이직 2단 서랍 협탁",
  },
  "dressing-apex-amitie-600": {
    base: "dressing-table",
    name: "apex 아미띠에 입식 화장대 600",
  },
  "fridge-lucoms-157l": { base: "fridge", name: "루컴즈 157L 2도어 냉장고" },
  "washer-samsung-wa16cg6441by": {
    base: "washer",
    name: "삼성전자 그랑데 통버블 세탁기 16kg",
  },
  "rug-ongyeol-washable-200x400": {
    base: "rug-160",
    name: "온결 워셔블 단모 사각 러그 200x400",
  },
};

// 키 = 변환 전 버전, 바로 다음 버전으로만 변환 - 버전 올릴 때 case 하나 추가
const STEPS: Record<number, (room: Room) => Room> = {
  1: (room) => ({
    ...room,
    furniture: room.furniture.map((f) => {
      if (!Object.hasOwn(V1_PRODUCTS, f.presetId)) return f;
      const { base, name } = V1_PRODUCTS[f.presetId];
      return { ...f, presetId: base, product: { id: f.presetId, name } };
    }),
  }),
};

export function migrate(data: unknown): SavedRoom {
  if (!isObject(data)) throw new Error("저장 데이터가 객체가 아님");
  const version = data.schemaVersion;
  if (
    typeof version !== "number" ||
    (!Object.hasOwn(STEPS, version) && version !== CURRENT_SCHEMA_VERSION)
  ) {
    throw new Error(`지원하지 않는 schemaVersion: ${JSON.stringify(version)}`);
  }
  if (!isRoom(data.room)) throw new Error(`v${version} 방 형식이 아님`);
  let room = data.room;
  for (let v = version; v < CURRENT_SCHEMA_VERSION; v++) room = STEPS[v](room);
  return { schemaVersion: CURRENT_SCHEMA_VERSION, room };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

const isInt = (v: unknown, min = -Infinity, max = Infinity) =>
  Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

const isPositiveInt = (v: unknown) => isInt(v, 1);

// v1·v2 공통 - v2에만 가구의 product가 있음
function isRoom(v: unknown): v is Room {
  return (
    isObject(v) &&
    typeof v.name === "string" &&
    isPositiveInt(v.width) &&
    isPositiveInt(v.depth) &&
    isPositiveInt(v.height) &&
    typeof v.floorMaterial === "string" &&
    typeof v.wallMaterial === "string" &&
    Array.isArray(v.openings) &&
    v.openings.every(isOpening) &&
    Array.isArray(v.furniture) &&
    v.furniture.every(isFurniture)
  );
}

function isOpening(v: unknown): boolean {
  if (
    !isObject(v) ||
    typeof v.id !== "string" ||
    !isInt(v.wall, 0, 3) ||
    !isInt(v.offset, 0) ||
    !isPositiveInt(v.width) ||
    !isPositiveInt(v.height) ||
    !isInt(v.sill, 0)
  ) {
    return false;
  }
  if (v.kind === "hinged") {
    return (
      (v.hinge === "left" || v.hinge === "right") &&
      (v.swing === "in" || v.swing === "out")
    );
  }
  return v.kind === "sliding" || v.kind === "window";
}

function isFurniture(v: unknown): boolean {
  return (
    isObject(v) &&
    typeof v.id === "string" &&
    typeof v.presetId === "string" &&
    isObject(v.position) &&
    isInt(v.position.x) &&
    isInt(v.position.y) &&
    isInt(v.rotation, 0, 359) &&
    isObject(v.size) &&
    isPositiveInt(v.size.width) &&
    isPositiveInt(v.size.depth) &&
    isPositiveInt(v.size.height) &&
    typeof v.color === "string" &&
    (v.product === undefined ||
      (isObject(v.product) &&
        typeof v.product.id === "string" &&
        typeof v.product.name === "string"))
  );
}
