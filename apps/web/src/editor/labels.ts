import type {
  FurnitureCategory,
  Opening,
  OpeningKind,
  Room,
  Warning,
} from "@gagufit/core";
import { FURNITURE_PRESETS } from "@gagufit/data";

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  bed: "침대",
  desk: "책상",
  chair: "의자",
  sofa: "소파",
  "dining-table": "식탁",
  wardrobe: "옷장",
  drawer: "서랍장",
  bookshelf: "책장",
  hanger: "행거",
  "tv-stand": "TV장",
  nightstand: "협탁",
  "dressing-table": "화장대",
  fridge: "냉장고",
  washer: "세탁기",
  rug: "러그",
  etc: "기타",
};

/** 가구 패널 칩 - 처음 항목이 기본 */
export const CATEGORY_GROUPS: {
  label: string;
  categories?: FurnitureCategory[];
}[] = [
  { label: "전체" },
  { label: "침대", categories: ["bed", "nightstand"] },
  { label: "책상", categories: ["desk", "chair", "dressing-table"] },
  { label: "수납", categories: ["wardrobe", "drawer", "bookshelf", "hanger"] },
  { label: "소파", categories: ["sofa", "tv-stand", "rug"] },
  { label: "식탁", categories: ["dining-table"] },
  { label: "가전", categories: ["fridge", "washer"] },
  { label: "기타", categories: ["etc"] },
];

export const OPENING_LABELS: Record<OpeningKind, string> = {
  hinged: "여닫이 문",
  sliding: "미닫이 문",
  window: "창문",
};

/** 벽 번호 순서 - 위·오른쪽·아래·왼쪽 */
const WALL_LABELS = ["위쪽 벽", "오른쪽 벽", "아래쪽 벽", "왼쪽 벽"];

export const wallLabel = (wall: number) =>
  WALL_LABELS[wall] ?? `벽 ${wall + 1}`;

export function openingSummary(o: Opening): string {
  const kind =
    o.kind === "hinged" ? "여닫이" : o.kind === "sliding" ? "미닫이" : null;
  return [kind, wallLabel(o.wall), `${o.width} cm`].filter(Boolean).join(" · ");
}

/** 받침 있으면 first, 없으면 second */
function josa(word: string, first: string, second: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}${second}`;
  return `${word}${code % 28 ? first : second}`;
}

function furnitureName(room: Room, id: string): string {
  const f = room.furniture.find((item) => item.id === id);
  return (f && FURNITURE_PRESETS[f.presetId]?.name) ?? "가구";
}

/** 경고를 보는 가구 입장의 한 줄 - id는 경고에 걸린 가구 */
export function warningText(room: Room, w: Warning, id: string): string {
  if (w.type === "overlap") {
    const other =
      w.furnitureIds[0] === id ? w.furnitureIds[1] : w.furnitureIds[0];
    return `${josa(furnitureName(room, id), "이", "가")} ${josa(
      furnitureName(room, other),
      "과",
      "와",
    )} 겹쳐요`;
  }
  if (w.type === "frontBlocked") {
    return `${furnitureName(room, id)} 앞쪽이 벽에 막혀 있어요`;
  }
  if (w.type === "outOfRoom") {
    return `${josa(furnitureName(room, id), "이", "가")} 방 밖으로 나갔어요`;
  }
  const door = room.openings.find((o) => o.id === w.openingId);
  const where =
    door?.kind === "hinged" && door.swing === "in"
      ? "문 열리는 자리를"
      : "문 앞 통로를";
  return `${josa(furnitureName(room, w.furnitureId), "이", "가")} ${where} 막아요`;
}

const WARNING_BADGE: Record<Warning["type"], string> = {
  overlap: "겹침",
  outOfRoom: "벽 밖",
  doorBlocked: "문 막힘",
  frontBlocked: "앞 막힘",
};

/** caution은 약한 경고 - 표시만 덜 강조 */
export type WarningTone = "danger" | "caution";

export const WARNING_TONE: Record<Warning["type"], WarningTone> = {
  overlap: "danger",
  outOfRoom: "danger",
  doorBlocked: "danger",
  frontBlocked: "caution",
};

/** 강한 경고가 하나라도 있으면 danger */
export function strongestTone(warnings: readonly Warning[]): WarningTone {
  return warnings.some((w) => WARNING_TONE[w.type] === "danger")
    ? "danger"
    : "caution";
}

/** 상단 경고 배지 - 종류가 하나면 그 이름 */
export function warningBadgeLabel(warnings: Warning[]): string {
  const types = new Set(warnings.map((w) => w.type));
  const name = types.size === 1 ? WARNING_BADGE[warnings[0].type] : "경고";
  return `${name} ${warnings.length}`;
}
