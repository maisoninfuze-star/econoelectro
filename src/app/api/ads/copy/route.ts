import { NextResponse, type NextRequest } from "next/server";
import { getActiveProducts } from "@/lib/commerce";
import { isLocale } from "@/lib/i18n/config";
import { campaignAdCopy, productAdCopy, AD_CAMPAIGN } from "@/lib/ads/copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ads/copy?locale=fr — ad copy for every eligible product plus campaign angles. */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.ADS_EXPORT_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const locale = request.nextUrl.searchParams.get("locale") ?? "fr";
  if (!isLocale(locale)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const products = await getActiveProducts();
  const eligible = products.filter((p) => p.images.length > 0 && p.subcategory !== "carte-cadeau");
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    locale,
    campaign: AD_CAMPAIGN,
    campaigns: campaignAdCopy(products, locale),
    products: eligible.map((p) => ({ ...productAdCopy(p, locale), featured: p.featured, sale: p.sale, category: p.category })),
  });
}
