import {
  checkRoom,
  history,
  type History,
  type Room,
  type Warning,
} from "@gagufit/core";
import {
  DEFAULT_FLOOR_MATERIAL,
  DEFAULT_WALL_MATERIAL,
  FURNITURE_PRESETS,
} from "@gagufit/data";
import { create } from "zustand";

export type Selection = { kind: "furniture" | "opening"; id: string } | null;

export type PanelTab = "furniture" | "room";

/** 모바일 바텀시트 - props는 선택 대상 전체 속성 */
export type Sheet = PanelTab | "props" | null;

export type Toast = { message: string; undo?: boolean };

type EditorState = {
  history: History<Room>;
  selection: Selection;
  view: "2d" | "3d";
  panel: PanelTab;
  sheet: Sheet;
  toast: Toast | null;
  /** 도면에서 끄는 중 - 실행 취소 막음 */
  dragging: boolean;

  load: (room: Room) => void;
  /** 기록 한 단계 */
  update: (next: Room) => void;
  /** 끌기 중 - 기록 안 함 */
  preview: (next: Room) => void;
  /** 끌기 끝 - before는 끌기 시작 때 room */
  commit: (before: Room) => void;
  undo: () => void;
  redo: () => void;
  select: (selection: Selection) => void;
  setView: (view: "2d" | "3d") => void;
  setPanel: (panel: PanelTab) => void;
  setSheet: (sheet: Sheet) => void;
  showToast: (toast: Toast | null) => void;
  setDragging: (dragging: boolean) => void;
};

export const useEditor = create<EditorState>()((set) => ({
  history: history.create<Room>(emptyRoom()),
  selection: null,
  view: "2d",
  panel: "furniture",
  sheet: null,
  toast: null,
  dragging: false,

  load: (room) =>
    set({
      history: history.create(room),
      selection: null,
      view: "2d",
      panel: "furniture",
      sheet: null,
      toast: null,
      dragging: false,
    }),
  // 바뀐 게 없으면 기록 안 함 - 편집 함수가 같은 room을 돌려줌
  // 새 편집이 생기면 삭제 토스트의 실행 취소 대상이 달라져 닫음
  update: (next) =>
    set((s) =>
      next === s.history.present
        ? {}
        : { history: history.push(s.history, next), toast: null },
    ),
  preview: (next) =>
    set((s) =>
      next === s.history.present
        ? {}
        : { history: history.replace(s.history, next) },
    ),
  commit: (before) =>
    set((s) =>
      before === s.history.present
        ? {}
        : { history: history.commit(s.history, before), toast: null },
    ),
  undo: () =>
    set((s) => {
      if (s.dragging) return {};
      const next = history.undo(s.history);
      return { history: next, selection: keepSelection(next.present, s) };
    }),
  redo: () =>
    set((s) => {
      if (s.dragging) return {};
      const next = history.redo(s.history);
      return { history: next, selection: keepSelection(next.present, s) };
    }),
  select: (selection) =>
    set((s) => ({
      selection,
      sheet: s.sheet === "props" && !selection ? null : s.sheet,
    })),
  setView: (view) => set({ view }),
  setPanel: (panel) => set({ panel }),
  setSheet: (sheet) => set({ sheet }),
  showToast: (toast) => set({ toast }),
  setDragging: (dragging) => set({ dragging }),
}));

/** 되돌린 뒤 없는 대상이면 선택 해제 */
function keepSelection(room: Room, s: EditorState): Selection {
  const sel = s.selection;
  if (!sel) return null;
  const list = sel.kind === "furniture" ? room.furniture : room.openings;
  return list.some((item) => item.id === sel.id) ? sel : null;
}

function emptyRoom(): Room {
  return {
    name: "",
    width: 1,
    depth: 1,
    height: 1,
    floorMaterial: DEFAULT_FLOOR_MATERIAL,
    wallMaterial: DEFAULT_WALL_MATERIAL,
    openings: [],
    furniture: [],
  };
}

export const useRoom = () => useEditor((s) => s.history.present);

const warningCache = new WeakMap<Room, Warning[]>();

/** room 객체별로 한 번만 판정 */
export function warningsOf(room: Room): Warning[] {
  let warnings = warningCache.get(room);
  if (!warnings) {
    warnings = checkRoom(room, FURNITURE_PRESETS);
    warningCache.set(room, warnings);
  }
  return warnings;
}

const warnedIdsCache = new WeakMap<Room, ReadonlySet<string>>();

/** 경고에 걸린 가구 id */
export function warnedFurnitureIds(room: Room): ReadonlySet<string> {
  let ids = warnedIdsCache.get(room);
  if (!ids) {
    ids = new Set(
      warningsOf(room).flatMap((w) =>
        w.type === "overlap" ? w.furnitureIds : [w.furnitureId],
      ),
    );
    warnedIdsCache.set(room, ids);
  }
  return ids;
}
