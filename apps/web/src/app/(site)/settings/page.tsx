import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { QualitySection } from "@/settings/QualitySection";
import { LEGAL_LINKS } from "@/site/constants";
import pkg from "../../../../package.json";

export const metadata: Metadata = {
  title: "설정",
  description: "화면 품질과 서비스 정보를 확인해요",
};

const LINKS = [{ href: "/", label: "서비스 소개" }, ...LEGAL_LINKS];

const ROW = "flex min-h-14 items-center justify-between border-b border-border";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 pt-6 pb-10 md:px-0 md:pt-14 md:pb-20">
      <h1 className="text-2xl font-extrabold">설정</h1>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-ink-muted">화면 품질</h2>
        <QualitySection />
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-bold text-ink-muted">정보</h2>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={ROW}>
                <span className="text-base font-medium">{l.label}</span>
                <ChevronRight
                  size={20}
                  className="text-ink-muted"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
          <li className={ROW}>
            <span className="text-base font-medium">버전</span>
            <span className="text-sm text-ink-muted tabular-nums">
              {pkg.version}
            </span>
          </li>
        </ul>
      </section>

      <p className="text-sm text-ink-muted">
        방은 이 브라우저에 연결되어 저장돼요. 브라우저 데이터를 지우면 내 방을
        다시 불러오지 못할 수 있어요
      </p>
    </main>
  );
}
