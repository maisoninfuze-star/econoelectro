"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { getLocation } from "@/config/business";
import { getAvailability, type Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export function StockBadge({ product, withLocation = false, className }: { product: Product; withLocation?: boolean; className?: string }) {
  const { dict, t, locale } = useI18n();
  const a = getAvailability(product);
  const loc = product.locationId ? getLocation(product.locationId) : null;
  let text: string = dict.availability[a];
  if (a === "low-stock" && product.quantity > 1) text = t(dict.availability["low-stock-n"], { n: product.quantity });
  if ((a === "in-stock" || a === "low-stock") && product.badges.includes("available-today")) text = dict.availability["available-today"];
  const tone =
    a === "out-of-stock" ? "text-ink-soft" : a === "on-request" ? "text-warning" : "text-success";
  const dot = a === "out-of-stock" ? "bg-ink-muted" : a === "on-request" ? "bg-warning" : "bg-success";
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5 text-xs font-semibold", tone, className)}>
      <span className={cn("inline-block h-2 w-2 rounded-full", dot)} aria-hidden="true" />
      <span>{text}</span>
      {withLocation && loc && a !== "out-of-stock" ? <span className="font-medium text-ink-soft">· {loc.shortName[locale]}</span> : null}
    </span>
  );
}
