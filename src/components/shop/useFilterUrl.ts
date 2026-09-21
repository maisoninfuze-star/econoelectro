"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/** Filter/sort/search state lives in the URL. */
export function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setMany = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || (Array.isArray(v) && v.length === 0) || v === "") next.delete(k);
        else next.set(k, Array.isArray(v) ? v.join(",") : v);
      }
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp],
  );

  const toggleInList = useCallback(
    (key: string, value: string) => {
      const current = (sp.get(key) ?? "").split(",").filter(Boolean);
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      setMany({ [key]: next });
    },
    [sp, setMany],
  );

  const list = useCallback((key: string) => (sp.get(key) ?? "").split(",").filter(Boolean), [sp]);
  const get = useCallback((key: string) => sp.get(key), [sp]);
  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  return { sp, get, list, setMany, toggleInList, clear };
}
