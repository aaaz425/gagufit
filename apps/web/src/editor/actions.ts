import {
  addFurniture,
  clampPosition,
  addOpening,
  duplicateFurniture,
  snapRotation,
  updateFurniture,
  type FurniturePreset,
  type OpeningKind,
  type Room,
} from "@gagufit/core";
import { screenDeltaToRoom } from "./plan/view";
import { currentRoom, useEditor } from "./store";

/** 화면 각도 - 시계 방향, 저장 값 rotation은 반시계 */
export const displayAngle = (rotation: number) => (360 - rotation) % 360;

/** 화면 각도 입력을 저장 값으로 - 0~359 정수 */
export const rotationFromDisplay = (deg: number) => snapRotation(-deg, 0);

const editor = () => useEditor.getState();

export function addPresetToRoom(preset: FurniturePreset) {
  const id = crypto.randomUUID();
  editor().update(addFurniture(currentRoom(), preset, id));
  editor().select({ kind: "furniture", id });
}

export function addOpeningToRoom(kind: OpeningKind) {
  const id = crypto.randomUUID();
  const next = addOpening(currentRoom(), kind, id);
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
  const f = currentRoom().furniture.find((item) => item.id === sel.id);
  if (!f) return;
  editor().update(
    updateFurniture(currentRoom(), f.id, {
      rotation: rotationFromDisplay(displayAngle(f.rotation) + 90),
    }),
  );
}

export function duplicateSelected() {
  const sel = editor().selection;
  if (sel?.kind !== "furniture") return;
  const id = crypto.randomUUID();
  editor().update(duplicateFurniture(currentRoom(), sel.id, id));
  editor().select({ kind: "furniture", id });
}

export function deleteSelected() {
  const sel = editor().selection;
  if (!sel) return;
  const r = currentRoom();
  editor().update(
    sel.kind === "furniture"
      ? { ...r, furniture: r.furniture.filter((f) => f.id !== sel.id) }
      : { ...r, openings: r.openings.filter((o) => o.id !== sel.id) },
  );
  editor().select(null);
  editor().showToast({ message: "삭제했어요", undo: true });
}

/** 마지막 방향키 이동 - 같은 가구를 그 결과 위에서 이어 움직일 때만 기록에 합침 */
let last: { room: Room; id: string; at: number } | null = null;
const NUDGE_MERGE_MS = 600;

/** 선택 가구를 화면에서 보이는 방향으로 옮김 - dx·dy cm, 오른쪽·아래가 양수 */
export function nudgeSelected(dx: number, dy: number) {
  const sel = editor().selection;
  if (sel?.kind !== "furniture") return;
  const r = currentRoom();
  const f = r.furniture.find((item) => item.id === sel.id);
  if (!f) return;
  const d = screenDeltaToRoom(editor().planAngle, { x: dx, y: dy });
  const position = clampPosition(r, {
    x: f.position.x + d.x,
    y: f.position.y + d.y,
  });
  const next = updateFurniture(r, f.id, { position });
  const now = Date.now();
  const merge =
    last !== null &&
    last.room === r &&
    last.id === f.id &&
    now - last.at < NUDGE_MERGE_MS;
  editor().nudge(next, merge);
  if (next !== r) last = { room: next, id: f.id, at: now };
}

/** Alt 끌기 - 제자리에 복사본을 만들어 선택하고 id를 돌려줌, 기록은 끌기 끝의 commit이 한 번에 */
export function startCopyDrag(id: string): string | null {
  const r = currentRoom();
  if (!r.furniture.some((f) => f.id === id)) return null;
  const copyId = crypto.randomUUID();
  editor().preview(duplicateFurniture(r, id, copyId, 0));
  editor().select({ kind: "furniture", id: copyId });
  return copyId;
}
