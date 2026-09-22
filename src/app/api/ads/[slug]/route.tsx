import { NextResponse, type NextRequest } from "next/server";
import { getCommerce } from "@/lib/commerce";
import { isLocale } from "@/lib/i18n/config";
import { isAdFormat, renderAdCreative } from "@/lib/ads/creative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/ads/[slug]?format=square|portrait|story&locale=fr|en
 * Renders a Meta ad creative for one product. Enabled in development; in
 * production set ADS_EXPORT_ENABLED=1 to expose it.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production" && process.env.ADS_EXPORT_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { slug } = await params;
  const sp = request.nextUrl.searchParams;
  const format = sp.get("format") ?? "square";
  const locale = sp.get("locale") ?? "fr";
  const studio = sp.get("studio") === "1";
  if (!isAdFormat(format) || !isLocale(locale)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const product = await getCommerce().getProductBySlug(slug);
  if (!product) return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  return renderAdCreative(product, format, locale, { studio });
}
