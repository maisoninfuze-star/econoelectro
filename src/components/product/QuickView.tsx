"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Button, LinkButton } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Price } from "./Price";
import { ConditionBadge } from "./ConditionBadge";
import { StockBadge } from "./StockBadge";
import { getAvailability, type Product } from "@/lib/commerce/types";
import { formatDimensions } from "@/lib/i18n/format";

export function QuickView({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { dict, locale, href } = useI18n();
  const { add } = useCart();
  const [active, setActive] = useState(0);
  const [adding, setAdding] = useState(false);
  const title = product.title[locale] || product.title.fr;
  const id = `qv-${product.id.replace(/[^a-z0-9]/gi, "")}`;
  const canBuy = product.purchasable && getAvailability(product) !== "out-of-stock";
  const img = product.images[active] ?? product.images[0];
  return (
    <Dialog open={open} onClose={onClose} labelledBy={`${id}-title`} side="center" panelClassName="max-w-4xl">
      <div className="grid max-h-[88dvh] overflow-y-auto md:grid-cols-[1fr_1fr]">
        <div className="bg-canvas p-3">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-line">
            {img ? <Image src={img.src} alt={img.alt[locale]} width={720} height={900} sizes="(min-width: 768px) 420px, 90vw" className="h-full w-full object-cover" /> : <Icon name="image" className="absolute inset-0 m-auto text-ink-muted" size={32} />}
          </div>
          {product.images.length > 1 ? (
            <ul className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.slice(0, 6).map((im, i) => (
                <li key={im.src}>
                  <button type="button" className={`h-16 w-14 overflow-hidden rounded-md border-2 ${i === active ? "border-ink" : "border-transparent"}`} aria-label={dict.a11y.thumbnail.replace("{n}", String(i + 1))} aria-pressed={i === active} onClick={() => setActive(i)}>
                    <Image src={im.src} alt="" width={112} height={128} sizes="56px" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-col p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{product.brand ?? dict.categories[product.category].name}</p>
              <h2 id={`${id}-title`} className="mt-1 text-xl font-extrabold leading-tight">
                {title}
              </h2>
            </div>
            <button type="button" className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-line/70" aria-label={dict.common.close} onClick={onClose}>
              <Icon name="close" size={22} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ConditionBadge product={product} />
            <StockBadge product={product} withLocation />
          </div>
          <Price amount={product.price} compareAt={product.compareAtPrice} priceFrom={product.priceFrom} size="lg" className="mt-4" />
          {product.shortDescription[locale] ? <p className="mt-3 text-sm text-ink-soft">{product.shortDescription[locale]}</p> : null}
          {product.dimensions ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
              <Icon name="ruler" size={16} /> {formatDimensions(product.dimensions, locale)}
            </p>
          ) : null}
          <div className="mt-auto flex flex-col gap-2 pt-5">
            {canBuy ? (
              <Button
                size="lg"
                onClick={async () => {
                  setAdding(true);
                  const r = await add({ productId: product.id, quantity: 1 }, { title });
                  setAdding(false);
                  if (r.ok) onClose();
                }}
                disabled={adding}
              >
                <Icon name="cart" size={18} /> {adding ? dict.product.adding : dict.product.addToCart}
              </Button>
            ) : null}
            <LinkButton href={href("product", { slug: product.slug })} variant={canBuy ? "outline" : "primary"} size="lg" onClick={onClose}>
              {dict.product.viewProduct} <Icon name="arrowRight" size={18} />
            </LinkButton>
            <Link href={href("product", { slug: product.slug })} className="sr-only">
              {title}
            </Link>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
