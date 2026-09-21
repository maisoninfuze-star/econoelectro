"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "bottom" | "center" | "top";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog / drawer: focus trap, Escape to close, backdrop click,
 * body scroll lock, focus restoration. Rendered in a portal.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  side = "center",
  panelClassName,
  children,
  closeOnBackdrop = true,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  side?: Side;
  panelClassName?: string;
  children: ReactNode;
  closeOnBackdrop?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-modal-open", "true");
    document.addEventListener("keydown", onKeyDown);
    const t = window.setTimeout(() => {
      const autofocus = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      const first = autofocus ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    }, 30);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      document.body.removeAttribute("data-modal-open");
      restoreRef.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  const sideClasses: Record<Side, string> = {
    right: "inset-y-0 right-0 h-full w-full max-w-md anim-slide-in-right",
    left: "inset-y-0 left-0 h-full w-full max-w-sm anim-slide-in-left",
    bottom: "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-xl anim-slide-in-up",
    top: "inset-x-0 top-0 anim-fade-in",
    center: "left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl anim-rise-in",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="presentation">
      <div className="absolute inset-0 bg-ink/45 anim-fade-in" onClick={closeOnBackdrop ? onClose : undefined} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn("absolute bg-surface shadow-float outline-none flex flex-col overflow-hidden", sideClasses[side], panelClassName)}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
