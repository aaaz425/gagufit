import type { Room } from "@gagufit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";
import type { ApiClient } from "./client";
import { createRoom, deleteRoom, getRoom, listRooms, saveRoom } from "./rooms";
import { ensureSession } from "./session";

export const roomKeys = {
  list: ["rooms", "list"] as const,
  detail: (id: string) => ["rooms", "detail", id] as const,
};

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiContext value={client}>{children}</ApiContext>;
}

function useClient(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) throw new Error("ApiProvider 안에서만 사용");
  return client;
}

export function useRooms() {
  const client = useClient();
  return useQuery({
    queryKey: roomKeys.list,
    queryFn: async () => {
      await ensureSession(client);
      return listRooms(client);
    },
  });
}

export function useRoomQuery(id: string) {
  const client = useClient();
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      await ensureSession(client);
      return getRoom(client, id);
    },
  });
}

export function useCreateRoom() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (room: Room) => {
      await ensureSession(client);
      return createRoom(client, room);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roomKeys.list }),
  });
}

// 편집기가 자체 상태로 편집하므로 detail 쿼리는 건드리지 않음
export function useSaveRoom() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, room }: { id: string; room: Room }) => {
      await ensureSession(client);
      return saveRoom(client, id, room);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: roomKeys.list }),
  });
}

export function useDeleteRoom() {
  const client = useClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await ensureSession(client);
      return deleteRoom(client, id);
    },
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: roomKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: roomKeys.list });
    },
  });
}
