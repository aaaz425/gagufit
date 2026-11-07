import {
  addFurniture,
  addOpening,
  duplicateFurniture,
  snapRotation,
  wallSegment,
  type FurniturePreset,
  type Opening,
  type OpeningKind,
  type PlacedFurniture,
  type Room,
} from "@gagufit/core";
import { useEditor } from "./store";

// 가구 이동·회전·색·삭제, 문 속성 변경은 core 함수 없이 여기서

export function updateFurniture(
  room: Room,
  id: string,
  patch: Partial<Omit<PlacedFurniture, "id">>,
): Room {
  return {
    ...room,
    furniture: room.furniture.map((f) =>
      f.id === id ? { ...f, ...patch } : f,
    ),
  };
}

export function updateOpening(
  room: Room,
  id: string,
  update: (o: Opening) => Opening,
): Room {
  return {
    ...room,
    openings: room.openings.map((o) => (o.id === id ? update(o) : o)),
  };
}

export function wallLength(room: Room, wall: number): number {
  const { start, end } = wallSegment(room, wall);
  return Math.hypot(end.x - start.x, end.y - start.y);
}

/** 여닫이 ↔ 미닫이 - 창문은 그대로 */
export function setDoorKind(o: Opening, kind: "hinged" | "sliding"): Opening {
  if (o.kind === kind || o.kind === "window") return o;
  const { id, wall, offset, width, height, sill } = o;
  const base = { id, wall, offset, width, height, sill };
  return kind === "hinged"
    ? { ...base, kind, hinge: "left", swing: "in" }
    : { ...base, kind };
}

const editor = () => useEditor.getState();
const room = () => editor().history.present;

export function addPresetToRoom(preset: FurniturePreset) {
  const id = crypto.randomUUID();
  editor().update(addFurniture(room(), preset, id));
  editor().select({ kind: "furniture", id });
}

export function addOpeningToRoom(kind: OpeningKind) {
  const id = crypto.randomUUID();
  const next = addOpening(room(), kind, id);
  if (!next) {
    editor().showToast({ message: "빈 벽이 없어 추가하지 못했어요" });
    return;
  }
  editor().update(next);
  editor().select({ kind: "opening", id });
}

export function rotateSelected90() {
  const sel = editor().selection;
  if (sel?.kind !== "furniture") return;
  const f = room().furniture.find((item) => item.id === sel.id);
  if (!f) return;
  // 화면 기준 시계 방향 - rotation은 반시계
  editor().update(
    updateFurniture(room(), f.id, {
      rotation: snapRotation(f.rotation - 90, 0),
    }),
  );
}

export function duplicateSelected() {
  const sel = editor().selection;
  if (sel?.kind !== "furniture") return;
  const id = crypto.randomUUID();
  editor().update(duplicateFurniture(room(), sel.id, id));
  editor().select({ kind: "furniture", id });
}

export function deleteSelected() {
  const sel = editor().selection;
  if (!sel) return;
  const r = room();
  editor().update(
    sel.kind === "furniture"
      ? { ...r, furniture: r.furniture.filter((f) => f.id !== sel.id) }
      : { ...r, openings: r.openings.filter((o) => o.id !== sel.id) },
  );
  editor().select(null);
  editor().showToast({ message: "삭제했어요", undo: true });
}
