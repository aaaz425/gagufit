import {
  furnitureCorners,
  type Room,
  type PlacedFurniture,
  type Opening,
  type Vec2,
} from "@gagufit/core";
import type { ScreenBox } from "../SelectionToolbar";
import { openingFrame, WALL_PX } from "./RoomPlan";
import { toScreen, type View } from "./view";

/** 선택 대상의 화면 상자와 문·창문 툴바 자리 */
export function selectionBox(
  room: Room,
  view: View | null,
  furniture: PlacedFurniture | undefined,
  opening: Opening | undefined,
): { box: ScreenBox | null; outside: Vec2 | null } {
  let box: ScreenBox | null = null;
  /** 문·창문 툴바 자리 - 벽 바깥쪽, 위치 가이드·열림 영역 반대편 */
  let outside: Vec2 | null = null;
  if (view && (furniture || opening)) {
    let pts: Vec2[] = [];
    if (furniture) {
      pts = furnitureCorners(furniture);
    } else if (opening) {
      const { left, right, n } = openingFrame(room, opening);
      pts = [left, right];
      const k = -(WALL_PX + 14 + 24) / view.scale;
      outside = toScreen(view, {
        x: (left.x + right.x) / 2 + n.x * k,
        y: (left.y + right.y) / 2 + n.y * k,
      });
    }
    const s = pts.map((p) => toScreen(view, p));
    if (s.length) {
      box = {
        minX: Math.min(...s.map((p) => p.x)),
        maxX: Math.max(...s.map((p) => p.x)),
        minY: Math.min(...s.map((p) => p.y)),
        maxY: Math.max(...s.map((p) => p.y)),
      };
    }
  }
  return { box, outside };
}
