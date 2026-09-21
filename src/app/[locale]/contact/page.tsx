import type { Metadata } from "next";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { LOCATIONS, HOURS } from "@/config/business";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/components/forms/ContactForm";
import { LocationCard } from "@/components/home/LocationCard";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.contact.seoTitle, description: dict.contact.seoDescription, route: "contact" });
}

export default async function ContactPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const sp = await searchParams;
  const product = typeof sp.produit === "string" ? sp.produit : "";
  const dict = getDictionary(locale);
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.contact.heading }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="text-h1">{dict.contact.heading}</h1>
        <p className="text-lead mt-3 text-ink-soft">{dict.contact.intro}</p>
      </header>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <section aria-labelledby="contact-form-title" className="rounded-xl border border-line bg-surface p-5 sm:p-7">
          <h2 id="contact-form-title" className="text-h3">
            {dict.contact.formHeading}
          </h2>
          <Suspense fallback={null}>
            <ContactForm initialProduct={product} />
          </Suspense>
        </section>
        <div className="space-y-4">
          <div className="rounded-xl bg-ink p-6 text-white">
            <h2 className="text-h3">{dict.contact.callHeading}</h2>
            <p className="mt-1 text-sm text-white/70">{dict.contact.callBody}</p>
            <ul className="mt-4 space-y-3">
              {LOCATIONS.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-4 py-3">
                  <span className="text-sm font-semibold">{l.shortName[locale]}</span>
                  <a href={`tel:${l.phoneE164}`} className="text-base font-extrabold hover:underline underline-offset-4">
                    {l.phone}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-white/60">
              {HOURS.display[locale].days}, {HOURS.display[locale].time}
            </p>
          </div>
          {LOCATIONS.map((l) => (
            <LocationCard key={l.id} location={l} locale={locale} withMap={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
