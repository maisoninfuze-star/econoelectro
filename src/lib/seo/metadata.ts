import type { Metadata } from "next";
import { defaultLocale, htmlLang, ogLocale, type Locale } from "@/lib/i18n/config";
import { href, type RouteKey, type RouteParams } from "@/lib/i18n/routes";
import { BRAND } from "@/config/business";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || BRAND.domain).replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface PageMeta {
  locale: Locale;
  title: string;
  description: string;
  route: RouteKey;
  params?: RouteParams;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  noIndex?: boolean;
  type?: "website" | "article";
}

/** Localized metadata with canonical + hreflang alternates and Open Graph. */
export function buildMetadata(meta: PageMeta): Metadata {
  const canonicalPath = href(meta.locale, meta.route, meta.params);
  const languages: Record<string, string> = {
    [htmlLang.fr]: absoluteUrl(href("fr", meta.route, meta.params)),
    [htmlLang.en]: absoluteUrl(href("en", meta.route, meta.params)),
    "x-default": absoluteUrl(href(defaultLocale, meta.route, meta.params)),
  };
  const image = meta.image
    ? [{ url: absoluteUrl(meta.image.url), width: meta.image.width ?? 1200, height: meta.image.height ?? 630, alt: meta.image.alt ?? meta.title }]
    : [{ url: absoluteUrl(`${meta.locale === defaultLocale ? "" : `/${meta.locale}`}/opengraph-image`), width: 1200, height: 630, alt: meta.title }];
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: absoluteUrl(canonicalPath), languages },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: absoluteUrl(canonicalPath),
      siteName: BRAND.name,
      locale: ogLocale[meta.locale],
      alternateLocale: [ogLocale[meta.locale === "fr" ? "en" : "fr"]],
      type: meta.type ?? "website",
      images: image,
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: image.map((i) => i.url) },
    robots: meta.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
