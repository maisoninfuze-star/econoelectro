import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import type { Product } from "@/lib/commerce/types";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { FeaturedCarousel } from "./FeaturedCarousel";

export function FeaturedDeals({ locale, products }: { locale: Locale; products: Product[] }) {
  const dict = getDictionary(locale);
  if (!products.length) return null;
  return (
    <section className="bg-surface py-14 lg:py-20" aria-labelledby="featured-title">
      <div className="container-x">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="featured-title" className="text-h2">
              {dict.home.featuredHeading}
            </h2>
            <p className="text-lead mt-3 text-ink-soft">{dict.home.featuredBody}</p>
          </div>
          <LinkButton href={href(locale, "deals")} variant="outline" className="hidden sm:inline-flex">
            {dict.home.featuredCta} <Icon name="arrowRight" size={16} />
          </LinkButton>
        </Reveal>
        <div className="mt-8">
          <FeaturedCarousel products={products} />
        </div>
        <div className="mt-6 sm:hidden">
          <LinkButton href={href(locale, "deals")} variant="outline" className="w-full">
            {dict.home.featuredCta} <Icon name="arrowRight" size={16} />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
