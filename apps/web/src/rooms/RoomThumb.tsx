import type { Room } from "@gagufit/core";
import { RoomPlan } from "@/editor/plan/RoomPlan";

const EMPTY: ReadonlySet<string> = new Set();
/** 벽 바깥 여백 cm */
const PAD = 24;
/** 도면 그림에 넘기는 화면 px/cm 근사 - 썸네일 안 벽 두께·선 굵기 기준 */
const SCALE = 0.4;

/** 탑뷰 썸네일 - 편집기 도면 그대로, 상호작용 없음 */
export function RoomThumb({ room }: { room: Room }) {
  return (
    <svg
      viewBox={`${-PAD} ${-PAD} ${room.width + PAD * 2} ${room.depth + PAD * 2}`}
      aria-hidden
      className="block size-full"
    >
      <RoomPlan room={room} scale={SCALE} selection={null} warned={EMPTY} />
    </svg>
  );
}
