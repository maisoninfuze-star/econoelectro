"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Soft section reveal, progressively enhanced:
 * - Server HTML is fully visible (no-JS, crawlers, LCP).
 * - After mount, elements still below the fold are faded out and revealed when they
 *   scroll into view. Elements the user jumps past (anchor links, fast scroll) are
 *   revealed immediately by a shared, throttled scroll check.
 * - Reduced-motion users never see the animation.
 */
const pending = new Set<HTMLElement>();
let scrollBound = false;
let raf = 0;
function checkPending() {
  raf = 0;
  for (const el of pending) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top < window.innerHeight * 0.92) show(el);
  }
}
function onScroll() {
  if (!raf) raf = window.requestAnimationFrame(checkPending);
}
function show(el: HTMLElement) {
  el.classList.remove("reveal-pending");
  el.classList.add("reveal-visible");
  pending.delete(el);
}

export function Reveal({ children, className, as: Tag = "div", delay = 0 }: { children: ReactNode; className?: string; as?: "div" | "section" | "li" | "article"; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return; // already in view: never hide it
    el.classList.add("reveal-pending");
    pending.add(el);
    if (!scrollBound) {
      scrollBound = true;
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { show(el); io.disconnect(); }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      pending.delete(el);
    };
  }, []);
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
