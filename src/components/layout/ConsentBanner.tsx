"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { readConsent, subscribeConsent, writeConsent } from "@/lib/analytics/consent";
import { Button } from "@/components/ui/Button";

const HAS_TRACKING = Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID);

/** Shown only when a tracking tool is configured and no choice has been recorded. */
export function ConsentBanner() {
  const { dict, href } = useI18n();
  // Server snapshot "granted" keeps the banner out of the HTML; the client re-renders once hydrated.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "granted" as const);
  if (!HAS_TRACKING || consent !== "unset") return null;
  return (
    <div role="region" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-xl rounded-xl border border-line bg-surface p-4 shadow-float anim-rise-in lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0">
      <h2 id="consent-title" className="text-sm font-bold">
        {dict.consent.title}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        {dict.consent.body}{" "}
        <Link href={href("policy", { policy: "privacy" })} className="underline underline-offset-4">
          {dict.consent.learnMore}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => writeConsent("granted")}>
          {dict.consent.accept}
        </Button>
        <Button size="sm" variant="outline" onClick={() => writeConsent("denied")}>
          {dict.consent.decline}
        </Button>
      </div>
    </div>
  );
}
