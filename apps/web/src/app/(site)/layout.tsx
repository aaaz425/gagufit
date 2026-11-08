import { SiteShell } from "@/site/SiteShell";

// 편집기(/rooms/[id])는 이 그룹 밖 - 전체 화면
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
