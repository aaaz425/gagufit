import { MiniRoom } from "./MiniRoom";
import { Container } from "./Container";
import { WarningBadge } from "./WarningBadge";

const STEPS = {
  room: {
    no: 1,
    title: "방 만들기",
    desc: "원룸 템플릿을 고르고 치수만 바꿔요",
  },
  place: {
    no: 2,
    title: "가구 놓기",
    desc: "표준 규격 가구를 끌어다 놓아요",
  },
  check: {
    no: 3,
    title: "확인하기",
    desc: "겹치면 알려 주고, 3D로 둘러볼 수 있어요",
  },
} as const;

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-canvas py-8 md:border-t-0 md:bg-surface md:py-16">
      <Container className="flex flex-col gap-5 md:gap-10">
        <div className="flex flex-col gap-2">
          <p className="hidden text-sm font-semibold text-primary md:block">
            사용 방법
          </p>
          <h2 className="text-xl font-bold md:text-[28px] md:tracking-[-0.4px]">
            세 단계면 충분해요
          </h2>
        </div>
        <ol className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
          {Object.values(STEPS).map((s) => (
            <li
              key={s.no}
              className="flex items-center gap-3.5 md:flex-col md:items-stretch md:gap-4"
            >
              <div className="relative flex size-22 shrink-0 flex-col items-center justify-center gap-2 rounded-md bg-surface [--s:0.36] md:size-auto md:h-[200px] md:border md:border-border md:bg-canvas md:[--s:1]">
                <MiniRoom step={s.no} />
                {s.no === 1 && (
                  <span className="hidden text-[11px] font-medium text-ink-muted tabular-nums md:block">
                    300 × 400 cm
                  </span>
                )}
                {s.no === 3 && (
                  <WarningBadge className="absolute top-3 left-3 max-md:hidden" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 md:contents">
                <div className="flex items-center gap-2 md:contents">
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:size-7 md:text-sm">
                    {s.no}
                  </span>
                  <h3 className="text-[15px] font-bold md:text-xl md:font-semibold md:tracking-[-0.2px]">
                    {s.title}
                  </h3>
                </div>
                <p className="text-[13px] text-ink-muted md:text-sm">
                  {s.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
