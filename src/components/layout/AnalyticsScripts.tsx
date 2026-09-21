"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { captureUtm, readConsent, subscribeConsent } from "@/lib/analytics/consent";

const GA4 = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Consent Mode v2: defaults to denied; tags load only after consent is granted.
 * GA4 / Google Ads / Meta Pixel IDs come from the environment.
 */
export function AnalyticsScripts() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "unset" as const);

  useEffect(() => {
    captureUtm();
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    window.gtag?.("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" });
  }, [consent]);

  // SPA page views
  useEffect(() => {
    if (consent !== "granted") return;
    window.gtag?.("event", "page_view", { page_path: pathname });
    window.fbq?.("track", "PageView");
  }, [pathname, consent]);

  const gtagId = GA4 || ADS;
  if (!gtagId && !PIXEL) return null;
  return (
    <>
      <Script id="consent-default" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`}
      </Script>
      {consent === "granted" && gtagId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`gtag('js', new Date());${GA4 ? `gtag('config','${GA4}',{send_page_view:false});` : ""}${ADS ? `gtag('config','${ADS}');` : ""}`}
          </Script>
        </>
      ) : null}
      {consent === "granted" && PIXEL ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');`}
        </Script>
      ) : null}
    </>
  );
}
