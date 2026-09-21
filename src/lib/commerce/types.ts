import type { LocationId } from "@/config/business";

export type Locale = "fr" | "en";
export type Localized = Record<Locale, string>;

export type CategoryId =
  | "refrigerateurs"
  | "cuisinieres"
  | "laveuses-secheuses"
  | "ensembles"
  | "autres";

export type Condition = "refurbished" | "new" | "open-box";

/** Transparent condition grades for refurbished units. Definitions live in the locale files. */
export type ConditionGrade = "like-new" | "very-good" | "good" | "cosmetic";

export type Finish = "stainless" | "white" | "black" | "grey" | "slate";

export type BadgeId =
  | "new-arrival"
  | "best-seller"
  | "sale"
  | "limited-stock"
  | "available-today";

export type ProductStatus = "active" | "draft" | "archived";

/** unique = one physical unit; multiple = a small known quantity; continue = not inventory-tracked (gift cards). */
export type InventoryPolicy = "unique" | "multiple" | "continue";

export interface ProductImage {
  src: string;
  alt: Localized;
  width: number;
  height: number;
}

export interface ProductSpecification {
  label: Localized;
  value: Localized;
}

export interface ProductVariant {
  id: string;
  label: Localized;
  price: number;
}

export interface ProductDimensions {
  widthIn: number | null;
  heightIn: number | null;
  depthIn: number | null;
}

export interface Product {
  id: string;
  slug: string;
  sku: string | null;
  status: ProductStatus;
  title: Localized;
  shortDescription: Localized;
  description: Localized;
  category: CategoryId;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  condition: Condition;
  conditionGrade: ConditionGrade | null;
  conditionNotes: Localized;
  price: number;
  compareAtPrice: number | null;
  /** Price shown as "à partir de" — several units, exact price confirmed per unit. */
  priceFrom: boolean;
  currency: "CAD";
  dimensions: ProductDimensions | null;
  /** Nominal width in inches (33, 36…) used for filters. */
  width: number | null;
  color: Localized | null;
  finish: Finish | null;
  images: ProductImage[];
  quantity: number;
  inventoryPolicy: InventoryPolicy;
  locationId: LocationId | null;
  featured: boolean;
  newArrival: boolean;
  sale: boolean;
  deliveryEligible: boolean;
  pickupEligible: boolean;
  /** Warranty text from the source listing. Displayed only when WARRANTY.confirmed is true. */
  warranty: string | null;
  specifications: ProductSpecification[];
  includes: Localized[];
  variants: ProductVariant[];
  seoTitle: Localized;
  seoDescription: Localized;
  badges: BadgeId[];
  /** false for "à partir de" listings where the unit price must be confirmed. */
  purchasable: boolean;
  createdAt: string;
  source: {
    provider: "hostinger";
    originalId: string;
    originalName: string;
    originalSlug: string;
    originalUrl: string;
  };
  reviewFlags: string[];
}

export type Availability = "in-stock" | "low-stock" | "out-of-stock" | "on-request";

export function getAvailability(p: Product): Availability {
  if (p.status !== "active") return "out-of-stock";
  if (p.inventoryPolicy === "continue") return "in-stock";
  if (p.quantity <= 0) return "out-of-stock";
  if (!p.purchasable) return "on-request";
  if (p.inventoryPolicy === "unique" || p.quantity <= 2) return "low-stock";
  return "in-stock";
}

export type FulfillmentMethod = "pickup" | "delivery";

export interface CartLine {
  id: string; // line id
  productId: string;
  variantId: string | null;
  quantity: number;
  fulfillment: FulfillmentMethod;
  pickupLocationId: LocationId | null;
}

export interface CartLineWithProduct extends CartLine {
  product: Product;
  unitPrice: number;
  lineTotal: number;
}

export interface Cart {
  id: string;
  /** Opaque provider token persisted by the API layer (cookie). */
  token: string;
  lines: CartLineWithProduct[];
  subtotal: number;
  currency: "CAD";
  itemCount: number;
  /** Hosted checkout URL when the provider supports it (Shopify). */
  checkoutUrl: string | null;
  provider: "local" | "shopify";
}

export interface CartAddInput {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  fulfillment?: FulfillmentMethod;
  pickupLocationId?: LocationId | null;
}

export interface CartUpdateInput {
  lineId: string;
  quantity?: number;
  fulfillment?: FulfillmentMethod;
  pickupLocationId?: LocationId | null;
}

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-value"
  | "availability";

export interface CatalogFilters {
  q?: string;
  category?: CategoryId | null;
  subcategory?: string | null;
  brands?: string[];
  conditions?: (Condition | ConditionGrade)[];
  priceMin?: number | null;
  priceMax?: number | null;
  widths?: number[];
  finishes?: Finish[];
  availability?: Availability[];
  locations?: LocationId[];
  onSale?: boolean;
  sort?: SortKey;
}

export interface CatalogResult {
  products: Product[];
  total: number;
  facets: {
    brands: { value: string; count: number }[];
    finishes: { value: Finish; count: number }[];
    widths: { value: number; count: number }[];
    locations: { value: LocationId; count: number }[];
    priceRange: { min: number; max: number };
  };
}

/** Provider-agnostic commerce interface. UI code only depends on this. */
export interface CommerceProvider {
  readonly name: "local" | "shopify";
  getProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getCart(cartId: string | null): Promise<Cart | null>;
  createCart(): Promise<Cart>;
  addToCart(cartId: string | null, input: CartAddInput): Promise<Cart>;
  updateCartLine(cartId: string, input: CartUpdateInput): Promise<Cart>;
  removeCartLine(cartId: string, lineId: string): Promise<Cart>;
  /** Returns a hosted checkout URL, or null when checkout is not live. */
  getCheckoutUrl(cartId: string, utm?: Record<string, string>): Promise<string | null>;
  /** true when payment can actually be completed. */
  isCheckoutLive(): boolean;
}
