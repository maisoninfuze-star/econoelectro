"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { percentOff } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({ amount, compareAt, priceFrom, size = "md", className, showSavings = true }: { amount: number; compareAt?: number | null; priceFrom?: boolean; size?: "sm" | "md" | "lg" | "xl"; className?: string; showSavings?: boolean }) {
  const { dict, price } = useI18n();
  const pct = percentOff(amount, compareAt ?? null);
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-2xl", xl: "text-3xl md:text-4xl" };
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {priceFrom ? <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{dict.product.priceFrom}</span> : null}
      <span className={cn("font-extrabold leading-none tracking-tight", sizes[size], pct ? "text-brand" : "text-ink")}>{price(amount, { decimals: size === "xl" })}</span>
      {pct && compareAt ? (
        <>
          <s className="text-sm text-ink-soft" aria-label={`${dict.product.compareAt} ${price(compareAt, { decimals: false })}`}>
            {price(compareAt, { decimals: false })}
          </s>
          {showSavings ? <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-xs font-bold text-brand-hover">{dict.product.savePercent.replace("{percent}", String(pct))}</span> : null}
        </>
      ) : null}
    </div>
  );
}
