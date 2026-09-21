import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorks({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="container-x py-14 lg:py-20" aria-labelledby="how-title">
      <Reveal className="max-w-2xl">
        <h2 id="how-title" className="text-h2">
          {dict.home.howHeading}
        </h2>
        <p className="text-lead mt-3 text-ink-soft">{dict.home.howSub}</p>
      </Reveal>
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {dict.home.howSteps.map((s, i) => (
          <Reveal as="li" key={s.title} delay={i * 50} className="relative rounded-lg border border-line bg-surface p-5 pt-6">
            <span className="absolute -top-3 left-5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand px-2 text-xs font-extrabold text-white" aria-hidden="true">
              {i + 1}
            </span>
            <h3 className="text-base font-bold">
              <span className="sr-only">{i + 1}. </span>
              {s.title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-soft">{s.body}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
