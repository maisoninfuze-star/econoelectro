import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { HOME_CATEGORY_CARDS } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function CategoryGrid({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <section className="container-x py-14 lg:py-20" aria-labelledby="categories-title">
      <Reveal>
        <div className="max-w-2xl">
          <h2 id="categories-title" className="text-h2">
            {dict.home.categoriesHeading}
          </h2>
          <p className="text-lead mt-3 text-ink-soft">{dict.home.categoriesSub}</p>
        </div>
      </Reveal>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {HOME_CATEGORY_CARDS.map((c, i) => {
          const copy = dict.homeCategories[c.key];
          const to = href(locale, "category", { category: c.category, query: c.type ? { type: c.type } : undefined });
          return (
            <Reveal as="li" key={c.key} delay={i * 40}>
              <Link href={to} className="group block h-full rounded-lg border border-line bg-surface p-2 transition-[transform,box-shadow,border-color] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card focus-visible:outline-offset-4">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-md bg-canvas">
                  <Image src={c.image.src} alt="" width={c.image.width} height={c.image.height} sizes="(min-width: 1280px) 200px, (min-width: 1024px) 30vw, 45vw" className="h-full w-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-[1.04]" />
                </span>
                <span className="flex items-start justify-between gap-2 px-1 pb-1 pt-3">
                  <span>
                    <span className="block text-[0.9375rem] font-bold leading-tight">{copy.name}</span>
                    <span className="mt-1 block text-xs text-ink-soft">{copy.label}</span>
                  </span>
                  <Icon name="arrowRight" size={18} className="mt-0.5 shrink-0 text-ink-soft transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
