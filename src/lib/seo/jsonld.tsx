import { BRAND, HOURS, LOCATIONS, REVIEWS, CONTACT_EMAIL, type StoreLocation } from "@/config/business";
import type { Locale } from "@/lib/i18n/config";
import { getAvailability, type Product } from "@/lib/commerce/types";
import { absoluteUrl } from "./metadata";
import { href } from "@/lib/i18n/routes";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: BRAND.name,
    alternateName: BRAND.shortName,
    url: absoluteUrl(href(locale, "home")),
    logo: absoluteUrl("/brand/logo.png"),
    telephone: LOCATIONS.map((l) => l.phoneE164),
    ...(CONTACT_EMAIL.confirmed && CONTACT_EMAIL.value ? { email: CONTACT_EMAIL.value } : {}),
    sameAs: [REVIEWS.url],
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl("/")}#website`,
    url: absoluteUrl(href(locale, "home")),
    name: BRAND.name,
    inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl(href(locale, "shop"))}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessJsonLd(l: StoreLocation, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["Store", "LocalBusiness"],
    "@id": `${absoluteUrl(href(locale, "locations"))}#${l.id}`,
    name: l.name[locale],
    image: absoluteUrl("/images/store/store-interior-wide.webp"),
    url: absoluteUrl(href(locale, "locations")),
    telephone: l.phoneE164,
    priceRange: "$$",
    currenciesAccepted: "CAD",
    parentOrganization: { "@id": `${absoluteUrl("/")}#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address.street,
      addressLocality: l.address.city,
      addressRegion: l.address.province,
      postalCode: l.address.postalCode,
      addressCountry: l.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: l.geo.latitude, longitude: l.geo.longitude },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: HOURS.schemaDays, opens: HOURS.opens, closes: HOURS.closes },
    ],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.mapsQuery)}`,
  };
}

export function productJsonLd(p: Product, locale: Locale) {
  const availability = getAvailability(p);
  const schemaAvailability =
    availability === "out-of-stock"
      ? "https://schema.org/SoldOut"
      : availability === "low-stock"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";
  const condition = p.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition";
  const url = absoluteUrl(href(locale, "product", { slug: p.slug }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.title[locale] || p.title.fr,
    description: p.seoDescription[locale] || p.shortDescription[locale] || p.description[locale],
    image: p.images.map((im) => absoluteUrl(im.src)),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.model ? { model: p.model } : {}),
    ...(p.sku ? { sku: p.sku } : {}),
    category: p.category,
    ...(p.width ? { width: { "@type": "QuantitativeValue", value: p.width, unitCode: "INH" } } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "CAD",
      price: p.price,
      ...(p.priceFrom ? { priceSpecification: { "@type": "PriceSpecification", minPrice: p.price, priceCurrency: "CAD" } } : {}),
      availability: schemaAvailability,
      itemCondition: condition,
      seller: { "@id": `${absoluteUrl("/")}#organization` },
      ...(p.locationId ? { availableAtOrFrom: { "@id": `${absoluteUrl(href(locale, "locations"))}#${p.locationId}` } } : {}),
    },
  };
}
