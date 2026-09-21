import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function TrustBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pillars: { key: keyof typeof dict.home.trust; icon: IconName }[] = [
    { key: "price", icon: "wallet" },
    { key: "inspected", icon: "shield" },
    { key: "human", icon: "hand" },
    { key: "locations", icon: "store" },
  ];
  return (
    <section className="container-x py-14 lg:py-20" aria-labelledby="trust-title">
      <Reveal className="max-w-2xl">
        <h2 id="trust-title" className="text-h2">
          {dict.home.trustHeading}
        </h2>
        <p className="text-lead mt-3 text-ink-soft">{dict.home.trustBody}</p>
      </Reveal>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {pillars.map((p, i) => (
          <Reveal as="li" key={p.key} delay={i * 50} className="rounded-lg border border-line bg-surface p-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-brand-soft text-brand">
              <Icon name={p.icon} size={22} />
            </span>
            <h3 className="mt-4 text-base font-bold">{dict.home.trust[p.key].title}</h3>
            <p className="mt-1.5 text-sm text-ink-soft">{dict.home.trust[p.key].body}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
