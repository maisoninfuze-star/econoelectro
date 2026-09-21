import { LOCAL_PRODUCTS } from "../products-data";
import {
  getAvailability,
  type Cart,
  type CartAddInput,
  type CartLine,
  type CartLineWithProduct,
  type CartUpdateInput,
  type CommerceProvider,
  type Product,
} from "../types";
import { PRIMARY_LOCATION_ID } from "@/config/business";

/**
 * Local (demo) provider.
 * Catalog: src/data/products.json. Cart: serialized in the opaque token
 * (base64 JSON) that the API layer stores in a cookie. Checkout: NOT live.
 */

interface LocalCartState {
  id: string;
  lines: CartLine[];
}

function encode(state: LocalCartState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}
function decode(token: string | null): LocalCartState | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as LocalCartState;
    if (!parsed || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function unitPrice(p: Product, variantId: string | null): number {
  if (variantId && p.variants.length) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return v.price;
  }
  return p.price;
}

function maxQuantity(p: Product): number {
  if (p.inventoryPolicy === "continue") return 10;
  return Math.max(0, p.quantity);
}

function build(state: LocalCartState): Cart {
  const lines: CartLineWithProduct[] = [];
  for (const line of state.lines) {
    const product = LOCAL_PRODUCTS.find((p) => p.id === line.productId);
    if (!product || product.status !== "active") continue;
    const price = unitPrice(product, line.variantId);
    lines.push({ ...line, product, unitPrice: price, lineTotal: price * line.quantity });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  return {
    id: state.id,
    token: encode(state),
    lines,
    subtotal: Math.round(subtotal * 100) / 100,
    currency: "CAD",
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    checkoutUrl: null,
    provider: "local",
  };
}

export class LocalCommerceProvider implements CommerceProvider {
  readonly name = "local" as const;

  async getProducts(): Promise<Product[]> {
    return LOCAL_PRODUCTS;
  }
  async getProductBySlug(slug: string): Promise<Product | null> {
    return LOCAL_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  async getProductById(id: string): Promise<Product | null> {
    return LOCAL_PRODUCTS.find((p) => p.id === id) ?? null;
  }
  async getCart(token: string | null): Promise<Cart | null> {
    const state = decode(token);
    return state ? build(state) : null;
  }
  async createCart(): Promise<Cart> {
    return build({ id: newId("cart"), lines: [] });
  }
  async addToCart(token: string | null, input: CartAddInput): Promise<Cart> {
    const state = decode(token) ?? { id: newId("cart"), lines: [] };
    const product = LOCAL_PRODUCTS.find((p) => p.id === input.productId);
    if (!product || product.status !== "active") throw new CommerceError("product_unavailable");
    if (!product.purchasable) throw new CommerceError("price_on_request");
    if (getAvailability(product) === "out-of-stock") throw new CommerceError("out_of_stock");
    const variantId = input.variantId ?? null;
    const qty = Math.max(1, input.quantity ?? 1);
    const existing = state.lines.find((l) => l.productId === product.id && l.variantId === variantId);
    const current = existing?.quantity ?? 0;
    const max = maxQuantity(product);
    if (current + qty > max) throw new CommerceError("quantity_limit", { max });
    const fulfillment = input.fulfillment ?? (product.pickupEligible ? "pickup" : "delivery");
    const pickupLocationId = fulfillment === "pickup" ? (input.pickupLocationId ?? product.locationId ?? PRIMARY_LOCATION_ID) : null;
    if (existing) {
      existing.quantity = current + qty;
      existing.fulfillment = fulfillment;
      existing.pickupLocationId = pickupLocationId;
    } else {
      state.lines.push({ id: newId("line"), productId: product.id, variantId, quantity: qty, fulfillment, pickupLocationId });
    }
    return build(state);
  }
  async updateCartLine(token: string, input: CartUpdateInput): Promise<Cart> {
    const state = decode(token);
    if (!state) throw new CommerceError("cart_not_found");
    const line = state.lines.find((l) => l.id === input.lineId);
    if (!line) throw new CommerceError("line_not_found");
    const product = LOCAL_PRODUCTS.find((p) => p.id === line.productId);
    if (!product) throw new CommerceError("product_unavailable");
    if (input.quantity !== undefined) {
      if (input.quantity <= 0) {
        state.lines = state.lines.filter((l) => l.id !== line.id);
        return build(state);
      }
      const max = maxQuantity(product);
      if (input.quantity > max) throw new CommerceError("quantity_limit", { max });
      line.quantity = input.quantity;
    }
    if (input.fulfillment) {
      line.fulfillment = input.fulfillment;
      line.pickupLocationId = input.fulfillment === "pickup" ? (input.pickupLocationId ?? product.locationId ?? PRIMARY_LOCATION_ID) : null;
    } else if (input.pickupLocationId !== undefined) {
      line.pickupLocationId = input.pickupLocationId;
    }
    return build(state);
  }
  async removeCartLine(token: string, lineId: string): Promise<Cart> {
    const state = decode(token);
    if (!state) throw new CommerceError("cart_not_found");
    state.lines = state.lines.filter((l) => l.id !== lineId);
    return build(state);
  }
  async getCheckoutUrl(): Promise<string | null> {
    return null; // Checkout is not live without a commerce backend.
  }
  isCheckoutLive(): boolean {
    return false;
  }
}

export class CommerceError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  constructor(code: string, meta?: Record<string, unknown>) {
    super(code);
    this.code = code;
    this.meta = meta;
  }
}
