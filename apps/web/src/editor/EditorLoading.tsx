import { LoaderCircle } from "lucide-react";

/** 짧게 끝나는 불러오기에서 깜빡이지 않게 지연 후 나타남 */
export function EditorLoading() {
  return (
    <main
      role="status"
      className="motion-fade flex h-dvh flex-col items-center justify-center gap-3 bg-surface"
      style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
    >
      <LoaderCircle
        size={28}
        className="animate-spin text-primary"
        aria-hidden
      />
      <p className="text-sm text-ink-muted">방을 불러오는 중이에요</p>
    </main>
  );
}
