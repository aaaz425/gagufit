import { Box, CloudCheck, Ruler, TriangleAlert } from "lucide-react";
import { Container } from "./Container";

const FEATURES = {
  size: {
    icon: Ruler,
    title: "실제 치수 그대로",
    desc: "방과 가구를 cm 단위 실제 크기로 놓아요",
  },
  warning: {
    icon: TriangleAlert,
    title: "안 맞으면 바로 알림",
    desc: "가구가 겹치거나 벽 밖으로 나가거나 문을 막으면 알려 줘요",
  },
  view: {
    icon: Box,
    title: "2D로 놓고 3D로 확인",
    desc: "위에서 보며 놓고, 3D로 방을 둘러볼 수 있어요",
  },
  save: {
    icon: CloudCheck,
    title: "로그인 없이 저장",
    desc: "로그인 없이 쓰고 자동으로 저장돼요",
  },
};

export function Features() {
  return (
    <section className="bg-surface py-8 md:bg-canvas md:pt-6 md:pb-16">
      <Container className="flex flex-col gap-5">
        <h2 className="text-xl font-bold md:sr-only">
          이런 걸 확인할 수 있어요
        </h2>
        <ul className="flex flex-col gap-5 md:grid md:grid-cols-4 md:gap-8">
          {Object.values(FEATURES).map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-4 md:flex-col">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-primary-soft text-primary">
                <Icon size={20} aria-hidden />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-ink-muted">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
