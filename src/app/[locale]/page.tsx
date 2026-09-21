import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveProducts } from "@/lib/commerce";
import { sortProducts } from "@/lib/commerce/catalog";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, localBusinessJsonLd } from "@/lib/seo/jsonld";
import { LOCATIONS } from "@/config/business";
import { FEATURED_LIMIT } from "@/config/site";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedDeals } from "@/components/home/FeaturedDeals";
import { TrustBar } from "@/components/home/TrustBar";
import { PromoSplit } from "@/components/home/PromoSplit";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { LocationsSection } from "@/components/home/LocationsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  return buildMetadata({ locale, title: dict.seo.homeTitle, description: dict.seo.homeDescription, route: "home" });
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "fr";
  const products = await getActiveProducts();
  const withPhotos = products.filter((p) => p.images.length > 0);
  const featured = sortProducts(withPhotos.filter((p) => p.featured), "featured");
  const fill = sortProducts(withPhotos.filter((p) => !p.featured && p.sale), "best-value");
  const deals = [...featured, ...fill].slice(0, FEATURED_LIMIT);
  const promo = deals.find((p) => p.sale && p.compareAtPrice && p.purchasable) ?? deals.find((p) => p.purchasable) ?? null;

  return (
    <>
      {LOCATIONS.map((l) => (
        <JsonLd key={l.id} data={localBusinessJsonLd(l, locale)} />
      ))}
      <Hero locale={locale} promo={promo} />
      <CategoryGrid locale={locale} />
      <FeaturedDeals locale={locale} products={deals} />
      <TrustBar locale={locale} />
      <PromoSplit locale={locale} />
      <HowItWorks locale={locale} />
      <ReviewsSection locale={locale} />
      <LocationsSection locale={locale} />
      <NewsletterSection locale={locale} />
    </>
  );
}
