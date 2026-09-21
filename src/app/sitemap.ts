import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { href, policySlugs, type PolicyId, type RouteKey } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getActiveProducts } from "@/lib/commerce";
import { CATEGORIES } from "@/config/site";
import { WARRANTY } from "@/config/business";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();
  const now = new Date();
  const entry = (route: RouteKey, params: Parameters<typeof href>[2], priority: number, lastModified: Date = now, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(href("fr", route, params)),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l === "fr" ? "fr-CA" : "en-CA", absoluteUrl(href(l, route, params))])) },
  });
  const staticRoutes: [RouteKey, number][] = [["home", 1], ["shop", 0.9], ["deals", 0.8], ["about", 0.5], ["reviews", 0.5], ["locations", 0.7], ["contact", 0.6]];
  return [
    ...staticRoutes.map(([r, p]) => entry(r, undefined, p)),
    ...CATEGORIES.map((c) => entry("category", { category: c.id }, 0.8)),
    ...products.map((p) => entry("product", { slug: p.slug }, 0.7, new Date(p.createdAt), "daily")),
    ...(Object.keys(policySlugs) as PolicyId[]).filter((p) => p !== "warranty" || WARRANTY.confirmed).map((p) => entry("policy", { policy: p }, 0.3, now, "yearly")),
  ];
}
