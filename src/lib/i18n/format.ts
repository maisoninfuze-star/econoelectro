import type { Locale } from "./config";

const intlLocale: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };

/**
 * CAD price formatting.
 *  fr: 749,00 $   (or 749 $ without decimals)
 *  en: $749.00    (or $749)
 */
export function formatPrice(amount: number, locale: Locale, opts: { decimals?: boolean } = {}): string {
  const decimals = opts.decimals ?? true;
  const formatted = new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "CAD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
  // fr-CA yields "749,00 $" and en-CA yields "$749.00"; normalize non-breaking spaces.
  return formatted.replace(/ /g, " ").replace(/CA\$/, "$");
}

export function formatInches(n: number, locale: Locale): string {
  return locale === "fr" ? `${n} po` : `${n} in.`;
}

export function formatDimensions(
  d: { widthIn: number | null; heightIn: number | null; depthIn: number | null },
  locale: Locale,
): string {
  const unit = locale === "fr" ? "po" : "in.";
  const parts: string[] = [];
  const label = locale === "fr" ? { w: "L", h: "H", d: "P" } : { w: "W", h: "H", d: "D" };
  if (d.widthIn) parts.push(`${label.w} ${d.widthIn} ${unit}`);
  if (d.heightIn) parts.push(`${label.h} ${d.heightIn} ${unit}`);
  if (d.depthIn) parts.push(`${label.d} ${d.depthIn} ${unit}`);
  return parts.join(" × ");
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(n);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long" }).format(new Date(iso));
}
