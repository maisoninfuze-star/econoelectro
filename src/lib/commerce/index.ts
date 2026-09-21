import "server-only";
import { LocalCommerceProvider } from "./providers/local";
import { ShopifyCommerceProvider } from "./providers/shopify";
import type { CommerceProvider, Product } from "./types";

let instance: CommerceProvider | null = null;

/** Selected by COMMERCE_PROVIDER (local | shopify). Falls back to local when Shopify is not configured. */
export function getCommerce(): CommerceProvider {
  if (instance) return instance;
  const wantShopify = process.env.COMMERCE_PROVIDER === "shopify";
  const configured = Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
  if (wantShopify && configured) instance = new ShopifyCommerceProvider();
  else {
    if (wantShopify) console.warn("[commerce] COMMERCE_PROVIDER=shopify but credentials are missing — using local demo provider.");
    instance = new LocalCommerceProvider();
  }
  return instance;
}

export async function getActiveProducts(): Promise<Product[]> {
  const all = await getCommerce().getProducts();
  return all.filter((p) => p.status === "active");
}

export const CART_COOKIE = "ee_cart";

export { CommerceError } from "./providers/local";
export * from "./types";
export * from "./catalog";
