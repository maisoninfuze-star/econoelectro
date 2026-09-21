import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CONDITION_GRADES } from "@/config/site";
import { Icon } from "@/components/ui/Icon";

export function ConditionGuide({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section id="condition-guide" aria-labelledby="condition-guide-title" className="rounded-lg border border-line bg-surface p-5">
      <h2 id="condition-guide-title" className="text-h3">
        {dict.product.conditionGuide}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{dict.condition.guideIntro}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {CONDITION_GRADES.map((g) => (
          <div key={g} className="rounded-md bg-canvas p-3">
            <dt className="flex items-center gap-2 text-sm font-bold">
              <Icon name="shield" size={15} className="text-ink-soft" /> {dict.condition.grades[g].label}
            </dt>
            <dd className="mt-1 text-sm text-ink-soft">{dict.condition.grades[g].definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
