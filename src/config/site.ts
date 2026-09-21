import type { CategoryId, ConditionGrade, BadgeId, SortKey } from "@/lib/commerce/types";

export interface CategoryDef {
  id: CategoryId;
  /** Real store photo used for category cards and headers */
  image: { src: string; width: number; height: number };
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = [
  { id: "refrigerateurs", image: { src: "/images/store/fridge-white-lg.webp", width: 765, height: 1020 }, subcategories: ["portes-francaises", "congelateur-bas", "congelateur-haut", "cote-a-cote"] },
  { id: "cuisinieres", image: { src: "/images/store/ranges-row.webp", width: 765, height: 1020 }, subcategories: ["electrique", "induction", "double-four"] },
  { id: "laveuses-secheuses", image: { src: "/images/store/washers-front-load.webp", width: 765, height: 1020 }, subcategories: ["ensemble-laveuse-secheuse", "laveuse", "secheuse", "compact"] },
  { id: "ensembles", image: { src: "/images/store/laundry-set-stacked.webp", width: 765, height: 1020 }, subcategories: ["4-appareils", "3-appareils"] },
  { id: "autres", image: { src: "/images/products/01m0jyf459f19xd8xstvwzva97/1.webp", width: 1200, height: 1600 }, subcategories: ["congelateur", "lave-vaisselle", "carte-cadeau"] },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

/** Six homepage category cards (washers / dryers point into the laundry category with a type filter). */
export interface HomeCategoryCard {
  key: "refrigerators" | "ranges" | "washers" | "dryers" | "sets" | "other";
  category: CategoryId;
  type?: string;
  image: { src: string; width: number; height: number };
}
export const HOME_CATEGORY_CARDS: HomeCategoryCard[] = [
  { key: "refrigerators", category: "refrigerateurs", image: { src: "/images/store/fridge-white-lg.webp", width: 765, height: 1020 } },
  { key: "ranges", category: "cuisinieres", image: { src: "/images/store/ranges-row.webp", width: 765, height: 1020 } },
  { key: "washers", category: "laveuses-secheuses", type: "laveuse", image: { src: "/images/store/washers-front-load.webp", width: 765, height: 1020 } },
  { key: "dryers", category: "laveuses-secheuses", type: "secheuse", image: { src: "/images/store/dryer-red-lg.webp", width: 765, height: 1020 } },
  { key: "sets", category: "ensembles", image: { src: "/images/store/laundry-set-stacked.webp", width: 765, height: 1020 } },
  { key: "other", category: "autres", image: { src: "/images/products/01m0jyf459f19xd8xstvwzva97/1.webp", width: 1200, height: 1600 } },
];

export const CONDITION_GRADES: ConditionGrade[] = ["like-new", "very-good", "good", "cosmetic"];

export const BADGE_PRIORITY: BadgeId[] = ["sale", "new-arrival", "available-today", "limited-stock", "best-seller"];

export const SORT_KEYS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "best-value", "availability"];

/** Price buckets for the filter sidebar (CAD). */
export const PRICE_BUCKETS: { min: number | null; max: number | null }[] = [
  { min: null, max: 500 },
  { min: 500, max: 800 },
  { min: 800, max: 1200 },
  { min: 1200, max: null },
];

export const FEATURED_LIMIT = 8;

/** Creatives generated with fal.ai (FLUX 1.1 Pro Ultra) — editorial scenes, not inventory. See docs/CREATIVES.md */
export const CREATIVES = {
  heroSet: { src: "/images/creatives/hero-appliance-set.webp", width: 1611, height: 2000 },
  heroSetWide: { src: "/images/creatives/hero-appliance-set-wide.webp", width: 2000, height: 1116 },
  kitchen: { src: "/images/creatives/kitchen-lifestyle.webp", width: 2000, height: 1514 },
  laundry: { src: "/images/creatives/laundry-lifestyle.webp", width: 2000, height: 1514 },
} as const;

export const STORE_PHOTOS = {
  interiorWide: { src: "/images/store/store-interior-wide.webp", width: 1360, height: 1020 },
  aisle: { src: "/images/store/store-aisle.webp", width: 765, height: 1020 },
  washers: { src: "/images/store/store-washers.webp", width: 765, height: 1020 },
  fridgeOpen: { src: "/images/store/fridge-open.webp", width: 765, height: 1020 },
  team: { src: "/images/store/team.webp", width: 1402, height: 650 },
} as const;
