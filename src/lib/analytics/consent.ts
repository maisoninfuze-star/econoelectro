export type ConsentState = "granted" | "denied" | "unset";
export const CONSENT_COOKIE = "ee_consent";
export const CONSENT_EVENT = "ee:consent";

export function readConsent(): ConsentState {
  if (typeof document === "undefined") return "unset";
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`));
  return (m?.[1] as ConsentState) ?? "unset";
}

export function subscribeConsent(cb: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, cb);
  return () => window.removeEventListener(CONSENT_EVENT, cb);
}

export function writeConsent(state: Exclude<ConsentState, "unset">): void {
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${CONSENT_COOKIE}=${state}; path=/; max-age=${maxAge}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** UTM / click-id capture for attribution; preserved through checkout. */
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"] as const;
const UTM_STORAGE = "ee_utm";

export function captureUtm(): void {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = sp.get(k);
      if (v) found[k] = v.slice(0, 200);
    }
    if (Object.keys(found).length) sessionStorage.setItem(UTM_STORAGE, JSON.stringify(found));
  } catch {
    /* storage unavailable */
  }
}

export function readUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(UTM_STORAGE) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}
