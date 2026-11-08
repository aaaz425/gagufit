import Link from "next/link";
import { Container } from "./Container";
import { HEADLINE } from "./constants";
import { MiniRoom } from "./MiniRoom";
import { WarningBadge } from "./WarningBadge";

export function Hero() {
  return (
    <section className="pt-7 pb-8 md:pt-[72px] md:pb-14">
      <Container className="flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-16">
        <div className="flex flex-1 flex-col items-start gap-6">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
            원룸 가구 배치 시뮬레이터
          </span>
          <h1 className="text-[32px] leading-tight font-bold tracking-[-0.8px] md:text-[40px] md:leading-[1.25]">
            {HEADLINE}
          </h1>
          <p className="text-base leading-[1.6] text-ink-muted md:text-lg">
            사기 전에 실제 치수로 미리 놓아 보세요.
            <br />
            로그인 없이 바로 시작할 수 있어요.
          </p>
          <Link
            href="/rooms"
            className="flex h-11 items-center rounded-sm bg-primary px-6 text-base font-semibold text-white hover:bg-primary-hover"
          >
            시작하기
          </Link>
        </div>
        <div
          aria-hidden
          className="w-full max-w-[600px] overflow-hidden rounded-md border border-border bg-canvas shadow-floating xl:shrink-0"
        >
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold">내 원룸</span>
            <WarningBadge />
          </div>
          <div className="flex h-[260px] items-center justify-center bg-surface [--s:1.1] md:h-[380px] md:[--s:1.6]">
            <MiniRoom step={3} />
          </div>
        </div>
      </Container>
    </section>
  );
}
