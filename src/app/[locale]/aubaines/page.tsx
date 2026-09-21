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
  return buildMetadata({ locale, title: dict.deals.seoTitle, description: dict.deals.seoDescription, route: "deals" });
}

export default async function DealsPage({ params, searchParams }: { params: Params; searchParams: Promise<SearchParams> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const sp = await searchParams;
  const dict = getDictionary(locale);
  const products = await getActiveProducts();
  const deals = products.filter((p) => p.sale || p.badges.includes("sale") || p.featured);
  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs ariaLabel={dict.a11y.breadcrumb} items={[{ label: dict.nav.home, href: href(locale, "home") }, { label: dict.deals.heading }]} />
      <header className="mt-4 max-w-2xl">
        <h1 className="text-h1">{dict.deals.heading}</h1>
        <p className="text-lead mt-3 text-ink-soft">{dict.deals.intro}</p>
      </header>
      <div className="mt-8">
        {deals.length ? <ShopView products={deals} locale={locale} searchParams={{ ...sp, tri: sp.tri ?? "best-value" }} listName="deals" /> : <p className="rounded-lg border border-line bg-surface p-6 text-ink-soft">{dict.deals.empty}</p>}
      </div>
    </div>
  );
}
