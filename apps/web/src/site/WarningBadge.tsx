import { TriangleAlert } from "lucide-react";

/** 편집기 상단 바 경고 배지와 같은 모양 */
export function WarningBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold whitespace-nowrap text-danger tabular-nums ${className}`}
    >
      <TriangleAlert size={14} aria-hidden />
      경고 1
    </span>
  );
}
