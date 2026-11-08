import Link from "next/link";
import { COUPANG_NOTICE, LEGAL_LINKS } from "./constants";
import { Container } from "./Container";

const LINKS = [{ href: "/", label: "서비스 소개" }, ...LEGAL_LINKS];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <Container className="flex flex-col gap-3 pt-7 pb-8 md:py-7">
        <nav
          aria-label="안내"
          className="flex flex-wrap gap-x-4 text-xs text-ink-muted md:gap-x-5 md:text-[13px]"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex h-8 items-center hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs leading-[1.4] text-ink-muted">{COUPANG_NOTICE}</p>
      </Container>
    </footer>
  );
}
