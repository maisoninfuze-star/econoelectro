"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/interpolate";
import { formatPrice } from "@/lib/i18n/format";
import { href as buildHref, type RouteKey, type RouteParams } from "@/lib/i18n/routes";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  t: (template: string, vars?: Record<string, string | number>) => string;
  price: (amount: number, opts?: { decimals?: boolean }) => string;
  href: (key: RouteKey, params?: RouteParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dict,
      t: (template, vars) => interpolate(template, vars),
      price: (amount, opts) => formatPrice(amount, locale, opts),
      href: (key, params) => buildHref(locale, key, params),
    }),
    [locale, dict],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
