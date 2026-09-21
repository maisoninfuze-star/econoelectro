"use client";

import { useEffect } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/commerce/types";
import { track, toGaItem } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

export function ProductGrid({ products, listName, className, columns = 4, priorityCount = 0, headingLevel = "h3" }: { products: Product[]; listName: string; className?: string; columns?: 3 | 4; priorityCount?: number; headingLevel?: "h2" | "h3" }) {
  useEffect(() => {
    if (products.length) track("view_item_list", { item_list_name: listName, items: products.slice(0, 20).map((p, i) => toGaItem(p, { index: i, item_list_name: listName })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName, products.map((p) => p.id).join(",")]);
  return (
    <ul className={cn("grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4", columns === 4 ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-3", className)}>
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} index={i} listName={listName} priority={i < priorityCount} className="w-full" headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  );
}
