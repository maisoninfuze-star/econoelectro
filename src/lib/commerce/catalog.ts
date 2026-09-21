import { normalizeText, percentOff } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import {
  getAvailability,
  type Availability,
  type CatalogFilters,
  type CatalogResult,
  type Finish,
  type Product,
  type SortKey,
} from "./types";
import type { LocationId } from "@/config/business";

/** Bilingual synonym groups: a query token matches if any word of its group appears in the product text. */
const SYNONYM_GROUPS: string[][] = [
  ["refrigerateur", "refrigerateurs", "frigo", "frigos", "fridge", "fridges", "refrigerator", "refrigerators", "refrig"],
  ["cuisiniere", "cuisinieres", "poele", "poeles", "stove", "stoves", "range", "ranges", "four", "oven", "cooker"],
  ["laveuse", "laveuses", "washer", "washers", "lavage", "washing"],
  ["secheuse", "secheuses", "dryer", "dryers"],
  ["ensemble", "ensembles", "set", "sets", "pack", "package", "bundle", "kit", "combo"],
  ["congelateur", "congelateurs", "freezer", "freezers"],
  ["lave-vaisselle", "lavevaisselle", "dishwasher", "dishwashers"],
  ["inox", "inoxydable", "stainless", "acier", "steel"],
  ["blanc", "blanche", "blancs", "white"],
  ["gris", "grise", "grey", "gray"],
  ["noir", "noire", "black"],
  ["compact", "compacte", "compacts", "mini", "petit", "petite", "small", "apartment", "appartement", "condo"],
  ["portes", "door", "doors", "francaises", "french"],
  ["double", "dual"],
  ["electrique", "electric"],
  ["induction"],
  ["carte-cadeau", "cadeau", "gift", "giftcard"],
  ["aubaine", "aubaines", "deal", "deals", "rabais", "solde", "promo", "promotion", "sale"],
  ["neuf", "new", "nouveau", "arrivage", "arrival"],
];

const synonymIndex = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) for (const w of group) synonymIndex.set(w, group);

function expandToken(token: string): string[] {
  const t = normalizeText(token);
  const group = synonymIndex.get(t);
  if (group) return group;
  // prefix match against synonym keys (e.g. "frig" → refrigerateur group)
  if (t.length >= 4) {
    for (const [k, g] of synonymIndex) if (k.startsWith(t)) return g;
  }
  return [t];
}

export function searchableText(p: Product): { title: string; body: string } {
  const fr = getDictionary("fr");
  const en = getDictionary("en");
  const cat = p.category;
  const sub = p.subcategory;
  const title = normalizeText([p.title.fr, p.title.en, p.brand ?? "", p.model ?? ""].join(" "));
  const body = normalizeText(
    [
      fr.categories[cat].name,
      en.categories[cat].name,
      sub ? (fr.subcategories as Record<string, string>)[sub] ?? "" : "",
      sub ? (en.subcategories as Record<string, string>)[sub] ?? "" : "",
      p.finish ? `${fr.shop.finishes[p.finish]} ${en.shop.finishes[p.finish]}` : "",
      p.color ? `${p.color.fr} ${p.color.en}` : "",
      p.width ? `${p.width} po ${p.width} in` : "",
      p.shortDescription.fr,
      p.shortDescription.en,
      p.sale ? "aubaine deal rabais" : "",
      p.newArrival ? "nouveau arrivage new arrival" : "",
    ].join(" "),
  );
  return { title, body };
}

function tokenMatches(words: string[], haystack: string): boolean {
  const hay = ` ${haystack} `;
  return words.some((w) => {
    if (w.length < 3) return hay.includes(` ${w} `);
    return hay.includes(` ${w}`) || hay.includes(`${w} `) || haystack.includes(w);
  });
}

/** Returns a relevance score (0 = no match). */
export function searchScore(p: Product, query: string): number {
  const q = normalizeText(query);
  if (!q) return 1;
  const tokens = q.split(" ").filter(Boolean);
  const { title, body } = searchableText(p);
  let score = 0;
  for (const token of tokens) {
    const words = expandToken(token);
    const inTitle = tokenMatches(words, title);
    const inBody = tokenMatches(words, body);
    if (!inTitle && !inBody) return 0; // every token must match
    score += inTitle ? 3 : 1;
  }
  if (title.includes(q)) score += 5;
  return score;
}

const AVAILABILITY_RANK: Record<Availability, number> = { "in-stock": 0, "low-stock": 1, "on-request": 2, "out-of-stock": 3 };

export function sortProducts(products: Product[], sort: SortKey = "featured"): Product[] {
  const arr = [...products];
  const byDate = (a: Product, b: Product) => Date.parse(b.createdAt) - Date.parse(a.createdAt);
  switch (sort) {
    case "newest":
      return arr.sort(byDate);
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price || byDate(a, b));
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price || byDate(a, b));
    case "best-value":
      return arr.sort(
        (a, b) => (percentOff(b.price, b.compareAtPrice) ?? 0) - (percentOff(a.price, a.compareAtPrice) ?? 0) || a.price - b.price,
      );
    case "availability":
      return arr.sort((a, b) => AVAILABILITY_RANK[getAvailability(a)] - AVAILABILITY_RANK[getAvailability(b)] || byDate(a, b));
    case "featured":
    default:
      return arr.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          AVAILABILITY_RANK[getAvailability(a)] - AVAILABILITY_RANK[getAvailability(b)] ||
          Number(b.images.length > 0) - Number(a.images.length > 0) ||
          byDate(a, b),
      );
  }
}

function matchesType(p: Product, type: string | null | undefined): boolean {
  if (!type) return true;
  if (type === "laveuse") return p.subcategory === "laveuse" || p.subcategory === "ensemble-laveuse-secheuse";
  if (type === "secheuse") return p.subcategory === "secheuse" || p.subcategory === "ensemble-laveuse-secheuse";
  return p.subcategory === type;
}

export function filterProducts(all: Product[], f: CatalogFilters): Product[] {
  return all.filter((p) => {
    if (p.status !== "active") return false;
    if (f.category && p.category !== f.category) return false;
    if (!matchesType(p, f.subcategory)) return false;
    if (f.brands?.length && !(p.brand && f.brands.includes(p.brand))) return false;
    if (f.conditions?.length) {
      const ok = f.conditions.some((c) => c === p.condition || c === p.conditionGrade);
      if (!ok) return false;
    }
    if (f.priceMin != null && p.price < f.priceMin) return false;
    if (f.priceMax != null && p.price > f.priceMax) return false;
    if (f.widths?.length && !(p.width && f.widths.includes(p.width))) return false;
    if (f.finishes?.length && !(p.finish && f.finishes.includes(p.finish))) return false;
    if (f.availability?.length && !f.availability.includes(getAvailability(p))) return false;
    if (f.locations?.length && !(p.locationId && f.locations.includes(p.locationId))) return false;
    if (f.onSale && !p.sale) return false;
    if (f.q && searchScore(p, f.q) === 0) return false;
    return true;
  });
}

export function queryCatalog(all: Product[], f: CatalogFilters): CatalogResult {
  const filtered = filterProducts(all, f);
  let products = f.q
    ? [...filtered].sort((a, b) => searchScore(b, f.q!) - searchScore(a, f.q!))
    : filtered;
  if (!f.q || (f.sort && f.sort !== "featured")) products = sortProducts(products, f.sort);

  // Facets are computed on the category/search scope so counts stay useful.
  const scope = filterProducts(all, { category: f.category, subcategory: f.subcategory, q: f.q });
  const count = <T>(items: (T | null)[]) => {
    const m = new Map<T, number>();
    for (const i of items) if (i != null) m.set(i, (m.get(i) ?? 0) + 1);
    return [...m.entries()].map(([value, c]) => ({ value, count: c }));
  };
  const prices = scope.map((p) => p.price);
  return {
    products,
    total: products.length,
    facets: {
      brands: count(scope.map((p) => p.brand)).sort((a, b) => a.value.localeCompare(b.value)),
      finishes: count(scope.map((p) => p.finish)) as { value: Finish; count: number }[],
      widths: count(scope.map((p) => p.width)).sort((a, b) => a.value - b.value),
      locations: count(scope.map((p) => p.locationId)) as { value: LocationId; count: number }[],
      priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
    },
  };
}

/** Similar products: same category first, then same brand, excluding the product itself. */
export function relatedProducts(all: Product[], p: Product, limit = 4): Product[] {
  const active = all.filter((x) => x.status === "active" && x.id !== p.id && getAvailability(x) !== "out-of-stock");
  const score = (x: Product) =>
    (x.category === p.category ? 4 : 0) +
    (x.subcategory && x.subcategory === p.subcategory ? 2 : 0) +
    (x.brand && x.brand === p.brand ? 1 : 0) +
    (x.finish && x.finish === p.finish ? 1 : 0) -
    Math.abs(x.price - p.price) / 5000;
  return active.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

/** Parse URLSearchParams-like record into CatalogFilters (state lives in the URL). */
export function filtersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
  base: Partial<CatalogFilters> = {},
): CatalogFilters {
  const one = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const many = (k: string) => {
    const v = sp[k];
    if (!v) return [];
    return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
  };
  const num = (k: string) => {
    const v = one(k);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  };
  const sort = one("tri") as SortKey | undefined;
  return {
    q: one("q") ?? undefined,
    category: (one("categorie") as CatalogFilters["category"]) ?? base.category ?? null,
    subcategory: one("type") ?? base.subcategory ?? null,
    brands: many("marque"),
    conditions: many("etat") as CatalogFilters["conditions"],
    priceMin: num("prix_min"),
    priceMax: num("prix_max"),
    widths: many("largeur").map(Number).filter((n) => Number.isFinite(n)),
    finishes: many("fini") as Finish[],
    availability: many("dispo") as Availability[],
    locations: many("succursale") as LocationId[],
    onSale: one("aubaines") === "1" || base.onSale === true,
    sort: sort && ["featured", "newest", "price-asc", "price-desc", "best-value", "availability"].includes(sort) ? sort : "featured",
  };
}

export function localeForProductTitle(p: Product, locale: Locale): string {
  return p.title[locale] || p.title.fr;
}
