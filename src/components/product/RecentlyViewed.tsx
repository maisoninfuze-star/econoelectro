"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/commerce/types";

interface RecentItem {
  slug: string;
  title: { fr: string; en: string };
  brand: string | null;
  price: number;
  image: string | null;
}
const KEY = "ee_recent";
const EVENT = "ee:recent";

function read(): RecentItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as RecentItem[];
  } catch {
    return [];
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}
function getSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function RecentlyViewedTracker({ product }: { product: Product }) {
  useEffect(() => {
    try {
      const item: RecentItem = { slug: product.slug, title: product.title, brand: product.brand, price: product.price, image: product.images[0]?.src ?? null };
      const list = [item, ...read().filter((r) => r.slug !== product.slug)].slice(0, 8);
      localStorage.setItem(KEY, JSON.stringify(list));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      /* storage unavailable */
    }
  }, [product]);
  return null;
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { dict, locale, href, price } = useI18n();
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const items = useMemo(() => {
    try {
      return (JSON.parse(raw) as RecentItem[]).filter((r) => r.slug !== excludeSlug).slice(0, 6);
    } catch {
      return [];
    }
  }, [raw, excludeSlug]);
  if (!items.length) return null;
  return (
    <section aria-labelledby="recent-title" className="container-x mt-14">
      <h2 id="recent-title" className="text-h3">
        {dict.product.recentlyViewed}
      </h2>
      <ul className="mt-4 flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory">
        {items.map((r) => (
          <li key={r.slug} className="w-40 shrink-0 snap-start">
            <Link href={href("product", { slug: r.slug })} className="group block rounded-lg border border-line bg-surface p-2 hover:border-line-strong">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-canvas">
                {r.image ? <Image src={r.image} alt="" width={240} height={300} sizes="160px" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <Icon name="image" className="absolute inset-0 m-auto text-ink-muted" />}
              </span>
              <span className="mt-2 block truncate text-xs text-ink-soft">{r.brand ?? ""}</span>
              <span className="line-clamp-2 text-sm font-semibold leading-snug">{r.title[locale] || r.title.fr}</span>
              <span className="mt-1 block text-sm font-bold">{price(r.price, { decimals: false })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
