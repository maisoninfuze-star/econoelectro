"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "./CartProvider";
import { Icon } from "@/components/ui/Icon";
import { ConditionBadge } from "@/components/product/ConditionBadge";
import { LOCATIONS, getLocation } from "@/config/business";
import type { CartLineWithProduct } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export function CartLineItem({ line, compact = true }: { line: CartLineWithProduct; compact?: boolean }) {
  const { dict, t, price, href, locale } = useI18n();
  const { update, remove, pendingLineId } = useCart();
  const p = line.product;
  const title = p.title[locale] || p.title.fr;
  const image = p.images[0];
  const pending = pendingLineId === line.id;
  const max = p.inventoryPolicy === "continue" ? 10 : p.quantity;
  const unique = p.inventoryPolicy === "unique" || max <= 1;
  const variant = line.variantId && p.variants.length ? p.variants.find((v) => v.id === line.variantId) : null;

  return (
    <li className={cn("flex gap-4 py-4", pending && "opacity-60")} aria-busy={pending}>
      <Link href={href("product", { slug: p.slug })} className="relative block h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-md bg-line">
        {image ? (
          <Image src={image.src} alt={image.alt[locale]} width={176} height={224} sizes="88px" className="h-full w-full object-cover" />
        ) : (
          <Icon name="image" className="absolute inset-0 m-auto text-ink-muted" />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={href("product", { slug: p.slug })} className="line-clamp-2 text-sm font-semibold leading-snug hover:underline underline-offset-4">
            {title}
            {variant ? ` – ${variant.label[locale]}` : ""}
          </Link>
          <button
            type="button"
            className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-soft hover:bg-line/70 hover:text-ink"
            aria-label={t(dict.cart.removeItem, { item: title })}
            onClick={() => void remove(line.id, title)}
            disabled={pending}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          {p.brand ? <span>{p.brand}</span> : null}
          <ConditionBadge product={p} size="xs" />
        </div>

        {/* Fulfillment */}
        {p.pickupEligible || p.deliveryEligible ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <label className="sr-only" htmlFor={`ful-${line.id}`}>
              {dict.product.fulfillment}
            </label>
            <select
              id={`ful-${line.id}`}
              className="h-9 rounded-md border border-line bg-surface px-2 text-xs font-medium"
              value={line.fulfillment}
              disabled={pending}
              onChange={(e) => void update({ lineId: line.id, fulfillment: e.target.value as "pickup" | "delivery", pickupLocationId: line.pickupLocationId })}
            >
              {p.pickupEligible ? <option value="pickup">{dict.product.pickup}</option> : null}
              {p.deliveryEligible ? <option value="delivery">{dict.product.delivery}</option> : null}
            </select>
            {line.fulfillment === "pickup" ? (
              p.locationId ? (
                <span className="inline-flex items-center gap-1 text-ink-soft">
                  <Icon name="mapPin" size={13} /> {getLocation(p.locationId)?.shortName[locale]}
                </span>
              ) : (
                <>
                  <label className="sr-only" htmlFor={`loc-${line.id}`}>
                    {dict.product.chooseLocation}
                  </label>
                  <select
                    id={`loc-${line.id}`}
                    className="h-9 rounded-md border border-line bg-surface px-2 text-xs font-medium"
                    value={line.pickupLocationId ?? ""}
                    disabled={pending}
                    onChange={(e) => void update({ lineId: line.id, pickupLocationId: e.target.value as "vimont" | "chomedey" })}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.shortName[locale]}
                      </option>
                    ))}
                  </select>
                </>
              )
            ) : null}
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          {unique ? (
            <span className="text-xs text-ink-soft">{dict.product.uniqueUnit.split(":")[0]}</span>
          ) : (
            <div className="inline-flex h-9 items-center rounded-md border border-line" role="group" aria-label={t(dict.a11y.quantityFor, { item: title })}>
              <button type="button" className="inline-flex h-full w-9 items-center justify-center hover:bg-line/70 disabled:opacity-40" aria-label={dict.cart.decrease} disabled={pending || line.quantity <= 1} onClick={() => void update({ lineId: line.id, quantity: line.quantity - 1 })}>
                <Icon name="minus" size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                {line.quantity}
              </span>
              <button type="button" className="inline-flex h-full w-9 items-center justify-center hover:bg-line/70 disabled:opacity-40" aria-label={dict.cart.increase} disabled={pending || line.quantity >= max} onClick={() => void update({ lineId: line.id, quantity: line.quantity + 1 })}>
                <Icon name="plus" size={14} />
              </button>
            </div>
          )}
          <div className="text-right">
            <span className="block text-base font-extrabold">{price(line.lineTotal)}</span>
            {line.quantity > 1 && !compact ? <span className="block text-xs text-ink-soft">{t(dict.cart.lineUnitPrice, { price: price(line.unitPrice) })}</span> : null}
          </div>
        </div>
      </div>
    </li>
  );
}
