import { NextResponse, type NextRequest } from "next/server";
import { getActiveProducts } from "@/lib/commerce";
import { isLocale } from "@/lib/i18n/config";
import { campaignAdCopy } from "@/lib/ads/copy";
import { isAdFormat, renderCampaignCreative } from "@/lib/ads/creative";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ads/campaign/[key]?format=square|portrait|story&locale=fr|en — campaign-level creative (generated scene + headline). */
export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (process.env.NODE_ENV === "production" && process.env.ADS_EXPORT_ENABLED !== "1") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { key } = await params;
  const sp = request.nextUrl.searchParams;
  const format = sp.get("format") ?? "square";
  const locale = sp.get("locale") ?? "fr";
  if (!isAdFormat(format) || !isLocale(locale)) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const campaign = campaignAdCopy(await getActiveProducts(), locale).find((c) => c.key === key);
  if (!campaign) return NextResponse.json({ error: "campaign_not_found" }, { status: 404 });
  return renderCampaignCreative(campaign, format, locale);
}
