import type { Locale } from "./config";

/** Replace {placeholders} in a translated string. (No JSON imports: safe for client bundles.) */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => (key in vars ? String(vars[key]) : `{${key}}`));
}

/** Pick a localized value from a { fr, en } record, falling back to French. */
export function pick(value: Record<string, string> | null | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.fr || "";
}
