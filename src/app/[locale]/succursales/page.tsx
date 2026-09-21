import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";
import { href } from "@/lib/i18n/routes";
import { LOCATIONS, HOURS } from "@/config/business";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LocationCard } from "@/components/home/LocationCard";
import { Icon } from "@/components/ui/Icon";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.locations.seoTitle, description: dict.locations.seoDescription, route: "locations" });
}

export default async function LocationsPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return (
    <div className="container-x py-6 lg:py-10">
      {LOCATIONS.map((l) => (
        <JsonLd key={l.id} data={localBusinessJsonLd(l, locale)} />
      ))}
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.locations.heading }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="text-h1">{dict.locations.heading}</h1>
        <p className="text-lead mt-3 text-ink-soft">{dict.locations.intro}</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-sm font-semibold">
          <Icon name="clock" size={16} className="text-brand" /> {HOURS.display[locale].days}, {HOURS.display[locale].time}
        </p>
      </header>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {LOCATIONS.map((l) => (
          <LocationCard key={l.id} location={l} locale={locale} />
        ))}
      </div>
    </div>
  );
}
