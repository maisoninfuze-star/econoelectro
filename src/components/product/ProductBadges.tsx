"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { BADGE_PRIORITY } from "@/config/site";
import type { Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export function ProductBadges({ product, max = 2, className }: { product: Product; max?: number; className?: string }) {
  const { dict } = useI18n();
  const badges = BADGE_PRIORITY.filter((b) => product.badges.includes(b)).slice(0, max);
  if (!badges.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1", className)} aria-label="Badges">
      {badges.map((b) => (
        <li key={b} className={cn("rounded-sm px-2 py-1 text-[11px] font-bold uppercase tracking-wide", b === "sale" ? "bg-brand text-white" : b === "available-today" ? "bg-success text-white" : "bg-ink text-white")}>
          {dict.badges[b]}
        </li>
      ))}
    </ul>
  );
}
