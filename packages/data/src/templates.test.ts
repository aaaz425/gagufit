import { wallSegment } from "@gagufit/core";
import { describe, expect, it } from "vitest";
import { ROOM_TEMPLATES, roomFromTemplate } from "./templates";

const wallLength = (room: Parameters<typeof wallSegment>[0], wall: number) => {
  const { start, end } = wallSegment(room, wall);
  return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
};

describe("방 템플릿", () => {
  it("id 중복 없음", () => {
    const ids = ROOM_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("치수는 양의 정수", () => {
    for (const { room } of ROOM_TEMPLATES) {
      for (const v of [room.width, room.depth, room.height]) {
        expect(Number.isInteger(v) && v > 0).toBe(true);
      }
    }
  });

  it("문은 벽 길이 안", () => {
    for (const { room } of ROOM_TEMPLATES) {
      for (const o of room.openings) {
        expect(o.offset).toBeGreaterThanOrEqual(0);
        expect(o.offset + o.width).toBeLessThanOrEqual(
          wallLength(room, o.wall),
        );
      }
    }
  });

  it("빈 방만 문 없음", () => {
    for (const t of ROOM_TEMPLATES) {
      expect(t.room.openings.length).toBe(t.id === "empty" ? 0 : 1);
    }
  });

  it("roomFromTemplate는 복사본", () => {
    const t = ROOM_TEMPLATES[0];
    const room = roomFromTemplate(t);
    expect(room).toEqual(t.room);
    room.openings[0].offset = 999;
    expect(t.room.openings[0].offset).not.toBe(999);
  });
});
