import { NextResponse, type NextRequest } from "next/server";
import { clean, forwardToWebhook, isEmail } from "@/lib/forms";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (clean(body.website)) return NextResponse.json({ ok: true });
  const email = clean(body.email, 200);
  if (!isEmail(email)) return NextResponse.json({ error: "invalid_email" }, { status: 422 });
  if (body.consent !== true) return NextResponse.json({ error: "consent_required" }, { status: 422 });
  const status = await forwardToWebhook(process.env.NEWSLETTER_WEBHOOK_URL, {
    type: "newsletter",
    email,
    category: clean(body.category, 40),
    locale: clean(body.locale, 2),
    consent: true,
  });
  if (status === "unconfigured") {
    if (process.env.NODE_ENV !== "production") {
      console.info("[newsletter] (dev) sign-up:", email);
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  if (status === "failed") return NextResponse.json({ error: "failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
