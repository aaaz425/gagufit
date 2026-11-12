"use client";

import Link from "next/link";
import { SiteShell } from "@/site/SiteShell";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <SiteShell>
      <title>문제가 생겼어요</title>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold md:text-[28px]">문제가 생겼어요</h1>
          <p className="text-base text-ink-muted">잠시 뒤 다시 시도해 주세요</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="flex h-11 items-center rounded-sm bg-primary px-6 text-base font-semibold text-white hover:bg-primary-hover"
          >
            다시 시도
          </button>
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
