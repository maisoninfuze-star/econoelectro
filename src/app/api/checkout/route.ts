import { NextResponse, type NextRequest } from "next/server";
import { getCommerce, CART_COOKIE } from "@/lib/commerce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Checkout handoff. With Shopify configured, returns the hosted checkout URL
 * (UTM parameters preserved). In demo mode, returns { live: false } and the UI
 * shows the demo checkout page with payment disabled.
 */
export async function POST(request: NextRequest) {
  const commerce = getCommerce();
  const token = request.cookies.get(CART_COOKIE)?.value ?? null;
  if (!token) return NextResponse.json({ error: "cart_empty" }, { status: 400 });
  let utm: Record<string, string> = {};
  try {
    const body = (await request.json()) as { utm?: Record<string, string> };
    utm = body.utm ?? {};
  } catch {
    /* no body */
  }
  if (!commerce.isCheckoutLive()) {
    return NextResponse.json({ live: false, url: null });
  }
  try {
    const url = await commerce.getCheckoutUrl(token, utm);
    if (!url) return NextResponse.json({ live: false, url: null });
    return NextResponse.json({ live: true, url });
  } catch (err) {
    console.error("[api/checkout]", err);
    return NextResponse.json({ error: "checkout_error" }, { status: 500 });
  }
}
