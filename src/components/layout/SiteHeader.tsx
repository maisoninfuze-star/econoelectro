import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/commerce/types";
import { HeaderClient } from "./HeaderClient";
import type { SearchIndexItem } from "./SearchOverlay";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function buildSearchIndex(products: Product[], locale: Locale): SearchIndexItem[] {
  const dict = getDictionary(locale);
  return products.map((p) => ({
    slug: p.slug,
    title: p.title[locale] || p.title.fr,
    brand: p.brand,
    price: p.price,
    priceFrom: p.priceFrom,
    image: p.images[0]?.src ?? null,
    category: p.category,
    keywords: [
      p.title.fr,
      p.title.en,
      dict.categories[p.category].name,
      p.subcategory ? (dict.subcategories as Record<string, string>)[p.subcategory] ?? "" : "",
      p.finish ?? "",
      p.color ? `${p.color.fr} ${p.color.en}` : "",
      p.width ? `${p.width} po ${p.width} in` : "",
      p.model ?? "",
    ].join(" "),
  }));
}

export function SiteHeader({ products, locale }: { products: Product[]; locale: Locale }) {
  const index = buildSearchIndex(products, locale);
  const accountUrl = process.env.NEXT_PUBLIC_SHOPIFY_ACCOUNT_URL || null;
  return <HeaderClient searchIndex={index} accountUrl={accountUrl} />;
}
