"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/commerce/types";
import { track, toGaItem } from "@/lib/analytics/events";

export function ViewItemTracker({ product }: { product: Product }) {
  useEffect(() => {
    track("view_item", { currency: "CAD", value: product.price, items: [toGaItem(product)] });
  }, [product]);
  return null;
}
