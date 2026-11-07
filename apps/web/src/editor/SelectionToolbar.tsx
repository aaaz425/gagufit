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

/** 가구는 오른쪽·왼쪽, 자리 없거나 문·창문이면 위·아래 */
export function SelectionToolbar({
  box,
  bounds,
  kind,
}: {
  box: ScreenBox;
  bounds: { width: number; height: number };
  kind: "furniture" | "opening";
}) {
  const width = kind === "furniture" ? 3 * 44 + 8 : 44 + 8;
  let left = (box.minX + box.maxX) / 2 - width / 2;
  // 위쪽은 회전 핸들 자리만큼 더 띄움
  let top = box.minY - GAP - HEIGHT - (kind === "furniture" ? 16 : 0);
  if (top < EDGE) top = box.maxY + GAP;
  if (kind === "furniture") {
    if (box.maxX + GAP + width <= bounds.width - EDGE) {
      left = box.maxX + GAP;
      top = box.minY;
    } else if (box.minX - GAP - width >= EDGE) {
      left = box.minX - GAP - width;
      top = box.minY;
    }
  }
  left = Math.min(Math.max(left, EDGE), bounds.width - width - EDGE);
  top = Math.min(Math.max(top, EDGE), bounds.height - HEIGHT - EDGE);

  return (
    <div
      role="toolbar"
      aria-label="선택한 대상"
      className="absolute flex items-center rounded-full bg-canvas px-1 py-0.5 shadow-floating"
      style={{ left, top }}
    >
      {kind === "furniture" && (
        <>
          <ToolButton label="90° 회전" onClick={rotateSelected90}>
            <RotateCw size={18} className="text-ink" />
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
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full hover:bg-surface"
    >
      {children}
    </button>
  );
}
