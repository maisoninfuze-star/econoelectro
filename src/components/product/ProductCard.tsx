"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { Price } from "./Price";
import { ConditionBadge } from "./ConditionBadge";
import { StockBadge } from "./StockBadge";
import { ProductBadges } from "./ProductBadges";
import { QuickView } from "./QuickView";
import { getAvailability, type Product } from "@/lib/commerce/types";
import { track, toGaItem } from "@/lib/analytics/events";
import { formatInches } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0, listName = "shop", priority = false, className, headingLevel = "h3" }: { product: Product; index?: number; listName?: string; priority?: boolean; className?: string; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const { dict, locale, href } = useI18n();
  const { add } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const title = product.title[locale] || product.title.fr;
  const url = href("product", { slug: product.slug });
  const availability = getAvailability(product);
  const soldOut = availability === "out-of-stock";
  const canBuy = product.purchasable && !soldOut;
  const [img1, img2] = product.images;
  const meta = [product.width ? formatInches(product.width, locale) : null, product.finish ? dict.shop.finishes[product.finish] : product.color?.[locale] ?? null].filter(Boolean).join(" · ");

  const onSelect = () => track("select_item", { item_list_name: listName, items: [toGaItem(product, { index })] });
  const onAdd = async () => {
    setAdding(true);
    await add({ productId: product.id, quantity: 1 }, { title });
    setAdding(false);
  };

  return (
    <article className={cn("group relative flex flex-col rounded-lg border border-line bg-surface p-3 transition-[box-shadow,border-color,transform] duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card", className)} aria-label={dict.a11y.productCard.replace("{title}", title)}>
      <div className="relative">
        <Link href={url} className="relative block aspect-[4/5] overflow-hidden rounded-md bg-canvas" onClick={onSelect} tabIndex={-1} aria-hidden="true">
          {img1 ? (
            <>
              <Image
                src={img1.src}
                alt=""
                width={480}
                height={600}
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                priority={priority}
                quality={60}
                className={cn("h-full w-full object-cover transition-[transform,opacity] duration-500 ease-out-quart", img2 ? "group-hover:opacity-0" : "group-hover:scale-[1.03]", soldOut && "opacity-60 grayscale-[35%]")}
              />
              {img2 ? (
                <Image src={img2.src} alt="" width={480} height={600} sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out-quart group-hover:opacity-100" aria-hidden="true" />
              ) : null}
            </>
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
              <Icon name="image" size={28} />
              <span className="text-xs font-medium">{dict.product.noImage}</span>
            </span>
          )}
        </Link>
        <ProductBadges product={product} className="absolute left-2 top-2" />
        <button
          type="button"
          className="absolute bottom-2 right-2 inline-flex h-10 items-center gap-1.5 rounded-md bg-surface/95 px-3 text-xs font-semibold shadow-card backdrop-blur transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
          onClick={() => {
            setQuickOpen(true);
            track("quick_view", { items: [toGaItem(product)] });
          }}
          aria-haspopup="dialog"
        >
          <Icon name="eye" size={15} /> {dict.product.quickView}
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{product.brand ?? dict.categories[product.category].name}</p>
        <Heading className="mt-1 text-[0.9375rem] font-bold leading-snug">
          <Link href={url} className="line-clamp-2 after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline" onClick={onSelect}>
            {title}
          </Link>
        </Heading>
        {meta ? <p className="mt-1 text-xs text-ink-soft">{meta}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ConditionBadge product={product} size="xs" />
        </div>
        <Price amount={product.price} compareAt={product.compareAtPrice} priceFrom={product.priceFrom} size="md" className="mt-3" />
        <StockBadge product={product} withLocation className="mt-1.5" />
        <div className="relative z-10 mt-3">
          {canBuy ? (
            <button type="button" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white transition-colors hover:bg-brand disabled:opacity-60" onClick={onAdd} disabled={adding} aria-busy={adding}>
              <Icon name="cart" size={16} /> {adding ? dict.product.adding : dict.product.addToCart}
            </button>
          ) : (
            <Link href={url} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line-strong bg-surface text-sm font-semibold hover:border-ink" onClick={onSelect}>
              {dict.product.viewProduct} <Icon name="arrowRight" size={16} />
            </Link>
          )}
        </div>
      </div>
      <QuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </article>
  );
}
