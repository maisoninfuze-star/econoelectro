"use client";

import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { Button, LinkButton } from "@/components/ui/Button";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "./CartProvider";
import { CartLineItem } from "./CartLineItem";

export function CartDrawer({ checkoutLive }: { checkoutLive: boolean }) {
  const { dict, t, price, href } = useI18n();
  const { cart, status, isOpen, close, checkout, checkingOut } = useCart();
  const lines = cart?.lines ?? [];
  const count = cart?.itemCount ?? 0;

  return (
    <Dialog open={isOpen} onClose={close} labelledBy="cart-title" side="right" panelClassName="max-w-[28rem]">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 id="cart-title" className="text-lg font-bold">
          {count ? t(dict.cart.titleCount, { count }) : dict.cart.title}
        </h2>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-line/70" aria-label={dict.cart.close} onClick={close}>
          <Icon name="close" size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {status === "loading" && !cart ? (
          <div className="space-y-4" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-24 w-20 rounded-md" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : lines.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-canvas">
              <Icon name="cart" size={26} className="text-ink-soft" />
            </span>
            <p className="text-base font-bold">{dict.cart.empty}</p>
            <p className="max-w-xs text-sm text-ink-soft">{dict.cart.emptyBody}</p>
            <LinkButton href={href("deals")} variant="secondary" size="md" className="mt-2" onClick={close}>
              {dict.cart.emptyCta}
            </LinkButton>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
        )}
      </div>

      {lines.length > 0 ? (
        <div className="border-t border-line bg-canvas px-5 py-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">{dict.cart.subtotal}</dt>
              <dd className="text-lg font-extrabold">{price(cart!.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between text-ink-soft">
              <dt>{dict.cart.taxesLabel}</dt>
              <dd className="text-xs">{dict.cart.taxesNote}</dd>
            </div>
            <div className="flex items-center justify-between text-ink-soft">
              <dt>{dict.cart.delivery}</dt>
              <dd className="text-xs">{dict.cart.deliveryNote}</dd>
            </div>
          </dl>
          <Button size="lg" className="mt-4 w-full" onClick={() => void checkout()} disabled={checkingOut} aria-busy={checkingOut}>
            {checkingOut ? dict.checkout.redirecting : checkoutLive ? dict.cart.checkout : dict.cart.checkoutDev}
            <Icon name="arrowRight" size={18} />
          </Button>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
            <Link href={href("cart")} className="font-semibold underline-offset-4 hover:underline" onClick={close}>
              {dict.cart.viewCart}
            </Link>
            <button type="button" className="font-semibold underline-offset-4 hover:underline" onClick={close}>
              {dict.cart.continueShopping}
            </button>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] text-ink-soft">
            <Icon name="shield" size={14} className="mt-0.5 shrink-0" /> {dict.cart.secure}
          </p>
        </div>
      ) : null}
    </Dialog>
  );
}
