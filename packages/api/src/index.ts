export { createApiClient, type ApiClient } from "./client";
export { ensureSession } from "./session";
export {
  createRoom,
  deleteRoom,
  getRoom,
  listRooms,
  saveRoom,
  type RoomRecord,
  type RoomSummary,
  type SaveResult,
} from "./rooms";
export {
  ApiProvider,
  roomKeys,
  useCreateRoom,
  useDeleteRoom,
  useProducts,
  useRoomQuery,
  useRooms,
  useSaveRoom,
} from "./hooks";
