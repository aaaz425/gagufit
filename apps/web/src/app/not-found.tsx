import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/site/SiteShell";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없어요",
  robots: { index: false },
};

// 없는 경로는 (site) 레이아웃을 거치지 않아 셸을 직접 감쌈
export default function NotFound() {
  return (
    <SiteShell>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold md:text-[28px]">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-base text-ink-muted">
            주소가 바뀌었거나 없는 페이지예요
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="flex h-11 items-center rounded-sm bg-primary px-6 text-base font-semibold text-white hover:bg-primary-hover"
          >
            처음으로
          </Link>
          <Link
            href="/rooms"
            className="flex h-11 items-center rounded-sm border border-border bg-canvas px-6 text-base font-semibold text-ink hover:bg-surface"
          >
            내 방
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
