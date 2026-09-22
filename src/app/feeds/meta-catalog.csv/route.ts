import { NextResponse, type NextRequest } from "next/server";
import { getActiveProducts } from "@/lib/commerce";
import { isLocale } from "@/lib/i18n/config";
import { href } from "@/lib/i18n/routes";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getAvailability, type CategoryId, type Product } from "@/lib/commerce/types";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";
export const revalidate = 300;

/**
 * Meta Commerce Manager product feed (CSV). Point a scheduled data source at
 * https://www.econoelectroservices.com/feeds/meta-catalog.csv (add ?locale=en
 * for an English language feed). Product ids match the `content_ids` sent by
 * the Meta Pixel on the site, so dynamic (Advantage+ catalog) ads work.
 */
const GOOGLE_CATEGORY: Record<CategoryId, string> = {
  refrigerateurs: "Home & Garden > Kitchen & Dining > Kitchen Appliances > Refrigerators",
  cuisinieres: "Home & Garden > Kitchen & Dining > Kitchen Appliances > Ranges",
  "laveuses-secheuses": "Home & Garden > Household Appliances > Laundry Appliances",
  ensembles: "Home & Garden > Household Appliances",
  autres: "Home & Garden > Household Appliances",
};

const COLUMNS = ["id", "title", "description", "availability", "condition", "price", "sale_price", "link", "image_link", "additional_image_link", "brand", "product_type", "google_product_category", "custom_label_0", "custom_label_1", "quantity_to_sell_on_facebook"];

function csv(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function row(p: Product, locale: "fr" | "en"): (string | number | null)[] {
  const dict = getDictionary(locale);
  const availability = getAvailability(p);
  const fbAvailability = availability === "out-of-stock" ? "out of stock" : availability === "on-request" ? "available for order" : "in stock";
  const onSale = p.compareAtPrice != null && p.compareAtPrice > p.price;
  const price = `${(onSale ? p.compareAtPrice! : p.price).toFixed(2)} CAD`;
  const salePrice = onSale ? `${p.price.toFixed(2)} CAD` : null;
  const description = [p.priceFrom ? (locale === "fr" ? "Prix à partir de, confirmé selon l'unité." : "Starting price, confirmed per unit.") : null, p.shortDescription[locale] || p.shortDescription.fr, p.description[locale] || p.description.fr]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 4990);
  const google = p.subcategory === "congelateur" ? "Home & Garden > Kitchen & Dining > Kitchen Appliances > Freezers" : GOOGLE_CATEGORY[p.category];
  const productType = [dict.categories[p.category].name, p.subcategory ? (dict.subcategories as Record<string, string>)[p.subcategory] ?? null : null].filter(Boolean).join(" > ");
  return [
    p.id,
    (p.title[locale] || p.title.fr).slice(0, 150),
    description,
    fbAvailability,
    p.condition === "new" ? "new" : "refurbished",
    price,
    salePrice,
    absoluteUrl(href(locale, "product", { slug: p.slug })),
    p.images[0] ? absoluteUrl(p.images[0].src) : "",
    p.images.slice(1, 11).map((im) => absoluteUrl(im.src)).join(","),
    p.brand ?? "",
    productType,
    google,
    p.category,
    p.sale ? "sale" : p.featured ? "featured" : "",
    p.inventoryPolicy === "continue" ? "" : p.quantity,
  ];
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "fr";
  if (!isLocale(locale)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const products = (await getActiveProducts()).filter((p) => p.images.length > 0 && p.subcategory !== "carte-cadeau");
  const lines = [COLUMNS.join(","), ...products.map((p) => row(p, locale).map(csv).join(","))];
  return new NextResponse(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `inline; filename="meta-catalog-${locale}.csv"`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
