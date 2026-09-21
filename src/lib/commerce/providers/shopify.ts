import type { LocationId } from "@/config/business";
import {
  getAvailability,
  type Cart,
  type CartAddInput,
  type CartLineWithProduct,
  type CartUpdateInput,
  type CategoryId,
  type CommerceProvider,
  type Condition,
  type ConditionGrade,
  type Finish,
  type FulfillmentMethod,
  type Product,
} from "../types";
import { CommerceError } from "./local";

/**
 * Shopify Storefront API provider.
 *
 * Catalog, inventory, cart and hosted checkout come from Shopify. Product
 * attributes that Shopify does not model natively are read from metafields in
 * the "econo" namespace (see docs/SHOPIFY-SETUP.md for the full list):
 *   econo.title_en, econo.description_en, econo.short_description_fr/en,
 *   econo.category (refrigerateurs|cuisinieres|laveuses-secheuses|ensembles|autres),
 *   econo.subcategory, econo.model, econo.condition (refurbished|new|open-box),
 *   econo.condition_grade (like-new|very-good|good|cosmetic), econo.condition_notes_fr/en,
 *   econo.width_in, econo.height_in, econo.depth_in, econo.finish, econo.color_fr/en,
 *   econo.location (vimont|chomedey), econo.featured, econo.new_arrival,
 *   econo.delivery_eligible, econo.pickup_eligible, econo.price_from, econo.purchasable,
 *   econo.specifications (JSON), econo.includes (JSON)
 * The "vendor" field is the brand. Compare-at prices and quantities are native.
 */

const METAFIELD_KEYS = [
  "title_en", "description_en", "short_description_fr", "short_description_en", "category", "subcategory",
  "model", "condition", "condition_grade", "condition_notes_fr", "condition_notes_en", "width_in", "height_in",
  "depth_in", "finish", "color_fr", "color_en", "location", "featured", "new_arrival", "delivery_eligible",
  "pickup_eligible", "price_from", "purchasable", "specifications", "includes", "warranty",
];

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    descriptionHtml
    description
    vendor
    createdAt
    availableForSale
    totalInventory
    tags
    featuredImage { url width height altText }
    images(first: 12) { nodes { url width height altText } }
    variants(first: 10) {
      nodes {
        id
        title
        sku
        availableForSale
        quantityAvailable
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
    metafields(identifiers: [${METAFIELD_KEYS.map((k) => `{namespace: "econo", key: "${k}"}`).join(",")}]) {
      key
      value
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { subtotalAmount { amount currencyCode } }
    lines(first: 50) {
      nodes {
        id
        quantity
        attributes { key value }
        merchandise {
          ... on ProductVariant {
            id
            price { amount }
            product { ...ProductFields }
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

interface ShopifyImage { url: string; width: number; height: number; altText: string | null }
interface ShopifyVariant {
  id: string; title: string; sku: string | null; availableForSale: boolean; quantityAvailable: number | null;
  price: { amount: string }; compareAtPrice: { amount: string } | null;
}
interface ShopifyProduct {
  id: string; handle: string; title: string; descriptionHtml: string; description: string; vendor: string;
  createdAt: string; availableForSale: boolean; totalInventory: number | null; tags: string[];
  featuredImage: ShopifyImage | null; images: { nodes: ShopifyImage[] }; variants: { nodes: ShopifyVariant[] };
  metafields: ({ key: string; value: string } | null)[];
}
interface ShopifyCart {
  id: string; checkoutUrl: string; totalQuantity: number;
  cost: { subtotalAmount: { amount: string } };
  lines: { nodes: { id: string; quantity: number; attributes: { key: string; value: string }[]; merchandise: { id: string; price: { amount: string }; product: ShopifyProduct } }[] };
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new CommerceError("shopify_not_configured", { missing: name });
  return v;
}

async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = env("SHOPIFY_STORE_DOMAIN");
  const token = env("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-07";
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new CommerceError("shopify_http_error", { status: res.status });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new CommerceError("shopify_graphql_error", { errors: json.errors });
  if (!json.data) throw new CommerceError("shopify_empty_response");
  return json.data;
}

function meta(p: ShopifyProduct): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of p.metafields) if (m) out[m.key] = m.value;
  return out;
}
const bool = (v: string | undefined, fallback: boolean) => (v === undefined ? fallback : v === "true" || v === "1");
const num = (v: string | undefined) => (v && Number.isFinite(Number(v)) ? Number(v) : null);
const json = <T,>(v: string | undefined, fallback: T): T => { try { return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; } };

export function mapShopifyProduct(p: ShopifyProduct): Product {
  const m = meta(p);
  const variant = p.variants.nodes[0];
  const price = variant ? Number(variant.price.amount) : 0;
  const compareAt = variant?.compareAtPrice ? Number(variant.compareAtPrice.amount) : null;
  const quantity = p.totalInventory ?? variant?.quantityAvailable ?? (p.availableForSale ? 1 : 0);
  const titleFr = p.title;
  const titleEn = m.title_en || p.title;
  const images = (p.images.nodes.length ? p.images.nodes : p.featuredImage ? [p.featuredImage] : []).map((im, i) => ({
    src: im.url,
    alt: { fr: im.altText || `${titleFr} – photo ${i + 1}`, en: im.altText || `${titleEn} – photo ${i + 1}` },
    width: im.width || 1200,
    height: im.height || 1600,
  }));
  const category = (m.category as CategoryId) || "autres";
  const sale = compareAt != null && compareAt > price;
  const isGiftCard = p.tags.includes("gift-card") || m.subcategory === "carte-cadeau";
  return {
    id: p.id,
    slug: p.handle,
    sku: variant?.sku ?? null,
    status: "active",
    title: { fr: titleFr, en: titleEn },
    shortDescription: { fr: m.short_description_fr ?? "", en: m.short_description_en ?? "" },
    description: { fr: p.description, en: m.description_en || p.description },
    category,
    subcategory: m.subcategory ?? null,
    brand: p.vendor || null,
    model: m.model ?? null,
    condition: (m.condition as Condition) || "refurbished",
    conditionGrade: (m.condition_grade as ConditionGrade) || null,
    conditionNotes: { fr: m.condition_notes_fr ?? "", en: m.condition_notes_en ?? "" },
    price,
    compareAtPrice: compareAt,
    priceFrom: bool(m.price_from, false),
    currency: "CAD",
    dimensions: m.width_in || m.height_in || m.depth_in ? { widthIn: num(m.width_in), heightIn: num(m.height_in), depthIn: num(m.depth_in) } : null,
    width: num(m.width_in),
    color: m.color_fr || m.color_en ? { fr: m.color_fr ?? m.color_en ?? "", en: m.color_en ?? m.color_fr ?? "" } : null,
    finish: (m.finish as Finish) || null,
    images,
    quantity,
    inventoryPolicy: isGiftCard ? "continue" : quantity > 1 ? "multiple" : "unique",
    locationId: (m.location as LocationId) || null,
    featured: bool(m.featured, p.tags.includes("vedette")),
    newArrival: bool(m.new_arrival, p.tags.includes("nouvel-arrivage")),
    sale,
    deliveryEligible: bool(m.delivery_eligible, !isGiftCard),
    pickupEligible: bool(m.pickup_eligible, !isGiftCard),
    warranty: m.warranty ?? null,
    specifications: json(m.specifications, []),
    includes: json(m.includes, []),
    variants: p.variants.nodes.length > 1 ? p.variants.nodes.map((v) => ({ id: v.id, label: { fr: v.title, en: v.title }, price: Number(v.price.amount) })) : [],
    seoTitle: { fr: `${titleFr} | Écono Électro Laval`, en: `${titleEn} | Écono Électro Laval` },
    seoDescription: { fr: m.short_description_fr ?? p.description.slice(0, 155), en: m.short_description_en ?? p.description.slice(0, 155) },
    badges: [
      ...(sale ? (["sale"] as const) : []),
      ...(bool(m.new_arrival, false) ? (["new-arrival"] as const) : []),
      ...(p.tags.includes("stock-limite") ? (["limited-stock"] as const) : []),
      ...(p.tags.includes("disponible-aujourdhui") ? (["available-today"] as const) : []),
      ...(p.tags.includes("meilleure-vente") ? (["best-seller"] as const) : []),
    ],
    purchasable: bool(m.purchasable, true) && !bool(m.price_from, false),
    createdAt: p.createdAt,
    source: { provider: "hostinger", originalId: "", originalName: "", originalSlug: "", originalUrl: "" },
    reviewFlags: [],
  };
}

function lineAttributes(fulfillment: FulfillmentMethod, pickupLocationId: LocationId | null) {
  return [
    { key: "Réception", value: fulfillment === "pickup" ? "Cueillette en magasin" : "Livraison" },
    ...(pickupLocationId ? [{ key: "Succursale", value: pickupLocationId }] : []),
  ];
}

function mapCart(c: ShopifyCart): Cart {
  const lines: CartLineWithProduct[] = c.lines.nodes.map((l) => {
    const product = mapShopifyProduct(l.merchandise.product);
    const attrs = Object.fromEntries(l.attributes.map((a) => [a.key, a.value]));
    const fulfillment: FulfillmentMethod = attrs["Réception"] === "Livraison" ? "delivery" : "pickup";
    const unit = Number(l.merchandise.price.amount);
    return {
      id: l.id,
      productId: product.id,
      variantId: l.merchandise.id,
      quantity: l.quantity,
      fulfillment,
      pickupLocationId: (attrs["Succursale"] as LocationId) ?? null,
      product,
      unitPrice: unit,
      lineTotal: unit * l.quantity,
    };
  });
  return {
    id: c.id,
    token: c.id,
    lines,
    subtotal: Number(c.cost.subtotalAmount.amount),
    currency: "CAD",
    itemCount: c.totalQuantity,
    checkoutUrl: c.checkoutUrl,
    provider: "shopify",
  };
}

export class ShopifyCommerceProvider implements CommerceProvider {
  readonly name = "shopify" as const;
  private cache: { at: number; products: Product[] } | null = null;

  async getProducts(): Promise<Product[]> {
    if (this.cache && Date.now() - this.cache.at < 60_000) return this.cache.products;
    const products: Product[] = [];
    let cursor: string | null = null;
    do {
      const data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProduct[] } } = await shopifyFetch(
        `query Products($cursor: String) @inContext(country: CA, language: FR) {
          products(first: 100, after: $cursor, query: "status:active") {
            pageInfo { hasNextPage endCursor }
            nodes { ...ProductFields }
          }
        } ${PRODUCT_FRAGMENT}`,
        { cursor },
      );
      products.push(...data.products.nodes.map(mapShopifyProduct));
      cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } while (cursor);
    this.cache = { at: Date.now(), products };
    return products;
  }
  async getProductBySlug(slug: string): Promise<Product | null> {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
      `query ProductByHandle($handle: String!) @inContext(country: CA, language: FR) { product(handle: $handle) { ...ProductFields } } ${PRODUCT_FRAGMENT}`,
      { handle: slug },
    );
    return data.product ? mapShopifyProduct(data.product) : null;
  }
  async getProductById(id: string): Promise<Product | null> {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>(
      `query ProductById($id: ID!) @inContext(country: CA, language: FR) { product(id: $id) { ...ProductFields } } ${PRODUCT_FRAGMENT}`,
      { id },
    );
    return data.product ? mapShopifyProduct(data.product) : null;
  }
  async getCart(token: string | null): Promise<Cart | null> {
    if (!token) return null;
    const data = await shopifyFetch<{ cart: ShopifyCart | null }>(`query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${CART_FRAGMENT}`, { id: token });
    return data.cart ? mapCart(data.cart) : null;
  }
  async createCart(): Promise<Cart> {
    const data = await shopifyFetch<{ cartCreate: { cart: ShopifyCart } }>(
      `mutation CartCreate { cartCreate(input: { buyerIdentity: { countryCode: CA } }) { cart { ...CartFields } } } ${CART_FRAGMENT}`,
    );
    return mapCart(data.cartCreate.cart);
  }
  async addToCart(token: string | null, input: CartAddInput): Promise<Cart> {
    const product = await this.getProductById(input.productId);
    if (!product) throw new CommerceError("product_unavailable");
    if (!product.purchasable) throw new CommerceError("price_on_request");
    if (getAvailability(product) === "out-of-stock") throw new CommerceError("out_of_stock");
    const cart = token ? await this.getCart(token) : null;
    const cartId = cart?.id ?? (await this.createCart()).id;
    const variantId = input.variantId ?? (await this.defaultVariantId(product.id));
    const fulfillment = input.fulfillment ?? "pickup";
    const data = await shopifyFetch<{ cartLinesAdd: { cart: ShopifyCart; userErrors: { message: string }[] } }>(
      `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } } } ${CART_FRAGMENT}`,
      { cartId, lines: [{ merchandiseId: variantId, quantity: input.quantity ?? 1, attributes: lineAttributes(fulfillment, input.pickupLocationId ?? product.locationId ?? null) }] },
    );
    if (data.cartLinesAdd.userErrors.length) throw new CommerceError("quantity_limit", { errors: data.cartLinesAdd.userErrors });
    return mapCart(data.cartLinesAdd.cart);
  }
  private async defaultVariantId(productId: string): Promise<string> {
    const data = await shopifyFetch<{ product: { variants: { nodes: { id: string }[] } } | null }>(
      `query V($id: ID!) { product(id: $id) { variants(first: 1) { nodes { id } } } }`,
      { id: productId },
    );
    const id = data.product?.variants.nodes[0]?.id;
    if (!id) throw new CommerceError("product_unavailable");
    return id;
  }
  async updateCartLine(token: string, input: CartUpdateInput): Promise<Cart> {
    if (input.quantity !== undefined && input.quantity <= 0) return this.removeCartLine(token, input.lineId);
    const line: Record<string, unknown> = { id: input.lineId };
    if (input.quantity !== undefined) line.quantity = input.quantity;
    if (input.fulfillment) line.attributes = lineAttributes(input.fulfillment, input.pickupLocationId ?? null);
    const data = await shopifyFetch<{ cartLinesUpdate: { cart: ShopifyCart; userErrors: { message: string }[] } }>(
      `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { message } } } ${CART_FRAGMENT}`,
      { cartId: token, lines: [line] },
    );
    if (data.cartLinesUpdate.userErrors.length) throw new CommerceError("quantity_limit", { errors: data.cartLinesUpdate.userErrors });
    return mapCart(data.cartLinesUpdate.cart);
  }
  async removeCartLine(token: string, lineId: string): Promise<Cart> {
    const data = await shopifyFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(
      `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } } } ${CART_FRAGMENT}`,
      { cartId: token, lineIds: [lineId] },
    );
    return mapCart(data.cartLinesRemove.cart);
  }
  async getCheckoutUrl(token: string, utm?: Record<string, string>): Promise<string | null> {
    const cart = await this.getCart(token);
    if (!cart?.checkoutUrl) return null;
    const url = new URL(cart.checkoutUrl);
    for (const [k, v] of Object.entries(utm ?? {})) url.searchParams.set(k, v);
    return url.toString();
  }
  isCheckoutLive(): boolean {
    return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  }
}
