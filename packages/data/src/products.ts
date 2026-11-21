import type {
  FurnitureColorId,
  FurniturePreset,
  Offer,
  Size,
} from "@gagufit/core";
import { FURNITURE_PRESETS, type PresetId } from "./presets";

// 실제 상품 추가 - RAW에 항목 하나 복사해 채우기
// - 키(id)는 저장 데이터에 남음 - 바꾸지 말 것, 기본 프리셋 id와 겹치면 안 됨
// - base 기본 프리셋 id - 분류·최소 크기·재질·기본색을 이어받음
// - 판매 종료돼도 항목은 지우지 말 것 - 배치된 방이 끊김, offers만 정리
// - offers 여럿이면 화면에는 첫 항목만 표시
// - size cm 정수, color 생략하면 base 기본색
// - offers 쿠팡 파트너스 화면에서 만든 링크, price 원 정수, checkedAt 가격 확인일 YYYY-MM-DD
type Product = {
  base: PresetId;
  name: string;
  size: Size;
  color?: FurnitureColorId;
  offers: [Offer, ...Offer[]];
};

const RAW = {
  "bed-gagutown-dw102-ss": {
    base: "bed-super-single",
    name: "가구타운 철제 DW102 슈퍼싱글 단층 침대",
    size: { width: 118, depth: 213, height: 87 },
    color: "charcoal",
    offers: [
      {
        url: "https://link.coupang.com/a/iRengjv68O",
        price: 209000,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "desk-rockyhomes-gaming-1200": {
    base: "desk-120",
    name: "락키홈즈 게이밍 컴퓨터 책상 1200",
    size: { width: 120, depth: 60, height: 74 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iRepDsNX6O",
        price: 45000,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "chair-chairclub-m2": {
    base: "chair",
    name: "체어클럽 M2 헤더형 메쉬의자",
    size: { width: 58, depth: 58, height: 107 },
    color: "charcoal",
    offers: [
      {
        url: "https://link.coupang.com/a/iRexAMD0DY",
        price: 44900,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "sofa-domo-poco-edge-2": {
    base: "sofa-2seat",
    name: "도모디자인 포코 엣지 2인 소파",
    size: { width: 146, depth: 84, height: 82 },
    color: "beige-fabric",
    offers: [
      {
        url: "https://link.coupang.com/a/iRerstbhF6",
        price: 169000,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "dining-samik-dale-2": {
    base: "dining-table-2",
    name: "삼익가구 데일 2인용 원목 식탁",
    size: { width: 85, depth: 65, height: 74 },
    color: "oak",
    offers: [
      {
        url: "https://link.coupang.com/a/iReAShdNTM",
        price: 69000,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "wardrobe-somssibang-simple": {
    base: "wardrobe-90",
    name: "솜씨방가구 심플장롱 투서랍장",
    size: { width: 81, depth: 58, height: 187 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReCPqgp2a",
        price: 104900,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "drawer-comet-slim-5": {
    base: "drawer-80",
    name: "코멧 국내생산 모던 슬림서랍장 5단",
    size: { width: 31, depth: 40, height: 98 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReGju4NTE",
        price: 20970,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "bookshelf-samik-teddy-1200-5": {
    base: "bookshelf-80",
    name: "삼익가구 테디 1200 5단 책장 A타입",
    size: { width: 120, depth: 28, height: 200 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iRejWCgToy",
        price: 62900,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "hanger-comet-basic-stand": {
    base: "hanger-100",
    name: "코멧 홈 베이직 스탠드 행거",
    size: { width: 105, depth: 37, height: 155 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iResVN8NzM",
        price: 11290,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "tv-stand-jd-remi-1200": {
    base: "tv-stand-150",
    name: "제이디퍼니처 레미 거실장",
    size: { width: 120, depth: 30, height: 30 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReHWqvVpk",
        price: 52500,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "nightstand-comet-basic-2": {
    base: "nightstand",
    name: "코멧 홈 베이직 2단 서랍 협탁",
    size: { width: 40, depth: 30, height: 41 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReLogn5JQ",
        price: 20890,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "dressing-apex-amitie-600": {
    base: "dressing-table",
    name: "apex 아미띠에 입식 화장대 600",
    size: { width: 60, depth: 40, height: 73 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReQezsRIy",
        price: 37630,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "fridge-lucoms-157l": {
    base: "fridge",
    name: "루컴즈 157L 2도어 냉장고",
    size: { width: 47, depth: 50, height: 144 },
    color: "white",
    offers: [
      {
        url: "https://link.coupang.com/a/iReRgI4Z9o",
        price: 274120,
        checkedAt: "2026-11-21",
      },
    ],
  },
  "rug-ongyeol-washable-200x400": {
    base: "rug-160",
    name: "온결 워셔블 단모 사각 러그 200x400",
    size: { width: 200, depth: 400, height: 1 },
    color: "beige-fabric",
    offers: [
      {
        url: "https://link.coupang.com/a/iReXm4MFAO",
        price: 118380,
        checkedAt: "2026-11-21",
      },
    ],
  },
} satisfies Record<string, Product>;

export const PRODUCTS: Readonly<Record<string, FurniturePreset>> =
  Object.fromEntries(
    Object.entries<Product>(RAW).map(([id, p]) => {
      const base = FURNITURE_PRESETS[p.base];
      const preset: FurniturePreset = {
        id,
        category: base.category,
        name: p.name,
        size: p.size,
        minSize: base.minSize,
        material: base.material,
        defaultColor: p.color ?? base.defaultColor,
        layer: base.layer,
        offers: p.offers,
      };
      return [id, preset];
    }),
  );

/** 기본 프리셋 + 실제 상품 - 배치된 가구의 presetId는 여기서 찾음 */
export const FURNITURE_CATALOG: Readonly<Record<string, FurniturePreset>> = {
  ...FURNITURE_PRESETS,
  ...PRODUCTS,
};
