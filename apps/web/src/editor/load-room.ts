import type { Room } from "@gagufit/core";
import { ROOM_TEMPLATES, roomFromTemplate } from "@gagufit/data";

// 2단계는 템플릿 id로 메모리에서만 편집 - 3단계에서 저장된 방 불러오기로 교체
export function loadRoom(id: string): Room | null {
  if (!Object.hasOwn(ROOM_TEMPLATES, id)) return null;
  return roomFromTemplate(ROOM_TEMPLATES[id]);
}
