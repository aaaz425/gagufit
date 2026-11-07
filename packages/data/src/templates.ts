import { OPENING_DEFAULTS, type HingedDoor, type Room } from "@gagufit/core";
import { DEFAULT_FLOOR_MATERIAL, DEFAULT_WALL_MATERIAL } from "./materials";
import { withIds } from "./with-ids";

export type RoomTemplate = { id: string; name: string; room: Room };

/** 현관 문 - 아래 벽(2) 오른쪽 구석, 경첩은 구석 쪽, 방 안으로 열림 */
const entranceDoor: HingedDoor = {
  id: "door-1",
  kind: "hinged",
  wall: 2,
  offset: 20,
  ...OPENING_DEFAULTS.hinged,
  hinge: "left",
  swing: "in",
};

function template(
  name: string,
  width: number,
  depth: number,
  door: boolean,
): Omit<RoomTemplate, "id"> {
  return {
    name,
    room: {
      name,
      width,
      depth,
      height: 240,
      floorMaterial: DEFAULT_FLOOR_MATERIAL,
      wallMaterial: DEFAULT_WALL_MATERIAL,
      openings: door ? [entranceDoor] : [],
      furniture: [],
    },
  };
}

export const ROOM_TEMPLATES: Readonly<Record<string, RoomTemplate>> = withIds<
  string,
  Omit<RoomTemplate, "id">
>({
  "one-room": template("원룸 기본", 300, 400, true),
  "one-room-long": template("원룸 긴 형", 250, 500, true),
  "one-half-room": template("1.5룸", 400, 450, true),
  empty: template("빈 방", 300, 400, false),
});

/** 템플릿으로 새 방 - 공유 데이터가 바뀌지 않게 복사 */
export function roomFromTemplate(template: RoomTemplate): Room {
  const { room } = template;
  return {
    ...room,
    openings: room.openings.map((o) => ({ ...o })),
    furniture: room.furniture.map((f) => ({
      ...f,
      position: { ...f.position },
    })),
  };
}
