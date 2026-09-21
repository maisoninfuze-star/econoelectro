import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveProducts } from "@/lib/commerce";
import { buildMetadata } from "@/lib/seo/metadata";
import { href } from "@/lib/i18n/routes";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ShopView, type SearchParams } from "@/components/shop/ShopView";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.seo.shopTitle, description: dict.seo.shopDescription, route: "shop" });
}

export default async function ShopPage({ params, searchParams }: { params: Params; searchParams: Promise<SearchParams> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const products = await getActiveProducts();
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.shop.title }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="text-h1">{dict.shop.heading}</h1>
        <p className="text-lead mt-3 text-ink-soft">{dict.shop.intro}</p>
      </header>
      <div className="mt-8">
        <ShopView products={products} locale={locale} searchParams={sp} listName="shop" />
      </div>
    </div>
  );
}
