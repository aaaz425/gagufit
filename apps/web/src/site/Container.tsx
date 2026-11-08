import type { ReactNode } from "react";

/** 사이트 본문 폭 1120px, 좁은 화면에서는 좌우 여백 */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1120px] px-4 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
