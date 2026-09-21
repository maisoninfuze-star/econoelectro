"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useI18n } from "@/components/providers/I18nProvider";
import { ProductBadges } from "./ProductBadges";
import type { Product } from "@/lib/commerce/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: Product }) {
  const { dict, locale } = useI18n();
  const images = product.images;
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [zooming, setZooming] = useState(false);
  const total = images.length;
  const current = images[active];

  const go = useCallback((dir: 1 | -1) => setActive((a) => (total ? (a + dir + total) % total : 0)), [total]);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };

  if (!current) {
    return (
      <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong bg-canvas text-ink-muted">
        <Icon name="image" size={36} />
        <p className="text-sm font-semibold text-ink-soft">{dict.product.noImage}</p>
        <p className="px-6 text-center text-xs">{dict.product.noImageHint}</p>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative">
        <button
          type="button"
          className="group relative block aspect-[4/5] w-full cursor-zoom-in overflow-hidden rounded-lg bg-canvas"
          onClick={() => setLightbox(true)}
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => setZooming(false)}
          onMouseMove={onMove}
          aria-label={`${dict.product.zoom} – ${dict.product.imageOf.replace("{n}", String(active + 1)).replace("{total}", String(total))}`}
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt[locale]}
            width={current.width}
            height={current.height}
            priority
            fetchPriority="high"
            quality={60}
            sizes="(min-width: 1024px) 560px, 100vw"
            className={cn("h-full w-full object-cover transition-transform duration-300 ease-out-quart anim-fade-in", zooming && "md:scale-[1.6]")}
            style={{ transformOrigin: origin }}
          />
          <span className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-md bg-surface/90 px-2.5 text-xs font-semibold shadow-card backdrop-blur">
            <Icon name="zoomIn" size={15} /> {dict.product.zoom}
          </span>
        </button>
        <ProductBadges product={product} max={3} className="absolute left-3 top-3" />
        {total > 1 ? (
          <>
            <button type="button" className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-card md:hidden" aria-label={dict.a11y.previous} onClick={() => go(-1)}>
              <Icon name="chevronLeft" />
            </button>
            <button type="button" className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-card md:hidden" aria-label={dict.a11y.next} onClick={() => go(1)}>
              <Icon name="chevronRight" />
            </button>
          </>
        ) : null}
      </div>
      {total > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto no-scrollbar" aria-label={dict.product.gallery}>
          {images.map((im, i) => (
            <li key={im.src} className="shrink-0">
              <button
                type="button"
                className={cn("block h-20 w-16 overflow-hidden rounded-md border-2 transition-colors", i === active ? "border-ink" : "border-transparent hover:border-line-strong")}
                aria-label={dict.a11y.thumbnail.replace("{n}", String(i + 1))}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              >
                <Image src={im.src} alt="" width={128} height={160} sizes="64px" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {dict.product.imageOf.replace("{n}", String(active + 1)).replace("{total}", String(total))}
      </p>

      <Dialog open={lightbox} onClose={() => setLightbox(false)} labelledBy="lightbox-title" side="center" panelClassName="max-w-5xl bg-ink text-white">
        <div className="relative">
          <h2 id="lightbox-title" className="sr-only">
            {dict.product.gallery}
          </h2>
          <button type="button" className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/50 hover:bg-black/70" aria-label={dict.common.close} onClick={() => setLightbox(false)}>
            <Icon name="close" size={22} />
          </button>
          <div className="relative flex max-h-[88dvh] items-center justify-center">
            <Image key={current.src} src={current.src} alt={current.alt[locale]} width={current.width} height={current.height} sizes="90vw" className="max-h-[88dvh] w-auto object-contain anim-fade-in" />
          </div>
          {total > 1 ? (
            <>
              <button type="button" className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70" aria-label={dict.a11y.previous} onClick={() => go(-1)}>
                <Icon name="chevronLeft" size={24} />
              </button>
              <button type="button" className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70" aria-label={dict.a11y.next} onClick={() => go(1)}>
                <Icon name="chevronRight" size={24} />
              </button>
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs">
                {active + 1} / {total}
              </p>
            </>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
