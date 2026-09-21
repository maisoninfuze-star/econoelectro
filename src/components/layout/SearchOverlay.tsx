"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/components/providers/I18nProvider";
import { normalizeText } from "@/lib/utils";
import { track } from "@/lib/analytics/events";

export interface SearchIndexItem {
  slug: string;
  title: string;
  brand: string | null;
  price: number;
  priceFrom: boolean;
  image: string | null;
  category: string;
  keywords: string;
}

const SYN: Record<string, string> = {
  frigo: "refrigerateur", fridge: "refrigerateur", refrigerator: "refrigerateur", refrigerators: "refrigerateur", frigos: "refrigerateur",
  stove: "cuisiniere", range: "cuisiniere", poele: "cuisiniere", oven: "cuisiniere", four: "cuisiniere",
  washer: "laveuse", washers: "laveuse", dryer: "secheuse", dryers: "secheuse",
  set: "ensemble", pack: "ensemble", bundle: "ensemble", package: "ensemble",
  freezer: "congelateur", stainless: "inox", steel: "inox", white: "blanc", grey: "gris", gray: "gris",
};

function scoreItem(item: SearchIndexItem, q: string): number {
  const tokens = normalizeText(q).split(" ").filter(Boolean);
  if (!tokens.length) return 0;
  const hay = normalizeText(`${item.title} ${item.brand ?? ""} ${item.keywords}`);
  let score = 0;
  for (const raw of tokens) {
    const t = SYN[raw] ?? raw;
    const alt = raw;
    if (hay.includes(t) || hay.includes(alt)) score += normalizeText(item.title).includes(t) ? 3 : 1;
    else return 0;
  }
  return score;
}

export function SearchOverlay({ open, onClose, index }: { open: boolean; onClose: () => void; index: SearchIndexItem[] }) {
  const { dict, href, price, locale } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setQ("");
  }
  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    return index
      .map((item) => ({ item, s: scoreItem(item, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((r) => r.item);
  }, [index, q]);

  const submit = (term: string) => {
    const value = term.trim();
    if (!value) return;
    track("search", { search_term: value });
    onClose();
    router.push(href("shop", { query: { q: value } }));
  };

  return (
    <Dialog open={open} onClose={onClose} labelledBy="search-title" side="top" panelClassName="max-h-[92dvh] rounded-b-xl">
      <div className="container-x py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <h2 id="search-title" className="sr-only">
            {dict.search.title}
          </h2>
          <form
            role="search"
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
          >
            <label htmlFor="site-search" className="sr-only">
              {dict.common.searchLabel}
            </label>
            <Icon name="search" size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              id="site-search"
              data-autofocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={dict.search.placeholder}
              autoComplete="off"
              enterKeyHint="search"
              className="h-14 w-full rounded-lg border border-line-strong bg-canvas pl-12 pr-4 text-lg outline-none focus:border-ink"
            />
          </form>
          <button type="button" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md hover:bg-line/70" aria-label={dict.search.close} onClick={onClose}>
            <Icon name="close" size={22} />
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{dict.search.hint}</p>

        {q.trim().length < 2 ? (
          <div className="mt-5">
            <p className="text-eyebrow text-ink-soft">{dict.search.suggestions}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {dict.search.popular.map((s) => (
                <li key={s}>
                  <button type="button" className="h-10 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium hover:border-ink" onClick={() => submit(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <p className="mt-6 rounded-lg bg-canvas p-4 text-sm text-ink-soft">{dict.search.noResults.replace("{q}", q)}</p>
        ) : (
          <div className="mt-5">
            <p className="text-eyebrow text-ink-soft">{dict.search.results}</p>
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
              {results.map((r) => (
                <li key={r.slug}>
                  <Link href={href("product", { slug: r.slug })} className="flex items-center gap-4 p-3 hover:bg-canvas" onClick={onClose} lang={locale === "fr" ? "fr-CA" : "en-CA"}>
                    <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-line">
                      {r.image ? <Image src={r.image} alt="" width={112} height={128} sizes="56px" className="h-full w-full object-cover" /> : <Icon name="image" className="absolute inset-0 m-auto text-ink-muted" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.title}</span>
                      <span className="block text-xs text-ink-soft">{r.brand ?? dict.categories[r.category as keyof typeof dict.categories]?.name}</span>
                    </span>
                    <span className="text-sm font-bold">
                      {r.priceFrom ? `${dict.product.priceFrom} ` : ""}
                      {price(r.price, { decimals: false })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline" onClick={() => submit(q)}>
              {dict.search.seeAll} <Icon name="arrowRight" size={16} />
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
