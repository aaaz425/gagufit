import { useSaveRoom, type RoomRecord } from "@gagufit/api";
import type { Room } from "@gagufit/core";
import { useEffect } from "react";
import { clearBackup, writeBackup } from "./save-backup";
import { useEditor, type SaveStatus } from "./store";

const DEBOUNCE_MS = 1000;
const RETRY_MS = 15000;

/**
 * baseline - 서버에 있는 방, 현재 방이 다르면(보관본 복구) 바로 저장
 * 끄는 중에는 미루고, 실패하면 보관 후 간격·online·다음 편집 때 재시도
 */
export function useAutoSave(roomId: string, baseline: RoomRecord) {
  const { mutateAsync } = useSaveRoom();

  useEffect(() => {
    let saved = baseline.room;
    // 서버 updated_at - 보관본이 어느 서버 상태 위의 편집인지 표시
    let base = baseline.updatedAt;
    let inFlight = false;
    let disposed = false;
    // 떠난 시점의 방 - 이후 스토어는 다음 방이 씀
    let finalRoom: Room | null = null;
    const current = () => finalRoom ?? useEditor.getState().history.present;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // 떠난 뒤에는 다음 방의 상태를 건드리지 않음
    const setStatus = (status: SaveStatus) => {
      if (!disposed) useEditor.getState().setSaveStatus(status);
    };
    const schedule = (ms: number) => {
      clearTimeout(timer);
      if (!disposed) timer = setTimeout(flush, ms);
    };

    async function flush() {
      timer = undefined;
      const room = current();
      if (room === saved) {
        clearBackup(roomId);
        setStatus("saved");
        return;
      }
      if (inFlight || (!disposed && useEditor.getState().dragging)) return;
      inFlight = true;
      setStatus("saving");
      try {
        base = await mutateAsync({ id: roomId, room });
      } catch {
        inFlight = false;
        writeBackup(roomId, current(), base);
        setStatus("failed");
        schedule(RETRY_MS);
        return;
      }
      inFlight = false;
      saved = room;
      const latest = current();
      if (latest === saved) clearBackup(roomId);
      // 떠난 뒤에도 저장하는 사이 바뀐 방은 마저 보냄 - 보관본의 base도 새로 맞춤
      if (disposed) {
        if (latest !== saved) {
          writeBackup(roomId, latest, base);
          void flush();
        }
        return;
      }
      // 저장하는 사이 또 바뀜
      if (latest === saved) {
        setStatus("saved");
      } else {
        setStatus("unsaved");
        schedule(DEBOUNCE_MS);
      }
    }

    if (current() !== saved) {
      setStatus("unsaved");
      schedule(0);
    }

    const unsubscribe = useEditor.subscribe((s, prev) => {
      if (
        s.history.present === prev.history.present &&
        s.dragging === prev.dragging
      )
        return;
      if (s.history.present === saved) {
        clearTimeout(timer);
        clearBackup(roomId);
        setStatus("saved");
        return;
      }
      setStatus("unsaved");
      if (s.dragging) clearTimeout(timer);
      else schedule(DEBOUNCE_MS);
    });

    const onOnline = () => {
      if (useEditor.getState().saveStatus === "failed") schedule(0);
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditor.getState().saveStatus !== "saved") e.preventDefault();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onBeforeUnload);
      // 화면을 떠나도 남은 변경은 보냄 - 먼저 보관해 두고, 저장 중이면 끝난 뒤 보냄
      clearTimeout(timer);
      finalRoom = useEditor.getState().history.present;
      disposed = true;
      if (finalRoom !== saved) writeBackup(roomId, finalRoom, base);
      void flush();
    };
  }, [roomId, baseline, mutateAsync]);
}
