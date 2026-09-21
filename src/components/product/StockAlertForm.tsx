"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/commerce/types";
import { track } from "@/lib/analytics/events";

export function StockAlertForm({ product }: { product: Product }) {
  const { dict, locale } = useI18n();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const id = `alert-${product.id.replace(/[^a-z0-9]/gi, "")}`;
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("loading");
    try {
      const res = await fetch("/api/stock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), website: fd.get("website"), productId: product.id, productTitle: product.title.fr, category: product.category, locale }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      track("stock_alert_submit", { item_id: product.id });
    } catch {
      setState("error");
    }
  };
  if (state === "success") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success">
        <Icon name="check" size={18} /> {dict.stockAlert.success}
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <p className="text-sm font-bold">{dict.stockAlert.heading}</p>
      <p className="text-xs text-ink-soft">{dict.stockAlert.body}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={id} className="sr-only">
          {dict.newsletter.email}
        </label>
        <input id={id} name="email" type="email" required autoComplete="email" inputMode="email" placeholder={dict.newsletter.emailPlaceholder} className="h-11 flex-1 rounded-md border border-line-strong bg-surface px-3 text-sm outline-none focus:border-ink" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Button type="submit" variant="secondary" disabled={state === "loading"} aria-busy={state === "loading"}>
          {dict.stockAlert.submit}
        </Button>
      </div>
      {state === "error" ? (
        <p role="alert" className="text-xs font-medium text-brand">
          {dict.stockAlert.error}
        </p>
      ) : null}
    </form>
  );
}
