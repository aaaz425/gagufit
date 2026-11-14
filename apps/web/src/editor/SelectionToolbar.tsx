import type { Vec2 } from "@gagufit/core";
import { Copy, RotateCw, Trash2 } from "lucide-react";
import { deleteSelected, duplicateSelected, rotateSelected90 } from "./actions";

/** 화면 px */
export type ScreenBox = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const HEIGHT = 48;
const GAP = 14;
const EDGE = 8;

/** 화면 px - 패널에 가리지 않은 영역 */
export type ScreenRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

/** 가구는 오른쪽·왼쪽, 자리 없으면 위·아래 - center가 있으면 그 점 가운데 */
export function SelectionToolbar({
  box,
  center,
  bounds,
  kind,
}: {
  box: ScreenBox;
  center?: Vec2 | null;
  bounds: ScreenRect;
  kind: "furniture" | "opening";
}) {
  const width = kind === "furniture" ? 3 * 44 + 8 : 44 + 8;
  let left = (box.minX + box.maxX) / 2 - width / 2;
  // 위쪽은 회전 핸들 자리만큼 더 띄움
  let top = box.minY - GAP - HEIGHT - (kind === "furniture" ? 16 : 0);
  if (top < bounds.top + EDGE) top = box.maxY + GAP;
  if (center) {
    left = center.x - width / 2;
    top = center.y - HEIGHT / 2;
  } else if (kind === "furniture") {
    if (box.maxX + GAP + width <= bounds.right - EDGE) {
      left = box.maxX + GAP;
      top = box.minY;
    } else if (box.minX - GAP - width >= bounds.left + EDGE) {
      left = box.minX - GAP - width;
      top = box.minY;
    }
  }
  left = Math.min(
    Math.max(left, bounds.left + EDGE),
    bounds.right - width - EDGE,
  );
  top = Math.min(
    Math.max(top, bounds.top + EDGE),
    bounds.bottom - HEIGHT - EDGE,
  );

  return (
    <div
      role="toolbar"
      aria-label="선택한 대상"
      className="absolute flex items-center rounded-full bg-canvas px-1 py-1 shadow-floating"
      style={{ left, top }}
    >
      {kind === "furniture" && (
        <>
          <ToolButton label="90° 회전" onClick={rotateSelected90} tonal>
            <RotateCw size={18} className="text-primary" />
          </ToolButton>
          <ToolButton label="복제" onClick={duplicateSelected}>
            <Copy size={18} className="text-ink" />
          </ToolButton>
        </>
      )}
      <ToolButton label="삭제" onClick={deleteSelected}>
        <Trash2 size={18} className="text-danger" />
      </ToolButton>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  tonal,
  children,
}: {
  label: string;
  onClick: () => void;
  tonal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex size-11 items-center justify-center rounded-full ${tonal ? "bg-primary-soft" : "hover:bg-surface"}`}
    >
      {children}
    </button>
  );
}
