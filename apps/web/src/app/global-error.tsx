"use client";

import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

// 루트 레이아웃 대신 그려져 문서·스타일을 직접 둠
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <title>문제가 생겼어요</title>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold md:text-[28px]">
              문제가 생겼어요
            </h1>
            <p className="text-base text-ink-muted">
              잠시 뒤 다시 시도해 주세요
            </p>
          </div>
          <button
            type="button"
            onClick={retry}
            className="flex h-11 items-center rounded-sm bg-primary px-6 text-base font-semibold text-white hover:bg-primary-hover"
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
