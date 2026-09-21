"use client";

import { useEffect, useRef } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/components/providers/I18nProvider";
import { Icon } from "@/components/ui/Icon";
import type { Product } from "@/lib/commerce/types";
import { track, toGaItem } from "@/lib/analytics/events";

/** Horizontal scroll-snap carousel on mobile, 4-column grid on desktop. */
export function FeaturedCarousel({ products }: { products: Product[] }) {
  const { dict } = useI18n();
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    track("view_item_list", { item_list_name: "home_featured", items: products.map((p, i) => toGaItem(p, { index: i, item_list_name: "home_featured" })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * Math.round(ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <ul ref={ref} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible" aria-label={dict.a11y.carousel}>
        {products.map((p, i) => (
          <li key={p.id} className="w-[72vw] max-w-[300px] shrink-0 snap-start sm:w-[44vw] lg:w-auto lg:max-w-none">
            <ProductCard product={p} index={i} listName="home_featured" priority={i < 2} className="h-full" />
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-end gap-2 lg:hidden">
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface" aria-label={dict.a11y.previous} onClick={() => scrollBy(-1)}>
          <Icon name="chevronLeft" />
        </button>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-surface" aria-label={dict.a11y.next} onClick={() => scrollBy(1)}>
          <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
}
