"use client";

import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useFilterUrl } from "./useFilterUrl";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { ProductFilters } from "./ProductFilters";
import { SORT_KEYS } from "@/config/site";
import { LOCATIONS } from "@/config/business";
import type { CatalogResult, CategoryId, SortKey } from "@/lib/commerce/types";
import { track } from "@/lib/analytics/events";

const FILTER_KEYS = ["categorie", "type", "marque", "etat", "prix_min", "prix_max", "largeur", "fini", "dispo", "succursale", "aubaines"];

export function ShopToolbar({ total, facets, lockedCategory }: { total: number; facets: CatalogResult["facets"]; lockedCategory?: CategoryId | null }) {
  const { dict, t, locale, price } = useI18n();
  const { sp, get, list, setMany, clear } = useFilterUrl();
  const [open, setOpen] = useState(false);
  const sort = (get("tri") as SortKey) || "featured";
  const q = get("q");

  // Active filter chips
  const chips: { key: string; value: string | null; label: string }[] = [];
  const cat = get("categorie") as CategoryId | null;
  if (cat && !lockedCategory) chips.push({ key: "categorie", value: null, label: dict.categories[cat].name });
  const type = get("type");
  if (type) chips.push({ key: "type", value: null, label: (dict.subcategories as Record<string, string>)[type] ?? type });
  for (const b of list("marque")) chips.push({ key: "marque", value: b, label: b });
  for (const c of list("etat")) chips.push({ key: "etat", value: c, label: (dict.condition.grades as Record<string, { label: string }>)[c]?.label ?? (dict.condition as unknown as Record<string, string>)[c] ?? c });
  const pmin = get("prix_min");
  const pmax = get("prix_max");
  if (pmin || pmax) chips.push({ key: "prix", value: null, label: pmin && pmax ? dict.shop.priceBetween.replace("{min}", price(+pmin, { decimals: false })).replace("{max}", price(+pmax, { decimals: false })) : pmax ? dict.shop.priceUnder.replace("{max}", price(+pmax, { decimals: false })) : dict.shop.priceOver.replace("{min}", price(+pmin!, { decimals: false })) });
  for (const w of list("largeur")) chips.push({ key: "largeur", value: w, label: dict.shop.widthUnit.replace("{n}", w) });
  for (const f of list("fini")) chips.push({ key: "fini", value: f, label: (dict.shop.finishes as Record<string, string>)[f] ?? f });
  for (const a of list("dispo")) chips.push({ key: "dispo", value: a, label: (dict.availability as Record<string, string>)[a] ?? a });
  for (const l of list("succursale")) chips.push({ key: "succursale", value: l, label: LOCATIONS.find((x) => x.id === l)?.shortName[locale] ?? l });
  if (get("aubaines") === "1") chips.push({ key: "aubaines", value: null, label: dict.shop.onSaleOnly });
  const hasFilters = FILTER_KEYS.some((k) => sp.has(k)) || Boolean(q);

  const removeChip = (c: { key: string; value: string | null }) => {
    if (c.key === "prix") return setMany({ prix_min: null, prix_max: null });
    if (c.value === null) return setMany({ [c.key]: null, ...(c.key === "categorie" ? { type: null } : {}) });
    setMany({ [c.key]: list(c.key).filter((v) => v !== c.value) });
  };

  const resultsLabel = total === 0 ? dict.shop.resultsNone : total === 1 ? dict.shop.resultsOne : t(dict.shop.results, { count: total });

  return (
    <div className="sticky top-[60px] z-30 -mx-4 mb-4 border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft" aria-live="polite">
          {q ? <span className="font-semibold text-ink">{t(dict.shop.searchResultsFor, { q })} · </span> : null}
          {resultsLabel}
        </p>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-3 text-sm font-semibold lg:hidden" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <Icon name="filter" size={16} /> {dict.shop.filterAndSort}
            {chips.length ? <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] text-white">{chips.length}</span> : null}
          </button>
          <label className="hidden items-center gap-2 text-sm lg:inline-flex">
            <span className="text-ink-soft">{dict.shop.sortBy}</span>
            <select value={sort} onChange={(e) => { setMany({ tri: e.target.value === "featured" ? null : e.target.value }); track("filter_products", { sort: e.target.value }); }} className="h-11 rounded-md border border-line-strong bg-surface px-3 font-semibold" aria-label={dict.a11y.sortResults}>
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {dict.shop.sortOptions[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {chips.length || q ? (
        <ul className="mt-2 flex flex-wrap items-center gap-2" aria-label={dict.shop.activeFilters}>
          {q ? (
            <li>
              <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3 text-xs font-semibold text-white" onClick={() => setMany({ q: null })} aria-label={t(dict.shop.removeFilter, { filter: q })}>
                « {q} » <Icon name="close" size={13} />
              </button>
            </li>
          ) : null}
          {chips.map((c) => (
            <li key={`${c.key}-${c.value ?? ""}`}>
              <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-xs font-semibold hover:border-ink" onClick={() => removeChip(c)} aria-label={t(dict.shop.removeFilter, { filter: c.label })}>
                {c.label} <Icon name="close" size={13} />
              </button>
            </li>
          ))}
          {hasFilters ? (
            <li>
              <button type="button" className="h-9 px-2 text-xs font-semibold underline-offset-4 hover:underline" onClick={clear}>
                {dict.shop.clearAll}
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}

      <Dialog open={open} onClose={() => setOpen(false)} labelledBy="filters-title" side="bottom" panelClassName="max-h-[92dvh]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="filters-title" className="text-base font-bold">
            {dict.shop.filterAndSort}
          </h2>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-line/70" aria-label={dict.common.close} onClick={() => setOpen(false)}>
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <label className="mb-4 block text-sm font-bold">
            {dict.shop.sortBy}
            <select value={sort} onChange={(e) => setMany({ tri: e.target.value === "featured" ? null : e.target.value })} className="mt-2 h-11 w-full rounded-md border border-line-strong bg-surface px-3 font-semibold">
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {dict.shop.sortOptions[k]}
                </option>
              ))}
            </select>
          </label>
          <ProductFilters facets={facets} lockedCategory={lockedCategory} idPrefix="m" />
        </div>
        <div className="flex gap-2 border-t border-line bg-surface px-4 py-3 pb-safe">
          <Button variant="outline" className="flex-1" onClick={clear} disabled={!hasFilters}>
            {dict.shop.clearFilters}
          </Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>
            {t(dict.shop.showResults, { count: total })}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
