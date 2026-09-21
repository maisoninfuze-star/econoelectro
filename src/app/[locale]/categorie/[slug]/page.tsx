import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveProducts } from "@/lib/commerce";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { CATEGORIES } from "@/config/site";
import type { CategoryId } from "@/lib/commerce/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ShopView, type SearchParams } from "@/components/shop/ShopView";
import { ProductGridSkeleton } from "@/components/product/ProductGridSkeleton";

type Params = Promise<{ locale: string; slug: string }>;

function resolve(slug: string): CategoryId | null {
  return CATEGORIES.some((c) => c.id === slug) ? (slug as CategoryId) : null;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => CATEGORIES.map((c) => ({ locale, slug: c.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const id = resolve(slug);
  if (!id) return {};
  const dict = getDictionary(locale);
  const c = CATEGORIES.find((x) => x.id === id)!;
  return buildMetadata({ locale, title: dict.categories[id].seoTitle, description: dict.categories[id].seoDescription, route: "category", params: { category: id }, image: { url: c.image.src, width: c.image.width, height: c.image.height, alt: dict.categories[id].name } });
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: Promise<SearchParams> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const id = resolve(slug);
  if (!id) notFound();
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const products = await getActiveProducts();
  const copy = dict.categories[id];
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.shop.title, href: href(locale, "shop") }, { label: copy.name }]} />
      <header className="mt-4 max-w-3xl">
        <h1 className="text-h1">{copy.name}</h1>
        <p className="text-lead mt-3 text-ink-soft">{copy.short}</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{copy.intro}</p>
      </header>
      <div className="mt-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ShopView products={products} locale={locale} searchParams={sp} lockedCategory={id} listName={`category_${id}`} />
        </Suspense>
      </div>
    </div>
  );
}
