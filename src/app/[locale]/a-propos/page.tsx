import type { Metadata } from "next";
import Image from "next/image";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { STORE_PHOTOS } from "@/config/site";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { LocationsSection } from "@/components/home/LocationsSection";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.about.seoTitle, description: dict.about.seoDescription, route: "about", image: { url: STORE_PHOTOS.team.src, width: STORE_PHOTOS.team.width, height: STORE_PHOTOS.team.height } });
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return (
    <>
      <div className="container-x py-6 lg:py-10">
        <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.nav.about }]} />
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <p className="text-eyebrow text-brand">{dict.about.eyebrow}</p>
            <h1 className="text-h1 mt-3">{dict.about.heading}</h1>
            <p className="text-lead mt-4 text-ink-soft">{dict.about.intro}</p>
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-ink-soft">
              {dict.about.story.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
            <div className="mt-7">
              <LinkButton href={href(locale, "shop")} size="lg">
                {dict.about.cta} <Icon name="arrowRight" size={18} />
              </LinkButton>
            </div>
          </div>
          <Reveal className="overflow-hidden rounded-xl bg-canvas">
            <Image src={STORE_PHOTOS.team.src} alt={dict.about.teamAlt} width={STORE_PHOTOS.team.width} height={STORE_PHOTOS.team.height} sizes="(min-width: 1024px) 50vw, 100vw" priority className="h-full w-full object-cover" />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          <Reveal className="rounded-xl bg-ink p-7 text-white sm:p-10">
            <h2 className="text-h2">{dict.about.missionHeading}</h2>
            <p className="text-lead mt-4 text-white/75">{dict.about.mission}</p>
          </Reveal>
          <Reveal delay={60} className="rounded-xl border border-line bg-surface p-7 sm:p-10">
            <h2 className="text-h2">{dict.about.visionHeading}</h2>
            <p className="text-lead mt-4 text-ink-soft">{dict.about.vision}</p>
          </Reveal>
        </div>

        <section className="mt-14" aria-labelledby="values-title">
          <Reveal>
            <h2 id="values-title" className="text-h2">
              {dict.about.valuesHeading}
            </h2>
          </Reveal>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dict.about.values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 50} className="rounded-lg border border-line bg-surface p-5">
                <Icon name="check" size={20} className="text-brand" />
                <h3 className="mt-3 font-bold">{v.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{v.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[STORE_PHOTOS.interiorWide, STORE_PHOTOS.aisle, STORE_PHOTOS.washers].map((ph, i) => (
            <Reveal key={ph.src} delay={i * 50} className="overflow-hidden rounded-lg bg-canvas">
              <Image src={ph.src} alt="" width={ph.width} height={ph.height} sizes="(min-width: 640px) 33vw, 100vw" loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
            </Reveal>
          ))}
        </div>
      </div>
      <LocationsSection locale={locale} />
    </>
  );
}
