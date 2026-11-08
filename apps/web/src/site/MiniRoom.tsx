import type { CSSProperties } from "react";

// 200 x 150 기준 그림 - 부모의 --s 변수로 확대·축소(기본 1)
const u = (n: number) => `calc(${n}px * var(--s, 1))`;
const WALL = "max(2px, calc(4px * var(--s, 1)))";

type Box = { x: number; y: number; w: number; h: number };

const BED: Box = { x: 12, y: 12, w: 56, h: 78 };
const WARDROBE: Box = { x: 166, y: 12, w: 26, h: 54 };
const DESK: Box = { x: 112, y: 100, w: 62, h: 30 };
const CHAIR: Box = { x: 128, y: 118, w: 24, h: 24 };

const place = ({ x, y, w, h }: Box): CSSProperties => ({
  left: u(x),
  top: u(y),
  width: u(w),
  height: u(h),
});

/**
 * 안내용 탑뷰 방 그림
 * 1 빈 방, 2 가구 배치(침대 선택), 3 의자가 책상과 겹친 경고
 */
export function MiniRoom({ step }: { step: 1 | 2 | 3 }) {
  const furniture = "absolute bg-scene-furniture";
  const radius = { borderRadius: u(5) };
  return (
    <div
      aria-hidden
      className="relative bg-scene-floor"
      style={{
        width: u(200),
        height: u(150),
        boxShadow: `0 0 0 ${WALL} var(--color-scene-wall)`,
      }}
    >
      <span
        className="absolute bg-canvas"
        style={{ ...place({ x: 150, y: 143, w: 34, h: 7 }) }}
      />
      {step > 1 && (
        <>
          <span
            className={furniture}
            style={{
              ...place(BED),
              ...radius,
              boxShadow:
                step === 2
                  ? `0 0 0 ${u(3)} var(--color-primary), 0 0 0 ${u(7)} rgba(11, 125, 97, 0.2)`
                  : undefined,
            }}
          />
          <span
            className={furniture}
            style={{ ...place(WARDROBE), ...radius }}
          />
          <span className={furniture} style={{ ...place(DESK), ...radius }} />
        </>
      )}
      {step === 3 && (
        <span
          className="absolute bg-danger-soft"
          style={{
            ...place(CHAIR),
            ...radius,
            boxShadow: `0 0 0 ${u(2)} var(--color-danger)`,
          }}
        />
      )}
    </div>
  );
}
