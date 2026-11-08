import { EFFECTIVE_DATE } from "./constants";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

/** 이용약관·개인정보처리방침 공통 틀 */
export function LegalPage({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <main>
      <div className="mx-auto w-full max-w-[720px] px-4 pt-6 pb-10 md:px-0 md:pt-14 md:pb-20">
        <div className="flex flex-col gap-7 md:gap-10">
          <header className="flex flex-col gap-2">
            <h1 className="text-xl font-bold md:text-[28px] md:tracking-[-0.4px]">
              {title}
            </h1>
            <p className="text-xs text-ink-muted md:text-sm">
              시행일 {EFFECTIVE_DATE}
            </p>
          </header>
          <div className="flex flex-col gap-6 md:gap-7">
            {sections.map((s) => (
              <section key={s.title} className="flex flex-col gap-2">
                <h2 className="text-base font-bold md:text-xl md:font-semibold md:tracking-[-0.2px]">
                  {s.title}
                </h2>
                <div className="flex flex-col gap-2 text-sm leading-[1.7] text-ink md:text-base">
                  {s.paragraphs?.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                  {s.items && (
                    <ul className="list-disc pl-5">
                      {s.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
