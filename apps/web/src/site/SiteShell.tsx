import type { ReactNode } from "react";
import { NavTracker } from "./BackButton";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavTracker />
      <SiteNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
