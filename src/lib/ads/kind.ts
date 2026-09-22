import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/commerce/types";

const SINGULAR: Record<Locale, Record<string, string>> = {
  fr: { refrigerateurs: "Réfrigérateur", cuisinieres: "Cuisinière", "laveuses-secheuses": "Laveuse et sécheuse", ensembles: "Ensemble d'électroménagers", autres: "Électroménager", congelateur: "Congélateur" },
  en: { refrigerateurs: "Refrigerator", cuisinieres: "Range", "laveuses-secheuses": "Washer and dryer", ensembles: "Appliance set", autres: "Appliance", congelateur: "Freezer" },
};

/** Singular product kind for headlines ("Réfrigérateur", "Congélateur"…). */
export function productKind(p: Product, locale: Locale): string {
  const table = SINGULAR[locale];
  return (p.subcategory && table[p.subcategory]) || table[p.category] || table.autres;
}
