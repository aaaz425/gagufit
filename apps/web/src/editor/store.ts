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
};

export const useEditor = create<EditorState>()((set) => ({
  history: history.create<Room>(emptyRoom()),
  selection: null,
  view: "2d",
  panel: "furniture",
  sheet: null,
  toast: null,

  load: (room) =>
    set({
      history: history.create(room),
      selection: null,
      view: "2d",
      panel: "furniture",
      sheet: null,
      toast: null,
    }),
  update: (next) => set((s) => ({ history: history.push(s.history, next) })),
  preview: (next) =>
    set((s) => ({ history: history.replace(s.history, next) })),
  commit: (before) =>
    set((s) => ({ history: history.commit(s.history, before) })),
  undo: () =>
    set((s) => {
      const next = history.undo(s.history);
      return { history: next, selection: keepSelection(next.present, s) };
    }),
  redo: () =>
    set((s) => {
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
