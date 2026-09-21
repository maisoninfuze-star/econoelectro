"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "./CartProvider";
import { CartLineItem } from "./CartLineItem";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function CartPageView({ checkoutLive }: { checkoutLive: boolean }) {
  const { dict, price, href } = useI18n();
  const { cart, status, checkout, checkingOut } = useCart();
  const lines = cart?.lines ?? [];
  if (status !== "ready" && !cart) {
    return (
      <div className="grid gap-4" aria-busy="true">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
    );
  }
  if (!lines.length) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="text-h3">{dict.cart.empty}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{dict.cart.emptyBody}</p>
        <LinkButton href={href("deals")} className="mt-5">
          {dict.cart.emptyCta} <Icon name="arrowRight" size={16} />
        </LinkButton>
      </div>
    );
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface px-5">
        {lines.map((l) => (
          <CartLineItem key={l.id} line={l} compact={false} />
        ))}
      </ul>
      <aside className="h-fit rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="text-h3">{dict.checkout.summary}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
            <dd className="text-xl font-extrabold">{price(cart!.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>{dict.cart.taxesLabel}</dt>
            <dd className="text-xs">{dict.cart.taxesNote}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>{dict.cart.delivery}</dt>
            <dd className="text-xs">{dict.cart.deliveryNote}</dd>
          </div>
        </dl>
        <Button size="lg" className="mt-5 w-full" onClick={() => void checkout()} disabled={checkingOut} aria-busy={checkingOut}>
          {checkingOut ? dict.checkout.redirecting : checkoutLive ? dict.cart.checkout : dict.cart.checkoutDev} <Icon name="arrowRight" size={18} />
        </Button>
        <p className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
          <Icon name="shield" size={14} className="mt-0.5 shrink-0" /> {dict.cart.secure}
        </p>
        <LinkButton href={href("shop")} variant="ghost" className="mt-2 w-full">
          {dict.cart.continueShopping}
        </LinkButton>
      </aside>
    </div>
  );
}
