import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { CREATIVES } from "@/config/site";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function PromoSplit({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="container-x py-6 lg:py-10" aria-labelledby="promo-title">
      <Reveal className="grid overflow-hidden rounded-xl bg-ink text-white lg:grid-cols-2">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
          <Image src={CREATIVES.kitchen.src} alt={dict.home.bundlesImageAlt} width={CREATIVES.kitchen.width} height={CREATIVES.kitchen.height} sizes="(min-width: 1024px) 50vw, 100vw" quality={60} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="text-eyebrow text-white/60">{dict.nav.sets}</p>
          <h2 id="promo-title" className="text-h2 mt-3 text-balance">
            {dict.home.bundlesHeading}
          </h2>
          <p className="text-lead mt-4 text-white/75">{dict.home.bundlesBody}</p>
          <div className="mt-7">
            <LinkButton href={href(locale, "category", { category: "ensembles" })} variant="dark" size="lg">
              {dict.home.bundlesCta} <Icon name="arrowRight" size={18} />
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
