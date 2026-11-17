import { LoaderCircle } from "lucide-react";

/** delay면 짧게 끝나는 불러오기에서 깜빡이지 않게 늦게 나타남 - 이어지는 화면은 바로 */
export function EditorLoading({ delay = false }: { delay?: boolean }) {
  return (
    <main
      className="flex h-dvh flex-col items-center justify-center gap-3 bg-surface"
      style={
        delay
          ? {
              animation:
                "motion-fade var(--duration-base) var(--ease-enter) 200ms backwards",
            }
          : undefined
      }
    >
      <LoaderCircle
        size={28}
        className="animate-spin text-primary"
        aria-hidden
      />
      <p role="status" className="text-sm text-ink-muted">
        방을 불러오는 중이에요
      </p>
    </main>
  );
}
