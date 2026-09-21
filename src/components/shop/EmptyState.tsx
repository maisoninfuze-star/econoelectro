import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/dictionaries";
import { href } from "@/lib/i18n/routes";
import { CATEGORIES } from "@/config/site";
import { LOCATIONS, PRIMARY_LOCATION_ID } from "@/config/business";
import { Icon } from "@/components/ui/Icon";
import { LinkButton } from "@/components/ui/Button";
import { ClearFiltersButton } from "./ClearFiltersButton";

export function EmptyState({ locale, query, currentCategory }: { locale: Locale; query?: string | null; currentCategory?: string | null }) {
  const dict = getDictionary(locale);
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center sm:p-12">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-ink-soft">
        <Icon name="search" size={26} />
      </span>
      <h2 className="text-h3 mt-4">{query ? interpolate(dict.shop.emptySearchTitle, { q: query }) : dict.shop.emptyTitle}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{query ? dict.shop.emptySearchBody : dict.shop.emptyBody}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <ClearFiltersButton label={dict.shop.clearFilters} />
        <LinkButton href={`tel:${primary.phoneE164}`} variant="outline">
          <Icon name="phone" size={16} /> {dict.shop.emptyContact}
        </LinkButton>
      </div>
      <p className="mt-8 text-eyebrow text-ink-soft">{dict.shop.emptyCategories}</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {CATEGORIES.filter((c) => c.id !== currentCategory).map((c) => (
          <li key={c.id}>
            <Link href={href(locale, "category", { category: c.id })} className="inline-flex h-10 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold hover:border-ink">
              {dict.categories[c.id].name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
