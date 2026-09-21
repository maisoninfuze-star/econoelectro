"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Google Maps embed loaded only on interaction or when near the viewport. */
export function LazyMap({ query, title, loadLabel, privacyNote }: { query: string; title: string; loadLabel: string; privacyNote: string }) {
  const [load, setLoad] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || load || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const src = key ? `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}` : `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div ref={ref} className="relative aspect-[16/9] bg-canvas">
      {load ? (
        <iframe title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <button type="button" className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm font-semibold text-ink" onClick={() => setLoad(true)}>
          <Icon name="mapPin" size={24} className="text-brand" /> {loadLabel}
          <span className="px-6 text-center text-xs font-normal text-ink-soft">{privacyNote}</span>
        </button>
      )}
    </div>
  );
}
