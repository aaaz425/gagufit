import { checkRoom } from "@gagufit/core";
import { describe, expect, it } from "vitest";
import { FURNITURE_PRESETS } from "./presets";
import { ROOM_TEMPLATES, roomFromTemplate } from "./templates";

describe("방 템플릿", () => {
  it("판정 경고 없음 - 빈 상태·문 반대쪽에 침대", () => {
    for (const t of Object.values(ROOM_TEMPLATES)) {
      const room = roomFromTemplate(t);
      expect(checkRoom(room, FURNITURE_PRESETS)).toEqual([]);

      // 문은 아래 벽 - 침대는 위 벽 쪽 가운데
      room.furniture.push({
        id: "f1",
        presetId: "bed-super-single",
        position: { x: room.width / 2, y: 110 },
        rotation: 0,
        size: FURNITURE_PRESETS["bed-super-single"].size,
        color: "beige-fabric",
      });
      expect(checkRoom(room, FURNITURE_PRESETS)).toEqual([]);
    }
  });
});
