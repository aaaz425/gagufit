import { SiteFooter } from "@/site/SiteFooter";
import { SiteNav } from "@/site/SiteNav";

// 편집기(/rooms/[id])는 이 그룹 밖 - 전체 화면
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
