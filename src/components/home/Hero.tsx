import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { formatPrice } from "@/lib/i18n/format";
import { CREATIVES } from "@/config/site";
import type { Product } from "@/lib/commerce/types";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Split hero. The single promo card is tied to a real featured product (sale first). */
export function Hero({ locale, promo }: { locale: Locale; promo: Product | null }) {
  const dict = getDictionary(locale);
  return (
    <section className="relative overflow-hidden bg-surface" aria-labelledby="hero-title">
      <div className="container-x grid items-center gap-8 py-10 md:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-20">
        <div className="stagger max-w-xl">
          <p className="text-eyebrow text-brand">{dict.hero.eyebrow}</p>
          <h1 id="hero-title" className="text-display mt-4 text-balance">
            {dict.hero.headline}
          </h1>
          <p className="text-lead mt-5 text-ink-soft">{dict.hero.body}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={href(locale, "shop")} size="lg">
              {dict.hero.primaryCta} <Icon name="arrowRight" size={18} />
            </LinkButton>
            <LinkButton href={href(locale, "deals")} size="lg" variant="outline">
              {dict.hero.secondaryCta}
            </LinkButton>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
            <Icon name="store" size={16} className="text-ink" /> {dict.hero.reassurance}
          </p>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-canvas anim-fade-in sm:aspect-[5/5.4] lg:aspect-[4/5]">
            <Image
              src={CREATIVES.heroSet.src}
              alt={dict.hero.imageAlt}
              width={CREATIVES.heroSet.width}
              height={CREATIVES.heroSet.height}
              priority
              fetchPriority="high"
              quality={60}
              sizes="(min-width: 1024px) 46vw, (min-width: 640px) 512px, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          {promo ? (
            <Link
              href={href(locale, "product", { slug: promo.slug })}
              className="group absolute -bottom-3 left-3 flex max-w-[86%] items-center gap-3 rounded-lg border border-line bg-surface/95 p-3 shadow-float backdrop-blur transition-transform duration-300 hover:-translate-y-0.5 sm:left-6 sm:max-w-xs"
            >
              {promo.images[0] ? (
                <span className="relative block h-16 w-14 shrink-0 overflow-hidden rounded-md bg-canvas">
                  <Image src={promo.images[0].src} alt="" width={112} height={128} sizes="56px" className="h-full w-full object-cover" />
                </span>
              ) : null}
              <span className="min-w-0">
                <span className="block text-eyebrow text-brand">{dict.hero.promoLabel}</span>
                <span className="mt-0.5 block truncate text-sm font-bold">{promo.title[locale] || promo.title.fr}</span>
                <span className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-base font-extrabold">{formatPrice(promo.price, locale, { decimals: false })}</span>
                  {promo.compareAtPrice && promo.compareAtPrice > promo.price ? <s className="text-xs text-ink-soft">{formatPrice(promo.compareAtPrice, locale, { decimals: false })}</s> : null}
                </span>
              </span>
              <Icon name="arrowRight" size={18} className="ml-auto shrink-0 text-ink-soft transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
