"use client";

import { Armchair } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";

const LINKS = [
  { href: "/rooms?new=1", label: "방 만들기", path: null },
  { href: "/rooms", label: "내 방", path: "/rooms" },
  { href: "/settings", label: "설정", path: "/settings" },
];

/** 로그인 자리는 2차까지 숨김 */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-border bg-canvas">
      <Container className="flex h-14 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-extrabold text-ink"
        >
          <span className="flex size-8 items-center justify-center rounded-sm bg-primary text-white">
            <Armchair size={20} aria-hidden />
          </span>
          gagufit
        </Link>
        <nav aria-label="주 메뉴" className="flex items-center">
          {LINKS.map((link, i) => {
            const current = link.path === pathname;
            return (
              <span key={link.href} className="flex items-center">
                {i > 0 && <span aria-hidden className="h-3.5 w-px bg-border" />}
                <Link
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex h-11 items-center px-3 text-sm md:px-4 ${
                    current
                      ? "font-bold text-ink"
                      : "font-medium text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              </span>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
