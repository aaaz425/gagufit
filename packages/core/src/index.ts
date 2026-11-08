export type * from "./types";
export { checkRoom } from "./check";
export {
  addFurniture,
  addOpening,
  DUPLICATE_OFFSET,
  duplicateFurniture,
  FURNITURE_SIZE_LIMITS,
  moveOpening,
  resizeFurniture,
  resizeRoom,
  ROTATION_SNAP_THRESHOLD,
  roundVec2,
  setOpeningWidth,
  snapRotation,
} from "./edit";
export { furnitureCorners, polygonsOverlap } from "./geometry";
export * as history from "./history";
export type { History } from "./history";
export {
  DOOR_PASSAGE_DEPTH,
  doorPassageCorners,
  OPENING_DEFAULTS,
  roomCorners,
  wallFrame,
  type WallFrame,
} from "./room";
export { CURRENT_SCHEMA_VERSION, migrate, type SavedRoom } from "./schema";
