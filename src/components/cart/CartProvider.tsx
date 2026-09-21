"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Cart, CartAddInput, CartUpdateInput } from "@/lib/commerce/types";
import { track, toGaItem } from "@/lib/analytics/events";
import { readUtm } from "@/lib/analytics/consent";
import { useI18n } from "@/components/providers/I18nProvider";

type Status = "idle" | "loading" | "ready" | "error";

interface CartContextValue {
  cart: Cart | null;
  status: Status;
  isOpen: boolean;
  pendingLineId: string | null;
  message: string | null;
  open: () => void;
  close: () => void;
  add: (input: CartAddInput, meta?: { title: string }) => Promise<{ ok: boolean; error?: string }>;
  update: (input: CartUpdateInput) => Promise<{ ok: boolean; error?: string }>;
  remove: (lineId: string, title?: string) => Promise<void>;
  checkout: () => Promise<void>;
  checkingOut: boolean;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

async function api<T>(body: Record<string, unknown>): Promise<{ ok: true; data: T } | { ok: false; error: string; meta?: Record<string, unknown> }> {
  try {
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = (await res.json()) as { cart?: Cart; error?: string; meta?: Record<string, unknown> };
    if (!res.ok || json.error) return { ok: false, error: json.error ?? "server_error", meta: json.meta };
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, error: "network" };
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { dict, t, href, locale } = useI18n();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);
  // Close the drawer when the route changes (state adjustment during render).
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (isOpen) setIsOpen(false);
  }

  const announce = useCallback((text: string) => {
    setMessage(text);
    if (liveRef.current) {
      liveRef.current.textContent = "";
      window.setTimeout(() => {
        if (liveRef.current) liveRef.current.textContent = text;
      }, 50);
    }
  }, []);

  const refresh = useCallback(async () => {
    const res = await api<{ cart: Cart | null }>({ action: "get" });
    if (res.ok) {
      setCart(res.data.cart);
      setStatus("ready");
    } else setStatus("error");
  }, []);

  // Initial load: subscribe-style effect (state is set in the fetch callback, never synchronously).
  useEffect(() => {
    let active = true;
    api<{ cart: Cart | null }>({ action: "get" }).then((res) => {
      if (!active) return;
      if (res.ok) {
        setCart(res.data.cart);
        setStatus("ready");
      } else setStatus("error");
    });
    return () => {
      active = false;
    };
  }, []);

  const errorText = useCallback(
    (code: string) => {
      if (code === "quantity_limit" || code === "out_of_stock") return dict.cart.limitReached;
      return dict.cart.error;
    },
    [dict],
  );

  const add = useCallback<CartContextValue["add"]>(
    async (input, meta) => {
      const res = await api<{ cart: Cart }>({ action: "add", ...input });
      if (!res.ok) {
        announce(errorText(res.error));
        return { ok: false, error: res.error };
      }
      setCart(res.data.cart);
      setStatus("ready");
      setIsOpen(true);
      announce(t(dict.cart.added, { item: meta?.title ?? "" }));
      const line = res.data.cart.lines.find((l) => l.productId === input.productId);
      if (line) track("add_to_cart", { currency: "CAD", value: line.unitPrice * (input.quantity ?? 1), items: [toGaItem(line.product, { quantity: input.quantity ?? 1 })] });
      return { ok: true };
    },
    [announce, dict, errorText, t],
  );

  const update = useCallback<CartContextValue["update"]>(
    async (input) => {
      setPendingLineId(input.lineId);
      const res = await api<{ cart: Cart }>({ action: "update", ...input });
      setPendingLineId(null);
      if (!res.ok) {
        announce(errorText(res.error));
        return { ok: false, error: res.error };
      }
      setCart(res.data.cart);
      announce(dict.cart.updated);
      return { ok: true };
    },
    [announce, dict, errorText],
  );

  const remove = useCallback<CartContextValue["remove"]>(
    async (lineId, title) => {
      const line = cart?.lines.find((l) => l.id === lineId);
      setPendingLineId(lineId);
      const res = await api<{ cart: Cart }>({ action: "remove", lineId });
      setPendingLineId(null);
      if (res.ok) {
        setCart(res.data.cart);
        announce(t(dict.cart.removed, { item: title ?? "" }));
        if (line) track("remove_from_cart", { currency: "CAD", value: line.lineTotal, items: [toGaItem(line.product, { quantity: line.quantity })] });
      } else announce(errorText(res.error));
    },
    [announce, cart, dict, errorText, t],
  );

  const checkout = useCallback(async () => {
    if (!cart || cart.lines.length === 0) return;
    setCheckingOut(true);
    track("begin_checkout", { currency: "CAD", value: cart.subtotal, items: cart.lines.map((l) => toGaItem(l.product, { quantity: l.quantity })) });
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ utm: readUtm(), locale }) });
      const json = (await res.json()) as { live?: boolean; url?: string | null };
      if (json.live && json.url) {
        window.location.assign(json.url);
        return;
      }
      setIsOpen(false);
      router.push(href("checkout"));
    } catch {
      announce(dict.cart.error);
    } finally {
      setCheckingOut(false);
    }
  }, [announce, cart, dict, href, locale, router]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      status,
      isOpen,
      pendingLineId,
      message,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      update,
      remove,
      checkout,
      checkingOut,
      refresh,
    }),
    [cart, status, isOpen, pendingLineId, message, add, update, remove, checkout, checkingOut, refresh],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div ref={liveRef} role="status" aria-live="polite" aria-atomic="true" className="sr-only" />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
