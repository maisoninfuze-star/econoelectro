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
  // Honeypot
  if (clean(body.website)) return NextResponse.json({ ok: true });
  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 4000);
  if (!name || !isEmail(email) || !message) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }
  const status = await forwardToWebhook(process.env.CONTACT_FORM_WEBHOOK_URL, {
    type: "contact",
    name,
    email,
    phone: clean(body.phone, 40),
    subject: clean(body.subject, 40),
    product: clean(body.product, 200),
    message,
    locale: clean(body.locale, 2),
  });
  if (status === "unconfigured") {
    // In development we accept the submission so the flow can be tested end-to-end.
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] (dev) submission:", { name, email, message: message.slice(0, 80) });
      return NextResponse.json({ ok: true, dev: true });
    }
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }
  if (status === "failed") return NextResponse.json({ error: "failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
