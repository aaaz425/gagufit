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
} from "./rooms";
export {
  ApiProvider,
  roomKeys,
  useCreateRoom,
  useDeleteRoom,
  useRoomQuery,
  useRooms,
  useSaveRoom,
} from "./hooks";
