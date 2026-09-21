import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LOCATIONS } from "@/config/business";
import { LocationCard } from "./LocationCard";
import { Reveal } from "@/components/ui/Reveal";

export function LocationsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="container-x py-14 lg:py-20" aria-labelledby="locations-title">
      <Reveal className="max-w-2xl">
        <h2 id="locations-title" className="text-h2">
          {dict.home.locationsHeading}
        </h2>
        <p className="text-lead mt-3 text-ink-soft">{dict.home.locationsSub}</p>
      </Reveal>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {LOCATIONS.map((l, i) => (
          <Reveal key={l.id} delay={i * 60}>
            <LocationCard location={l} locale={locale} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
