"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { Dialog } from "@/components/ui/Dialog";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SearchOverlay, type SearchIndexItem } from "./SearchOverlay";
import { CATEGORIES } from "@/config/site";
import { LOCATIONS, HOURS, PRIMARY_LOCATION_ID } from "@/config/business";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/lib/commerce/types";

export function HeaderClient({ searchIndex, accountUrl }: { searchIndex: SearchIndexItem[]; accountUrl: string | null }) {
  const { locale, dict, href } = useI18n();
  const { cart, open: openCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaId = useId();
  const megaTimer = useRef<number | null>(null);
  const megaHover = useRef(false);
  const megaRef = useRef<HTMLLIElement>(null);
  const count = cart?.itemCount ?? 0;
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlays on navigation (state adjustment during render, no effect needed)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
    setMegaOpen(false);
  }

  const openMega = useCallback(() => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaHover.current = true;
    setMegaOpen(true);
  }, []);
  const toggleMega = useCallback(() => {
    // A click right after a hover-open keeps the panel open (mouse users); a second click closes it.
    if (megaOpen && !megaHover.current) setMegaOpen(false);
    else {
      megaHover.current = false;
      setMegaOpen(true);
    }
  }, [megaOpen]);
  const closeMegaSoon = useCallback(() => {
    if (megaTimer.current) window.clearTimeout(megaTimer.current);
    megaTimer.current = window.setTimeout(() => setMegaOpen(false), 140);
  }, []);
  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    const onFocusOut = (e: FocusEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.relatedTarget as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const el = megaRef.current;
    el?.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("keydown", onKey);
      el?.removeEventListener("focusout", onFocusOut);
    };
  }, [megaOpen]);

  const catName = (id: CategoryId) => dict.categories[id].name;
  const primaryNav: { label: string; to: string; category?: CategoryId; xlOnly?: boolean }[] = [
    { label: catName("refrigerateurs"), to: href("category", { category: "refrigerateurs" }), category: "refrigerateurs" },
    { label: catName("cuisinieres"), to: href("category", { category: "cuisinieres" }), category: "cuisinieres" },
    { label: catName("laveuses-secheuses"), to: href("category", { category: "laveuses-secheuses" }), category: "laveuses-secheuses" },
    { label: catName("ensembles"), to: href("category", { category: "ensembles" }), category: "ensembles", xlOnly: true },
    { label: dict.nav.deals, to: href("deals") },
  ];
  const isActive = (to: string) => pathname === to || (to !== "/" && pathname.startsWith(to));

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85 transition-shadow duration-300",
          scrolled && "shadow-[0_6px_24px_-16px_rgb(17_17_17/0.35)]",
        )}
        data-scrolled={scrolled || undefined}
      >
        <div className={cn("container-x relative flex items-center gap-2 transition-[height] duration-300 ease-out-quart", scrolled ? "h-[60px]" : "h-[68px] lg:h-[76px]")}>
          {/* Mobile: menu */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-line/70 lg:hidden"
            aria-label={dict.a11y.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" size={22} />
          </button>

          {/* Logo */}
          <Link href={href("home")} className="flex shrink-0 items-center rounded-md" aria-label={dict.common.brand}>
            <Image
              src="/brand/logo-96.png"
              alt={dict.common.brand}
              width={288}
              height={96}
              priority
              className={cn("w-auto transition-[height] duration-300", scrolled ? "h-8 lg:h-9" : "h-9 lg:h-11")}
              sizes="(min-width: 1024px) 170px, 130px"
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label={dict.a11y.mainNav} className="hidden lg:flex lg:flex-1 lg:justify-center">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              <li ref={megaRef} onMouseEnter={openMega} onMouseLeave={closeMegaSoon}>
                <button
                  type="button"
                  className={cn("inline-flex h-11 items-center gap-1 whitespace-nowrap rounded-md px-2.5 text-sm font-semibold hover:bg-line/70 xl:px-3 xl:text-[0.9375rem]", megaOpen && "bg-line/70")}
                  aria-expanded={megaOpen}
                  aria-controls={megaId}
                  aria-haspopup="true"
                  onClick={toggleMega}
                >
                  {dict.nav.shop}
                  <Icon name="chevronDown" size={16} className={cn("transition-transform duration-200", megaOpen && "rotate-180")} />
                </button>
                <div
                  id={megaId}
                  hidden={!megaOpen}
                  className="absolute left-4 right-4 top-full z-40 mx-auto mt-1 w-[min(900px,100%)] rounded-xl border border-line bg-surface p-5 shadow-float anim-rise-in xl:left-0 xl:right-0"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMegaSoon}
                >
                  <div className="grid grid-cols-[1fr_220px] gap-6">
                    <ul className="grid grid-cols-3 gap-3">
                      {CATEGORIES.map((c) => (
                        <li key={c.id}>
                          <Link
                            href={href("category", { category: c.id })}
                            className="group flex flex-col gap-2 rounded-lg p-2 hover:bg-canvas"
                            onClick={() => setMegaOpen(false)}
                          >
                            <span className="relative block aspect-[4/3] overflow-hidden rounded-md bg-line">
                              <Image src={c.image.src} alt="" width={320} height={240} sizes="200px" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                            </span>
                            <span className="text-sm font-bold">{dict.categories[c.id].name}</span>
                            <span className="-mt-1.5 text-xs text-ink-soft">{dict.categories[c.id].short}</span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={href("deals")} className="group flex h-full flex-col justify-between rounded-lg bg-brand-soft p-4 hover:bg-brand/15" onClick={() => setMegaOpen(false)}>
                          <Icon name="tag" size={22} className="text-brand" />
                          <span>
                            <span className="block text-sm font-bold">{dict.nav.deals}</span>
                            <span className="block text-xs text-ink-soft">{dict.deals.intro.split(".")[0]}.</span>
                          </span>
                        </Link>
                      </li>
                    </ul>
                    <div className="flex flex-col justify-between rounded-lg bg-ink p-4 text-white">
                      <div>
                        <p className="text-eyebrow text-white/60">{dict.nav.browseByCategory}</p>
                        <p className="mt-2 text-sm text-white/85">{dict.nav.megaMenuHint}</p>
                      </div>
                      <Link href={href("shop")} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline" onClick={() => setMegaOpen(false)}>
                        {dict.nav.allProducts} <Icon name="arrowRight" size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              {primaryNav.map((item) => (
                <li key={item.to} className={item.xlOnly ? "hidden xl:block" : undefined}>
                  <Link
                    href={item.to}
                    className={cn(
                      "inline-flex h-11 items-center whitespace-nowrap rounded-md px-2.5 text-sm font-semibold hover:bg-line/70 xl:px-3 xl:text-[0.9375rem]",
                      isActive(item.to) && "text-brand",
                    )}
                    aria-current={isActive(item.to) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Utilities */}
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-md px-2.5 hover:bg-line/70 xl:min-w-[220px] xl:justify-start xl:border xl:border-line xl:bg-canvas xl:text-ink-soft"
              onClick={() => setSearchOpen(true)}
            >
              <Icon name="search" size={20} />
              <span className="sr-only">{dict.search.open}. </span>
              <span className="hidden text-sm xl:inline">{dict.search.placeholder}</span>
            </button>
            <a
              href={`tel:${primary.phoneE164}`}
              className="hidden h-11 items-center gap-2 rounded-md px-2.5 text-sm font-semibold hover:bg-line/70 md:inline-flex"
              onClick={() => track("click_call", { location: primary.id, source: "header" })}
              aria-label={dict.a11y.callLocation.replace("{name}", primary.name[locale]).replace("{phone}", primary.phone)}
            >
              <Icon name="phone" size={18} />
              <span className="hidden 2xl:inline">{primary.phone}</span>
            </a>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            {accountUrl ? (
              <a href={accountUrl} className="hidden h-11 w-11 items-center justify-center rounded-md hover:bg-line/70 md:inline-flex" aria-label={dict.common.account}>
                <Icon name="user" size={20} />
              </a>
            ) : null}
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-line/70"
              aria-label={`${dict.cart.open} (${count})`}
              onClick={openCart}
            >
              <Icon name="cart" size={22} />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white" aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} labelledBy="mobile-menu-title" side="left" panelClassName="max-w-[22rem]">
        <div id="mobile-menu" className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id="mobile-menu-title" className="text-base font-bold">
              {dict.common.menu}
            </h2>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-line/70" aria-label={dict.a11y.closeMenu} onClick={() => setMenuOpen(false)}>
              <Icon name="close" size={22} />
            </button>
          </div>
          <nav aria-label={dict.a11y.mobileNav} className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-0.5">
              <li>
                <Link href={href("home")} className="flex h-12 items-center rounded-md px-3 text-base font-semibold hover:bg-canvas">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={href("shop")} className="flex h-12 items-center justify-between rounded-md px-3 text-base font-semibold hover:bg-canvas">
                  {dict.nav.shop}
                  <Icon name="arrowRight" size={18} />
                </Link>
                <ul className="mb-2 ml-3 border-l border-line pl-2">
                  {CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <Link href={href("category", { category: c.id })} className="flex h-11 items-center rounded-md px-3 text-[0.9375rem] hover:bg-canvas">
                        {dict.categories[c.id].name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {[
                { label: dict.nav.deals, to: href("deals") },
                { label: dict.nav.about, to: href("about") },
                { label: dict.nav.locations, to: href("locations") },
                { label: dict.nav.reviews, to: href("reviews") },
                { label: dict.nav.contact, to: href("contact") },
              ].map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="flex h-12 items-center rounded-md px-3 text-base font-semibold hover:bg-canvas">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-line bg-canvas px-4 py-4 text-sm">
            {LOCATIONS.map((l) => (
              <a key={l.id} href={`tel:${l.phoneE164}`} className="flex items-center gap-3 rounded-md py-1 font-semibold" onClick={() => track("click_call", { location: l.id, source: "mobile_menu" })}>
                <Icon name="phone" size={18} className="text-brand" />
                <span>
                  {l.shortName[locale]} <span className="text-ink-soft">·</span> {l.phone}
                </span>
              </a>
            ))}
            <p className="flex items-center gap-3 text-ink-soft">
              <Icon name="clock" size={18} /> {HOURS.display[locale].days}, {HOURS.display[locale].time}
            </p>
            <div className="flex items-center justify-between pt-1">
              <LanguageSwitcher variant="full" />
              {accountUrl ? (
                <a href={accountUrl} className="inline-flex h-11 items-center gap-2 rounded-md px-2.5 font-semibold">
                  <Icon name="user" size={18} /> {dict.common.account}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Dialog>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} index={searchIndex} />
    </>
  );
}
