"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { useFilterUrl } from "./useFilterUrl";
import { CATEGORIES, PRICE_BUCKETS, CONDITION_GRADES } from "@/config/site";
import { LOCATIONS } from "@/config/business";
import type { CatalogResult, CategoryId } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

interface Props {
  facets: CatalogResult["facets"];
  lockedCategory?: CategoryId | null;
  idPrefix?: string;
}

function Group({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <fieldset className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <legend id={id} className="text-sm font-bold">
        {title}
      </legend>
      <div className="mt-2 space-y-1.5">{children}</div>
    </fieldset>
  );
}

function Check({ id, label, count, checked, onChange }: { id: string; label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm hover:bg-canvas", checked && "font-semibold")}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-ink" />
      <span className="flex-1">{label}</span>
      {count !== undefined ? <span className="text-xs text-ink-muted">{count}</span> : null}
    </label>
  );
}

export function ProductFilters({ facets, lockedCategory = null, idPrefix = "f" }: Props) {
  const { dict, locale, price } = useI18n();
  const { get, list, setMany, toggleInList } = useFilterUrl();
  const category = (lockedCategory ?? (get("categorie") as CategoryId | null)) || null;
  const type = get("type");
  const priceMin = get("prix_min");
  const priceMax = get("prix_max");
  const cat = category ? CATEGORIES.find((c) => c.id === category) : null;
  const uid = (s: string) => `${idPrefix}-${s}`;

  return (
    <div className="text-ink">
      {!lockedCategory ? (
        <Group title={dict.shop.groups.category} id={uid("g-cat")}>
          <label htmlFor={uid("cat-all")} className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm hover:bg-canvas", !category && "font-semibold")}>
            <input id={uid("cat-all")} type="radio" name={uid("cat")} checked={!category} onChange={() => setMany({ categorie: null, type: null })} className="h-4 w-4 accent-ink" />
            {dict.shop.allCategories}
          </label>
          {CATEGORIES.map((c) => (
            <label key={c.id} htmlFor={uid(`cat-${c.id}`)} className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm hover:bg-canvas", category === c.id && "font-semibold")}>
              <input id={uid(`cat-${c.id}`)} type="radio" name={uid("cat")} checked={category === c.id} onChange={() => setMany({ categorie: c.id, type: null })} className="h-4 w-4 accent-ink" />
              {dict.categories[c.id].name}
            </label>
          ))}
        </Group>
      ) : null}

      {cat && cat.subcategories.length ? (
        <Group title={dict.subcategories[cat.subcategories[0] as keyof typeof dict.subcategories] ? dict.categories[cat.id].name : ""} id={uid("g-type")}>
          <div className="flex flex-wrap gap-2">
            {cat.subcategories.map((s) => {
              const active = type === s;
              return (
                <button key={s} type="button" aria-pressed={active} className={cn("h-9 rounded-full border px-3 text-xs font-semibold", active ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink")} onClick={() => setMany({ type: active ? null : s })}>
                  {(dict.subcategories as Record<string, string>)[s] ?? s}
                </button>
              );
            })}
          </div>
        </Group>
      ) : null}

      {facets.brands.length ? (
        <Group title={dict.shop.groups.brand} id={uid("g-brand")}>
          {facets.brands.map((b) => (
            <Check key={b.value} id={uid(`brand-${b.value}`)} label={b.value} count={b.count} checked={list("marque").includes(b.value)} onChange={() => toggleInList("marque", b.value)} />
          ))}
        </Group>
      ) : null}

      <Group title={dict.shop.groups.condition} id={uid("g-cond")}>
        <Check id={uid("cond-refurbished")} label={dict.condition.refurbished} checked={list("etat").includes("refurbished")} onChange={() => toggleInList("etat", "refurbished")} />
        <Check id={uid("cond-new")} label={dict.condition.new} checked={list("etat").includes("new")} onChange={() => toggleInList("etat", "new")} />
        {CONDITION_GRADES.map((g) => (
          <Check key={g} id={uid(`cond-${g}`)} label={`↳ ${dict.condition.grades[g].label}`} checked={list("etat").includes(g)} onChange={() => toggleInList("etat", g)} />
        ))}
      </Group>

      <Group title={dict.shop.groups.price} id={uid("g-price")}>
        {PRICE_BUCKETS.map((b, i) => {
          const active = String(b.min ?? "") === (priceMin ?? "") && String(b.max ?? "") === (priceMax ?? "") && (priceMin || priceMax);
          const label = b.min == null ? dict.shop.priceUnder.replace("{max}", price(b.max!, { decimals: false })) : b.max == null ? dict.shop.priceOver.replace("{min}", price(b.min, { decimals: false })) : dict.shop.priceBetween.replace("{min}", price(b.min, { decimals: false })).replace("{max}", price(b.max, { decimals: false }));
          return (
            <label key={i} htmlFor={uid(`price-${i}`)} className={cn("flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm hover:bg-canvas", active && "font-semibold")}>
              <input id={uid(`price-${i}`)} type="radio" name={uid("price")} checked={Boolean(active)} onChange={() => setMany({ prix_min: b.min != null ? String(b.min) : null, prix_max: b.max != null ? String(b.max) : null })} className="h-4 w-4 accent-ink" />
              {label}
            </label>
          );
        })}
        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={dict.a11y.priceRange}>
          <label className="text-xs text-ink-soft">
            {dict.shop.priceMin}
            <input type="number" inputMode="numeric" min={0} step={50} defaultValue={priceMin ?? ""} key={`min-${priceMin ?? ""}`} onBlur={(e) => setMany({ prix_min: e.target.value || null })} className="mt-1 h-10 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-soft">
            {dict.shop.priceMax}
            <input type="number" inputMode="numeric" min={0} step={50} defaultValue={priceMax ?? ""} key={`max-${priceMax ?? ""}`} onBlur={(e) => setMany({ prix_max: e.target.value || null })} className="mt-1 h-10 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink" />
          </label>
        </div>
      </Group>

      {facets.widths.length ? (
        <Group title={dict.shop.groups.width} id={uid("g-width")}>
          <div className="flex flex-wrap gap-2">
            {facets.widths.map((w) => {
              const active = list("largeur").includes(String(w.value));
              return (
                <button key={w.value} type="button" aria-pressed={active} className={cn("h-10 rounded-md border px-3 text-sm font-semibold", active ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink")} onClick={() => toggleInList("largeur", String(w.value))}>
                  {dict.shop.widthUnit.replace("{n}", String(w.value))}
                </button>
              );
            })}
          </div>
        </Group>
      ) : null}

      {facets.finishes.length ? (
        <Group title={dict.shop.groups.finish} id={uid("g-finish")}>
          {facets.finishes.map((f) => (
            <Check key={f.value} id={uid(`finish-${f.value}`)} label={dict.shop.finishes[f.value]} count={f.count} checked={list("fini").includes(f.value)} onChange={() => toggleInList("fini", f.value)} />
          ))}
        </Group>
      ) : null}

      <Group title={dict.shop.groups.availability} id={uid("g-avail")}>
        <Check id={uid("av-in")} label={dict.availability["in-stock"]} checked={list("dispo").includes("in-stock")} onChange={() => toggleInList("dispo", "in-stock")} />
        <Check id={uid("av-low")} label={dict.availability["low-stock"]} checked={list("dispo").includes("low-stock")} onChange={() => toggleInList("dispo", "low-stock")} />
        <Check id={uid("av-req")} label={dict.availability["on-request"]} checked={list("dispo").includes("on-request")} onChange={() => toggleInList("dispo", "on-request")} />
        <Check id={uid("av-sale")} label={dict.shop.onSaleOnly} checked={get("aubaines") === "1"} onChange={() => setMany({ aubaines: get("aubaines") === "1" ? null : "1" })} />
      </Group>

      {facets.locations.length ? (
        <Group title={dict.shop.groups.location} id={uid("g-loc")}>
          {LOCATIONS.filter((l) => facets.locations.some((f) => f.value === l.id)).map((l) => (
            <Check key={l.id} id={uid(`loc-${l.id}`)} label={l.shortName[locale]} count={facets.locations.find((f) => f.value === l.id)?.count} checked={list("succursale").includes(l.id)} onChange={() => toggleInList("succursale", l.id)} />
          ))}
        </Group>
      ) : null}
    </div>
  );
}
