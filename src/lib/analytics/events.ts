import type { Product } from "@/lib/commerce/types";

/** GA4-style e-commerce events. Fired through the dataLayer; nothing loads before consent. */
export type AnalyticsEvent =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "purchase"
  | "search"
  | "filter_products"
  | "click_call"
  | "click_directions"
  | "contact_submit"
  | "newsletter_submit"
  | "stock_alert_submit"
  | "quick_view";

export interface GaItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  index?: number;
  item_list_name?: string;
}

export function toGaItem(p: Product, extra: Partial<GaItem> = {}): GaItem {
  return {
    item_id: p.id,
    item_name: p.title.fr,
    item_brand: p.brand ?? undefined,
    item_category: p.category,
    item_category2: p.subcategory ?? undefined,
    price: p.price,
    quantity: 1,
    ...extra,
  };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_MAP: Partial<Record<AnalyticsEvent, string>> = {
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  search: "Search",
  contact_submit: "Contact",
  newsletter_submit: "Lead",
  stock_alert_submit: "Lead",
};

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.gtag === "function") window.gtag("event", event, params);
  const metaEvent = META_MAP[event];
  if (metaEvent && typeof window.fbq === "function") {
    const items = (params.items as GaItem[] | undefined) ?? [];
    window.fbq("track", metaEvent, {
      value: params.value,
      currency: params.currency ?? "CAD",
      content_ids: items.map((i) => i.item_id),
      content_type: "product",
      search_string: params.search_term,
    });
  }
}
