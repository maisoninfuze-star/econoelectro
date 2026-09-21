"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Price } from "./Price";
import { ConditionBadge } from "./ConditionBadge";
import { StockBadge } from "./StockBadge";
import { PickupDeliverySelector } from "./PickupDeliverySelector";
import { StockAlertForm } from "./StockAlertForm";
import { LOCATIONS, PRIMARY_LOCATION_ID, getLocation, type LocationId } from "@/config/business";
import { getAvailability, type FulfillmentMethod, type Product } from "@/lib/commerce/types";
import { track } from "@/lib/analytics/events";

export function ProductInformation({ product }: { product: Product }) {
  const { dict, locale, t, href } = useI18n();
  const { add, checkout } = useCart();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(product.pickupEligible ? "pickup" : "delivery");
  const [locationId, setLocationId] = useState<LocationId>(product.locationId ?? PRIMARY_LOCATION_ID);
  const [busy, setBusy] = useState<"add" | "buy" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = product.title[locale] || product.title.fr;
  const availability = getAvailability(product);
  const soldOut = availability === "out-of-stock";
  const canBuy = product.purchasable && !soldOut;
  const max = product.inventoryPolicy === "continue" ? 10 : product.quantity;
  const loc = product.locationId ? getLocation(product.locationId) : null;
  const phoneLoc = loc ?? LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  const variant = product.variants.find((v) => v.id === variantId);
  const price = variant ? variant.price : product.price;

  const doAdd = async (thenCheckout: boolean) => {
    setError(null);
    setBusy(thenCheckout ? "buy" : "add");
    const r = await add({ productId: product.id, variantId, quantity: qty, fulfillment, pickupLocationId: fulfillment === "pickup" ? locationId : null }, { title });
    if (!r.ok) setError(r.error === "quantity_limit" || r.error === "out_of_stock" ? dict.product.limitReached : dict.cart.error);
    else if (thenCheckout) await checkout();
    setBusy(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {product.brand ?? dict.categories[product.category].name}
          {product.model ? <span className="text-ink-muted"> · {dict.product.model} {product.model}</span> : null}
        </p>
        <h1 className="text-h1 mt-2 text-balance">{title}</h1>
        {product.shortDescription[locale] ? <p className="text-lead mt-3 text-ink-soft">{product.shortDescription[locale]}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ConditionBadge product={product} size="md" />
        <StockBadge product={product} withLocation className="text-sm" />
      </div>

      <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        <Price amount={price} compareAt={variant ? null : product.compareAtPrice} priceFrom={product.priceFrom} size="xl" />
        <p className="mt-1 text-xs text-ink-soft">{dict.product.taxesNote}</p>
        {product.priceFrom ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-warning-soft p-3 text-sm text-warning">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" /> {dict.product.priceFromNote}
          </p>
        ) : null}

        {product.variants.length ? (
          <div className="mt-4">
            <label htmlFor="variant" className="text-sm font-bold">
              {dict.product.amount}
            </label>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="variant">
              {product.variants.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={variantId === v.id} className={`h-11 rounded-md border px-4 text-sm font-semibold ${variantId === v.id ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink"}`} onClick={() => setVariantId(v.id)}>
                  {v.label[locale]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {canBuy && max > 1 ? (
          <div className="mt-4 flex items-center gap-3">
            <span id="qty-label" className="text-sm font-bold">
              {dict.product.quantity}
            </span>
            <div className="inline-flex h-11 items-center rounded-md border border-line-strong" role="group" aria-labelledby="qty-label">
              <button type="button" className="inline-flex h-full w-11 items-center justify-center hover:bg-line/70 disabled:opacity-40" aria-label={dict.cart.decrease} disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Icon name="minus" size={16} />
              </button>
              <span className="w-10 text-center font-semibold" aria-live="polite">
                {qty}
              </span>
              <button type="button" className="inline-flex h-full w-11 items-center justify-center hover:bg-line/70 disabled:opacity-40" aria-label={dict.cart.increase} disabled={qty >= max} onClick={() => setQty((q) => Math.min(max, q + 1))}>
                <Icon name="plus" size={16} />
              </button>
            </div>
            {product.inventoryPolicy !== "continue" ? <span className="text-xs text-ink-soft">{t(dict.availability["low-stock-n"], { n: product.quantity })}</span> : null}
          </div>
        ) : null}
        {canBuy && product.inventoryPolicy === "unique" ? <p className="mt-3 text-xs text-ink-soft">{dict.product.uniqueUnit}</p> : null}

        {canBuy && (product.pickupEligible || product.deliveryEligible) ? (
          <div className="mt-5">
            <PickupDeliverySelector product={product} value={fulfillment} onChange={setFulfillment} locationId={locationId} onLocationChange={setLocationId} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          {canBuy ? (
            <>
              <Button size="lg" onClick={() => void doAdd(false)} disabled={busy !== null} aria-busy={busy === "add"}>
                <Icon name="cart" size={18} /> {busy === "add" ? dict.product.adding : dict.product.addToCart}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => void doAdd(true)} disabled={busy !== null} aria-busy={busy === "buy"}>
                {busy === "buy" ? dict.checkout.redirecting : dict.product.buyNow}
              </Button>
            </>
          ) : soldOut ? (
            <div className="rounded-md bg-canvas p-4">
              <p className="font-bold">{dict.product.outOfStockTitle}</p>
              <p className="mt-1 text-sm text-ink-soft">{dict.product.outOfStockBody}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <LinkButton href={href("category", { category: product.category })} variant="secondary">
                  {dict.product.similarAvailable}
                </LinkButton>
                <LinkButton href={`tel:${phoneLoc.phoneE164}`} variant="outline" onClick={() => track("click_call", { location: phoneLoc.id, source: "product_sold_out" })}>
                  <Icon name="phone" size={16} /> {dict.product.contactStore}
                </LinkButton>
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <StockAlertForm product={product} />
              </div>
            </div>
          ) : (
            <>
              <LinkButton href={`tel:${phoneLoc.phoneE164}`} size="lg" onClick={() => track("click_call", { location: phoneLoc.id, source: "product_price_on_request" })}>
                <Icon name="phone" size={18} /> {dict.product.reserveByPhone} · {phoneLoc.phone}
              </LinkButton>
              <LinkButton href={href("contact", { query: { produit: product.slug } })} size="lg" variant="outline">
                {dict.product.askAvailability}
              </LinkButton>
            </>
          )}
          {error ? (
            <p role="alert" className="flex items-center gap-2 text-sm font-medium text-brand">
              <Icon name="alert" size={16} /> {error}
            </p>
          ) : null}
        </div>

        {canBuy ? (
          <p className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
            <span className="text-ink-soft">{dict.product.phoneHelp}</span>
            <a href={`tel:${phoneLoc.phoneE164}`} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-bold underline-offset-4 hover:underline" onClick={() => track("click_call", { location: phoneLoc.id, source: "product_help" })}>
              <Icon name="phone" size={15} /> {phoneLoc.phone}
            </a>
          </p>
        ) : null}
      </div>

      <ul className="grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
        <li className="flex items-center gap-2">
          <Icon name="check" size={16} className="text-success" /> {dict.product.inspectedNote}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="store" size={16} className="text-ink" /> {dict.common.twoLocations} · {dict.common.sevenDays}
        </li>
      </ul>
      <Link href="#condition-guide" className="text-sm font-semibold underline-offset-4 hover:underline">
        {dict.product.conditionGuide}
      </Link>
    </div>
  );
}
