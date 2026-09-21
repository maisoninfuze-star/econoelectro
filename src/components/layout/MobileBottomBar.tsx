"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { LOCATIONS, PRIMARY_LOCATION_ID } from "@/config/business";
import { track } from "@/lib/analytics/events";

/** Discreet sticky action bar on mobile: Shop / Call / Cart. Hidden while a dialog is open (body[data-modal-open]). */
export function MobileBottomBar() {
  const { dict } = useI18n();
  const { href } = useI18n();
  const { cart, open } = useCart();
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  const count = cart?.itemCount ?? 0;
  const item = "flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold";
  return (
    <nav
      aria-label={dict.a11y.bottomBar}
      className="bottom-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe lg:hidden [body[data-modal-open]_&]:hidden"
    >
      <div className="flex h-16">
        <Link href={href("shop")} className={item}>
          <Icon name="store" size={22} />
          {dict.nav.bottomShop}
        </Link>
        <a href={`tel:${primary.phoneE164}`} className={item} onClick={() => track("click_call", { location: primary.id, source: "bottom_bar" })}>
          <Icon name="phone" size={22} />
          {dict.nav.bottomCall}
        </a>
        <button type="button" className={`${item} relative`} onClick={open} aria-label={`${dict.cart.open} (${count})`}>
          <span className="relative">
            <Icon name="cart" size={22} />
            {count > 0 ? <span className="absolute -right-2.5 -top-1.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{count}</span> : null}
          </span>
          {dict.nav.bottomCart}
        </button>
      </div>
    </nav>
  );
}
