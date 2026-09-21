import { defaultLocale, isLocale, type Locale } from "./config";
import type { CategoryId } from "@/lib/commerce/types";

export type RouteKey =
  | "home"
  | "shop"
  | "category"
  | "product"
  | "deals"
  | "about"
  | "reviews"
  | "locations"
  | "contact"
  | "cart"
  | "checkout"
  | "checkoutConfirmation"
  | "policy"
  | "unknown";

/** Public URL segment per locale. Internal file-system routes use the French segments. */
export const routeSegments: Record<RouteKey, Record<Locale, string>> = {
  home: { fr: "", en: "" },
  shop: { fr: "boutique", en: "shop" },
  category: { fr: "categorie", en: "category" },
  product: { fr: "produits", en: "products" },
  deals: { fr: "aubaines", en: "deals" },
  about: { fr: "a-propos", en: "about" },
  reviews: { fr: "avis", en: "reviews" },
  locations: { fr: "succursales", en: "locations" },
  contact: { fr: "contact", en: "contact" },
  cart: { fr: "panier", en: "cart" },
  checkout: { fr: "commande", en: "checkout" },
  checkoutConfirmation: { fr: "commande/confirmation", en: "checkout/confirmation" },
  policy: { fr: "politiques", en: "policies" },
  unknown: { fr: "", en: "" },
};

export const categorySlugs: Record<CategoryId, Record<Locale, string>> = {
  refrigerateurs: { fr: "refrigerateurs", en: "refrigerators" },
  cuisinieres: { fr: "cuisinieres", en: "ranges" },
  "laveuses-secheuses": { fr: "laveuses-secheuses", en: "washers-dryers" },
  ensembles: { fr: "ensembles", en: "appliance-sets" },
  autres: { fr: "autres", en: "other-appliances" },
};

export type PolicyId = "delivery" | "returns" | "warranty" | "privacy" | "terms";
export const policySlugs: Record<PolicyId, Record<Locale, string>> = {
  delivery: { fr: "livraison", en: "delivery" },
  returns: { fr: "retours", en: "returns" },
  warranty: { fr: "garantie", en: "warranty" },
  privacy: { fr: "confidentialite", en: "privacy" },
  terms: { fr: "conditions", en: "terms" },
};

export interface RouteParams {
  category?: CategoryId;
  slug?: string;
  policy?: PolicyId;
  /** Raw path for unknown routes (kept so 404s stay 404s). */
  rest?: string;
  query?: Record<string, string | number | undefined>;
}

function prefix(locale: Locale): string {
  return locale === defaultLocale ? "" : `/${locale}`;
}

/** Build a public, localized href. */
export function href(locale: Locale, key: RouteKey, params: RouteParams = {}): string {
  let path = "";
  switch (key) {
    case "home":
      path = "";
      break;
    case "category":
      path = `/${routeSegments.category[locale]}/${params.category ? categorySlugs[params.category][locale] : ""}`;
      break;
    case "product":
      path = `/${routeSegments.product[locale]}/${params.slug ?? ""}`;
      break;
    case "policy":
      path = `/${routeSegments.policy[locale]}/${params.policy ? policySlugs[params.policy][locale] : ""}`;
      break;
    case "unknown":
      path = `/${params.rest ?? ""}`;
      break;
    default:
      path = `/${routeSegments[key][locale]}`;
  }
  let url = `${prefix(locale)}${path}` || "/";
  if (params.query) {
    const qs = Object.entries(params.query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }
  return url;
}

export function categoryIdFromSlug(slug: string, locale?: Locale): CategoryId | null {
  for (const [id, slugs] of Object.entries(categorySlugs) as [CategoryId, Record<Locale, string>][]) {
    if (locale ? slugs[locale] === slug : slugs.fr === slug || slugs.en === slug) return id;
  }
  return null;
}

export function policyIdFromSlug(slug: string, locale?: Locale): PolicyId | null {
  for (const [id, slugs] of Object.entries(policySlugs) as [PolicyId, Record<Locale, string>][]) {
    if (locale ? slugs[locale] === slug : slugs.fr === slug || slugs.en === slug) return id;
  }
  return null;
}

export interface ParsedPath {
  locale: Locale;
  key: RouteKey;
  params: RouteParams;
  /** Trailing "opengraph-image" segment (Next.js file convention) */
  ogImage?: boolean;
}

/** Parse a public pathname into a route key + params (used by the language switcher and the proxy). */
export function parsePublicPath(pathname: string): ParsedPath {
  const segments = pathname.split("/").filter(Boolean);
  let locale: Locale = defaultLocale;
  if (segments.length && isLocale(segments[0])) {
    locale = segments[0];
    segments.shift();
  }
  let ogImage = false;
  if (segments[segments.length - 1] === "opengraph-image") {
    ogImage = true;
    segments.pop();
  }
  if (segments.length === 0) return { locale, key: "home", params: {}, ogImage };
  const [first, second, third] = segments;
  const match = (key: RouteKey) => routeSegments[key][locale] === first || routeSegments[key].fr === first;
  if (match("checkout") && second === "confirmation") return { locale, key: "checkoutConfirmation", params: {} };
  const unknown: ParsedPath = { locale, key: "unknown", params: { rest: [...segments, ...(ogImage ? ["opengraph-image"] : [])].join("/") } };
  if (match("category")) {
    const category = categoryIdFromSlug(second ?? "");
    return category && !third ? { locale, key: "category", params: { category }, ogImage } : unknown;
  }
  if (match("product")) return second && !third ? { locale, key: "product", params: { slug: second }, ogImage } : unknown;
  if (match("policy")) {
    const policy = policyIdFromSlug(second ?? "");
    return policy && !third ? { locale, key: "policy", params: { policy }, ogImage } : unknown;
  }
  if (segments.length === 1) {
    for (const key of Object.keys(routeSegments) as RouteKey[]) {
      if (key === "home" || key === "category" || key === "product" || key === "policy" || key === "checkoutConfirmation" || key === "unknown") continue;
      if (match(key)) return { locale, key, params: {}, ogImage };
    }
  }
  return unknown;
}

/** Internal (file-system) path for a public path — the proxy uses this to rewrite EN URLs. */
export function toInternalPath(pathname: string): string {
  const parsed = parsePublicPath(pathname);
  const { locale, key, params, ogImage } = parsed;
  const seg = (k: RouteKey) => routeSegments[k].fr;
  let internal = "";
  switch (key) {
    case "home":
      internal = "";
      break;
    case "category":
      internal = `/${seg("category")}/${params.category ?? ""}`;
      break;
    case "product":
      internal = `/${seg("product")}/${params.slug ?? ""}`;
      break;
    case "policy":
      internal = `/${seg("policy")}/${params.policy ? policySlugs[params.policy].fr : ""}`;
      break;
    case "unknown":
      internal = `/${params.rest ?? ""}`; // unmatched paths keep their segments so Next serves a real 404
      break;
    default:
      internal = `/${seg(key)}`;
  }
  if (ogImage && key !== "unknown") internal = `${internal.replace(/\/$/, "")}/opengraph-image`;
  return `/${locale}${internal}`;
}

/** Same page in the other locale. */
export function switchLocalePath(pathname: string, to: Locale, search = ""): string {
  const { key, params } = parsePublicPath(pathname);
  if (key === "unknown") return href(to, "home");
  return href(to, key, params) + search;
}
