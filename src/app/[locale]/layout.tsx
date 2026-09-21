import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { htmlLang, isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getActiveProducts, getCommerce } from "@/lib/commerce";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { AnalyticsScripts } from "@/components/layout/AnalyticsScripts";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { SITE_URL } from "@/lib/seo/metadata";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { BRAND } from "@/config/business";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND.name,
  title: { default: BRAND.name, template: "%s | Écono Électro" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const products = await getActiveProducts();
  const checkoutLive = getCommerce().isCheckoutLive();

  return (
    <html lang={htmlLang[locale]} className={manrope.variable}>
      <head>
        <JsonLd data={organizationJsonLd(locale)} />
        <JsonLd data={websiteJsonLd(locale)} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <CartProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
              {dict.common.skipToContent}
            </a>
            <OfflineBanner />
            <AnnouncementBar locale={locale} />
            <SiteHeader products={products} locale={locale} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter locale={locale} />
            <MobileBottomBar />
            <CartDrawer checkoutLive={checkoutLive} />
            <ConsentBanner />
            <AnalyticsScripts />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
