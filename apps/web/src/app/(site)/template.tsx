import type { ReactNode } from "react";

// layout과 달리 이동할 때마다 다시 그려져 본문 진입 효과가 매번 나옴
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="motion-page flex flex-1 flex-col">{children}</div>;
}
