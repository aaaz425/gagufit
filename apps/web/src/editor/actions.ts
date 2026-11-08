import {
  addFurniture,
  addOpening,
  duplicateFurniture,
  snapRotation,
  type FurniturePreset,
  type Opening,
  type OpeningKind,
  type PlacedFurniture,
  type Room,
} from "@gagufit/core";
import { useEditor } from "./store";

// 가구 이동·회전·색·삭제, 문 경첩·방향 변경은 core 함수 없이 여기서
// core 편집 함수처럼 바뀐 게 없으면 같은 room을 돌려줌

function samePatch<T extends object>(target: T, patch: Partial<T>): boolean {
  return Object.entries(patch).every(([key, value]) => {
    const current = target[key as keyof T];
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(current) === JSON.stringify(value);
    }
    return Object.is(current, value);
  });
}

export function updateFurniture(
  room: Room,
  id: string,
  patch: Partial<Omit<PlacedFurniture, "id">>,
): Room {
  const source = room.furniture.find((f) => f.id === id);
  if (!source || samePatch(source, patch)) return room;
  return {
    ...room,
    furniture: room.furniture.map((f) =>
      f === source ? { ...f, ...patch } : f,
    ),
  };
}

export function updateOpening(
  room: Room,
  id: string,
  update: (o: Opening) => Opening,
): Room {
  const source = room.openings.find((o) => o.id === id);
  if (!source) return room;
  const next = update(source);
  if (samePatch(source, next) && samePatch(next, source)) return room;
  return {
    ...room,
    openings: room.openings.map((o) => (o === source ? next : o)),
  };
}

/** 화면 각도 - 시계 방향, 저장 값 rotation은 반시계 */
export const displayAngle = (rotation: number) => (360 - rotation) % 360;

/** 화면 각도 입력을 저장 값으로 - 0~359 정수 */
export const rotationFromDisplay = (deg: number) => snapRotation(-deg, 0);

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

/** 화면에서 시계 방향 90° */
export function rotateSelected90() {
  const sel = editor().selection;
  if (sel?.kind !== "furniture") return;
  const f = room().furniture.find((item) => item.id === sel.id);
  if (!f) return;
  editor().update(
    updateFurniture(room(), f.id, {
      rotation: rotationFromDisplay(displayAngle(f.rotation) + 90),
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
