"use client";

import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "./CartProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LOCATIONS, PRIMARY_LOCATION_ID, getLocation } from "@/config/business";
import { track, toGaItem } from "@/lib/analytics/events";

const field = "mt-1 h-12 w-full rounded-md border border-line-strong bg-surface px-3 text-base text-ink outline-none focus:border-ink disabled:bg-canvas";

/**
 * Checkout handoff page. With Shopify configured, customers are redirected to
 * the hosted checkout before reaching this page. In demo mode it shows the
 * flow with payment DISABLED — never pretending the checkout is live.
 */
export function CheckoutView({ checkoutLive }: { checkoutLive: boolean }) {
  const { dict, locale, price, href } = useI18n();
  const { cart, status, checkout, checkingOut } = useCart();
  const [method, setMethod] = useState<"pickup" | "delivery">("pickup");
  const lines = cart?.lines ?? [];
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;

  if (status !== "ready" && !cart) return <div className="skeleton h-40 rounded-xl" aria-busy="true" />;
  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="text-h3">{dict.cart.empty}</p>
        <LinkButton href={href("shop")} className="mt-5">
          {dict.nav.shop}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <ol className="flex flex-wrap gap-2 text-xs font-semibold" aria-label={dict.checkout.title}>
          {dict.checkout.steps.map((s, i) => (
            <li key={s} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${i === 1 ? "bg-ink text-white" : "bg-surface text-ink-soft"}`}>
              <span aria-hidden="true">{i + 1}</span> {s}
            </li>
          ))}
        </ol>

        {!checkoutLive ? (
          <div role="status" className="rounded-xl border border-warning/30 bg-warning-soft p-5">
            <p className="flex items-center gap-2 font-bold text-warning">
              <Icon name="alert" size={18} /> {dict.checkout.devTitle}
            </p>
            <p className="mt-2 text-sm text-ink">{dict.checkout.devBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <a key={l.id} href={`tel:${l.phoneE164}`} className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white" onClick={() => track("click_call", { location: l.id, source: "checkout_demo" })}>
                  <Icon name="phone" size={16} /> {l.shortName[locale]} · {l.phone}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-xl bg-surface p-5 text-sm text-ink-soft">{dict.checkout.hostedNote}</p>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} aria-describedby="checkout-disabled-note">
          <fieldset className="rounded-xl border border-line bg-surface p-5">
            <legend className="px-1 text-base font-bold">{dict.checkout.customerInfo}</legend>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                {dict.checkout.firstName}
                <input name="firstName" autoComplete="given-name" className={field} disabled={!checkoutLive} />
              </label>
              <label className="block text-sm font-semibold">
                {dict.checkout.lastName}
                <input name="lastName" autoComplete="family-name" className={field} disabled={!checkoutLive} />
              </label>
              <label className="block text-sm font-semibold">
                {dict.checkout.email}
                <input name="email" type="email" autoComplete="email" className={field} disabled={!checkoutLive} />
              </label>
              <label className="block text-sm font-semibold">
                {dict.checkout.phone}
                <input name="phone" type="tel" autoComplete="tel" className={field} disabled={!checkoutLive} />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-line bg-surface p-5">
            <legend className="px-1 text-base font-bold">{dict.checkout.method}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(["pickup", "delivery"] as const).map((m) => (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm font-semibold ${method === m ? "border-ink" : "border-line"}`}>
                  <input type="radio" name="method" value={m} checked={method === m} onChange={() => { setMethod(m); track("add_shipping_info", { shipping_tier: m }); }} className="h-4 w-4 accent-ink" />
                  <Icon name={m === "pickup" ? "store" : "truck"} size={16} /> {m === "pickup" ? dict.product.pickup : dict.product.delivery}
                </label>
              ))}
            </div>
            {method === "delivery" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold sm:col-span-2">
                  {dict.checkout.address}
                  <input name="address" autoComplete="street-address" className={field} disabled={!checkoutLive} />
                </label>
                <label className="block text-sm font-semibold">
                  {dict.checkout.city}
                  <input name="city" autoComplete="address-level2" className={field} disabled={!checkoutLive} />
                </label>
                <label className="block text-sm font-semibold">
                  {dict.checkout.postalCode}
                  <input name="postalCode" autoComplete="postal-code" className={field} disabled={!checkoutLive} />
                </label>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                {dict.product.pickupAt} {lines[0]?.pickupLocationId ? getLocation(lines[0].pickupLocationId)?.name[locale] : primary.name[locale]}
              </p>
            )}
          </fieldset>

          <div className="rounded-xl border border-line bg-surface p-5">
            <label className="block text-sm font-semibold">
              {dict.checkout.discountCode}
              <div className="mt-1 flex gap-2">
                <input name="discount" className={`${field} mt-0`} disabled={!checkoutLive} />
                <Button variant="outline" disabled={!checkoutLive}>
                  {dict.checkout.applyCode}
                </Button>
              </div>
            </label>
          </div>
        </form>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="text-h3">{dict.checkout.summary}</h2>
        <ul className="mt-4 divide-y divide-line">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-3 text-sm">
              <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-canvas">
                {l.product.images[0] ? <Image src={l.product.images[0].src} alt="" width={96} height={112} sizes="48px" className="h-full w-full object-cover" /> : null}
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{l.quantity}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-semibold">{l.product.title[locale] || l.product.title.fr}</span>
                <span className="block text-xs text-ink-soft">{l.fulfillment === "pickup" ? dict.product.pickup : dict.product.delivery}</span>
              </span>
              <span className="font-bold">{price(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
            <dd className="text-lg font-extrabold">{price(cart!.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-xs text-ink-soft">
            <dt>{dict.cart.taxesLabel}</dt>
            <dd>{dict.cart.taxesNote}</dd>
          </div>
        </dl>
        {checkoutLive ? (
          <Button size="lg" className="mt-5 w-full" onClick={() => void checkout()} disabled={checkingOut} aria-busy={checkingOut}>
            <Icon name="shield" size={18} /> {checkingOut ? dict.checkout.redirecting : dict.checkout.pay}
          </Button>
        ) : (
          <>
            <Button size="lg" className="mt-5 w-full" disabled aria-disabled="true" title={dict.checkout.devTitle}>
              <Icon name="shield" size={18} /> {dict.checkout.payDisabled}
            </Button>
            <p id="checkout-disabled-note" className="mt-2 text-xs text-ink-soft">
              {dict.checkout.devTitle}
            </p>
            <LinkButton href={`tel:${primary.phoneE164}`} variant="secondary" size="lg" className="mt-2 w-full" onClick={() => track("click_call", { location: primary.id, source: "checkout_reserve" })}>
              <Icon name="phone" size={18} /> {dict.checkout.reserveInstead}
            </LinkButton>
          </>
        )}
        <p className="mt-3 text-xs text-ink-soft">{dict.checkout.inventoryNote}</p>
        <button type="button" className="sr-only" onClick={() => track("view_cart", { items: lines.map((l) => toGaItem(l.product)) })} aria-hidden="true" tabIndex={-1} />
      </aside>
    </div>
  );
}
