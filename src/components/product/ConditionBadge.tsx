"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

/** Condition is always communicated with text + icon (never colour alone). */
export function ConditionBadge({ product, size = "sm", className }: { product: Product; size?: "xs" | "sm" | "md"; className?: string }) {
  const { dict } = useI18n();
  const label = dict.condition[product.condition];
  const grade = product.conditionGrade ? dict.condition.grades[product.conditionGrade].label : null;
  const sizes = { xs: "h-5 px-1.5 text-[11px]", sm: "h-6 px-2 text-xs", md: "h-8 px-2.5 text-sm" };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm border border-line bg-surface font-semibold text-ink", sizes[size], className)}>
      <Icon name="shield" size={size === "xs" ? 11 : 13} className="text-ink-soft" />
      {label}
      {grade ? <span className="text-ink-soft">· {grade}</span> : null}
    </span>
  );
}
