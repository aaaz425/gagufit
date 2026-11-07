export type * from "./types";
export { checkRoom } from "./check";
export {
  addFurniture,
  DUPLICATE_OFFSET,
  duplicateFurniture,
  ROTATION_SNAP_THRESHOLD,
  roundVec2,
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
  wallSegment,
} from "./room";
export { CURRENT_SCHEMA_VERSION, migrate, type SavedRoom } from "./schema";
