import "server-only";

/**
 * Forwards a form submission to a JSON webhook (Make, Zapier, Formspree, n8n…).
 * Returns "sent" | "unconfigured" | "failed". No vendor SDK required.
 */
export async function forwardToWebhook(
  url: string | undefined,
  payload: Record<string, unknown>,
): Promise<"sent" | "unconfigured" | "failed"> {
  if (!url) return "unconfigured";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, receivedAt: new Date().toISOString(), site: "econoelectroservices.com" }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function clean(v: unknown, max = 2000): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
