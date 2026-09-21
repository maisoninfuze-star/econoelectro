import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import type { Locale } from "./config";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en: en as Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? fr;
}

export { interpolate, pick } from "./interpolate";
