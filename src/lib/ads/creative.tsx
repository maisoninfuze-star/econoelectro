/* eslint-disable @next/next/no-img-element -- satori (next/og) renders plain <img> elements */
import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ogFonts } from "@/lib/seo/og-fonts";
import { ogImageData, ogPngData } from "@/lib/seo/og-image";
import { existsSync } from "node:fs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatInches, formatPrice } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import { BADGE_PRIORITY } from "@/config/site";
import { BRAND, FULFILLMENT, LOCATIONS, PRIMARY_LOCATION_ID, getLocation } from "@/config/business";
import { getAvailability, type Product } from "@/lib/commerce/types";
import { percentOff } from "@/lib/utils";
import { productKind } from "./kind";

/**
 * Meta (Facebook / Instagram) ad creatives rendered from the REAL product photo
 * plus structured data. Nothing about the appliance is altered: the photo is
 * cover-cropped into the frame and the price, condition and store come from
 * the catalog. Rendered with next/og (satori) using the site's Manrope fonts.
 */
export type AdFormat = "square" | "portrait" | "story";

interface FormatSpec {
  width: number;
  height: number;
  /** Height of the photo area */
  photo: number;
  /** Type scale multiplier */
  s: number;
  /** Bottom area kept free for the platform UI (Stories / Reels) */
  safeBottom: number;
}

export const AD_FORMATS: Record<AdFormat, FormatSpec> = {
  square: { width: 1080, height: 1080, photo: 590, s: 1, safeBottom: 0 },
  portrait: { width: 1080, height: 1350, photo: 830, s: 1.05, safeBottom: 0 },
  story: { width: 1080, height: 1920, photo: 1010, s: 1.12, safeBottom: 300 },
};

/** Keep prices and "2 000 $" groups on one line in rendered text. */
function nb(s: string): string {
  return s.replace(/(\d) (?=\d{3}\b)/g, "$1\u00a0").replace(/ \$/g, "\u00a0$").replace(/\$ ?(?=\d)/g, "$\u00a0").replace(/\$\u00a0/g, "$");
}

export function isAdFormat(v: string | null): v is AdFormat {
  return v === "square" || v === "portrait" || v === "story";
}

/** Path of the reviewed background-removed cutout for a product, if one exists (see scripts/fal-cutouts.mjs). */
export function cutoutPath(product: Product): string | null {
  const first = product.images[0]?.src;
  if (!first) return null;
  const dirId = first.split("/")[3];
  const rel = `/images/ads/cutouts/${dirId}.png`;
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

/** Path of the reviewed fal.ai lifestyle scene (real cutout placed in a generated room), if one exists. */
export function scenePath(product: Product): string | null {
  const first = product.images[0]?.src;
  if (!first) return null;
  const dirId = first.split("/")[3];
  const rel = `/images/ads/scenes/${dirId}.jpg`;
  return existsSync(path.join(process.cwd(), "public", rel)) ? rel : null;
}

export type AdVariant = "photo" | "studio" | "scene";
export function isAdVariant(v: string | null): v is AdVariant {
  return v === "photo" || v === "studio" || v === "scene";
}

export interface AdOptions {
  /** photo = real photo (default); studio = cutout on a studio backdrop; scene = cutout in a fal.ai lifestyle scene. Falls back to photo when the asset is missing. */
  variant?: AdVariant;
}

export async function renderAdCreative(product: Product, format: AdFormat, locale: Locale, options: AdOptions = {}): Promise<ImageResponse> {
  const spec = AD_FORMATS[format];
  const { width, height, photo, s, safeBottom } = spec;
  const dict = getDictionary(locale);
  const wanted = options.variant ?? "photo";
  const scene = wanted === "scene" ? scenePath(product) : null;
  const cutout = wanted === "studio" ? cutoutPath(product) : null;
  const [fonts, logoBuf, photoData] = await Promise.all([
    ogFonts(),
    readFile(path.join(process.cwd(), "public/brand/logo-192.png")),
    scene ? ogImageData(scene) : cutout ? ogPngData(cutout) : product.images[0] ? ogImageData(product.images[0].src) : Promise.resolve(null),
  ]);
  const studio = Boolean(cutout && photoData);
  const variant: AdVariant = scene && photoData ? "scene" : studio ? "studio" : "photo";
  const logo = `data:image/png;base64,${logoBuf.toString("base64")}`;

  const title = product.title[locale] || product.title.fr;
  const price = nb(formatPrice(product.price, locale, { decimals: false }));
  const compare = product.compareAtPrice && product.compareAtPrice > product.price ? nb(formatPrice(product.compareAtPrice, locale, { decimals: false })) : null;
  const pct = percentOff(product.price, product.compareAtPrice);
  const badgeId = BADGE_PRIORITY.find((b) => product.badges.includes(b)) ?? null;
  const badgeText = badgeId ? dict.badges[badgeId] : null;
  const badgeBg = badgeId === "sale" ? "#ED0101" : badgeId === "available-today" ? "#1D7A3F" : "#111111";
  const conditionText = `${dict.condition[product.condition]} · ${locale === "fr" ? "Inspecté et testé" : "Inspected and tested"}`;
  const loc = product.locationId ? getLocation(product.locationId) : null;
  const phoneLoc = loc ?? LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  const availability = getAvailability(product);
  const metaParts = [
    product.width ? `${dict.product.width} ${formatInches(product.width, locale)}` : null,
    product.finish ? dict.shop.finishes[product.finish] : product.color?.[locale] ?? null,
    availability === "out-of-stock" ? dict.availability["out-of-stock"] : loc ? dict.availability.atLocation.replace("{location}", loc.shortName[locale]) : dict.common.twoLocations,
  ].filter(Boolean);
  const brandLine = [product.brand ?? productKind(product, locale), product.brand ? productKind(product, locale) : null].filter(Boolean).join(" · ");
  const footerLine = FULFILLMENT.delivery.offered
    ? locale === "fr" ? "Deux succursales à Laval · Livraison disponible" : "Two Laval locations · Delivery available"
    : dict.common.twoLocations;
  const domain = BRAND.domain.replace(/^https?:\/\//, "");

  const titleSize = Math.round((format === "story" ? 52 : 44) * s);
  const priceSize = Math.round((format === "story" ? 80 : 66) * s);
  const pad = Math.round(56 * s);

  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", flexDirection: "column", background: "#F7F7F4", fontFamily: "Manrope", color: "#111111" }}>
        {/* Photo */}
        <div style={{ display: "flex", position: "relative", width, height: photo, overflow: "hidden", background: studio ? "linear-gradient(180deg, #FBFBF9 0%, #ECECE8 100%)" : "#E9E9E6" }}>
          {studio ? (
            <div style={{ position: "absolute", left: Math.round(width * 0.18), right: Math.round(width * 0.18), bottom: Math.round(34 * s), height: Math.round(70 * s), display: "flex", background: "radial-gradient(ellipse at center, rgba(17,17,17,0.22) 0%, rgba(17,17,17,0) 68%)" }} />
          ) : null}
          {photoData ? (
            <img src={photoData} alt="" width={width} height={photo} style={{ objectFit: studio ? "contain" : "cover", objectPosition: variant === "scene" ? "center 62%" : "center", width, height: photo, padding: studio ? `${Math.round(70 * s)}px ${Math.round(80 * s)}px ${Math.round(56 * s)}px` : 0 }} />
          ) : null}
          {badgeText ? (
            <div style={{ position: "absolute", top: Math.round(40 * s), left: Math.round(40 * s), display: "flex", background: badgeBg, color: "#ffffff", fontSize: Math.round(22 * s), fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: `${Math.round(12 * s)}px ${Math.round(20 * s)}px`, borderRadius: 8 }}>
              {badgeText}
            </div>
          ) : null}
          <div style={{ position: "absolute", bottom: Math.round(32 * s), left: Math.round(40 * s), display: "flex", background: "rgba(255,255,255,0.94)", color: "#111111", fontSize: Math.round(22 * s), fontWeight: 800, padding: `${Math.round(10 * s)}px ${Math.round(18 * s)}px`, borderRadius: 8 }}>
            {conditionText}
          </div>
        </div>

        {/* Panel */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#ffffff", padding: `${Math.round(44 * s)}px ${pad}px ${Math.round(32 * s)}px` }}>
          <div style={{ display: "flex", fontSize: Math.round(22 * s), fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: "#656565" }}>{brandLine}</div>
          <div style={{ marginTop: Math.round(10 * s), fontSize: titleSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1, color: "#111111", lineClamp: 2 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: Math.round(18 * s), gap: Math.round(16 * s) }}>
            {product.priceFrom ? <span style={{ fontSize: Math.round(24 * s), fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#656565" }}>{dict.product.priceFrom}</span> : null}
            <span style={{ fontSize: priceSize, fontWeight: 800, color: pct ? "#ED0101" : "#111111", letterSpacing: -2, lineHeight: 1 }}>{price}</span>
            {compare ? <span style={{ fontSize: Math.round(32 * s), color: "#656565", textDecoration: "line-through" }}>{compare}</span> : null}
            {pct ? <span style={{ display: "flex", fontSize: Math.round(24 * s), fontWeight: 800, color: "#C90000", background: "#FDEAEA", padding: `${Math.round(6 * s)}px ${Math.round(12 * s)}px`, borderRadius: 6 }}>{`-${pct} %`}</span> : null}
          </div>
          <div style={{ display: "flex", marginTop: Math.round(12 * s), fontSize: Math.round(24 * s), color: "#656565" }}>{metaParts.join("  ·  ")}</div>
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #E9E9E6", paddingTop: Math.round(20 * s) }}>
            <img src={logo} alt="" width={Math.round(210 * s)} height={Math.round(70 * s)} style={{ objectFit: "contain", width: Math.round(210 * s), height: Math.round(70 * s) }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: Math.round(22 * s), lineHeight: 1.35 }}>
              <span style={{ fontWeight: 800 }}>{phoneLoc.phone}</span>
              <span style={{ color: "#656565" }}>{footerLine}</span>
            </div>
          </div>
        </div>

        {/* Stories / Reels: keep the bottom band free of essential content */}
        {safeBottom ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: safeBottom, background: "#F7F7F4", color: "#656565", fontSize: Math.round(22 * s), letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>
            {domain}
          </div>
        ) : null}
        <div style={{ display: "flex", height: Math.round(12 * s), background: "#ED0101" }} />
      </div>
    ),
    { width, height, fonts, headers: { "x-ad-variant": variant } },
  );
}

/** Campaign-level creative: a generated editorial scene (fal.ai FLUX) with the campaign headline. Never shows a specific unit. */
export const CAMPAIGN_IMAGES: Record<string, string> = {
  ensembles: "/images/creatives/hero-appliance-set-wide.webp",
  "laveuses-secheuses": "/images/creatives/laundry-lifestyle.webp",
  refrigerateurs: "/images/creatives/kitchen-fridge.webp",
  cuisinieres: "/images/creatives/kitchen-range.webp",
  marque: "/images/creatives/kitchen-lifestyle.webp",
};

export async function renderCampaignCreative(campaign: { key: string; name: string; headline: string; description: string }, format: AdFormat, locale: Locale): Promise<ImageResponse> {
  const spec = AD_FORMATS[format];
  const { width, height, photo, s, safeBottom } = spec;
  const dict = getDictionary(locale);
  const image = CAMPAIGN_IMAGES[campaign.key] ?? CAMPAIGN_IMAGES.marque;
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  const [fonts, logoBuf, photoData] = await Promise.all([ogFonts(), readFile(path.join(process.cwd(), "public/brand/logo-192.png")), ogImageData(image)]);
  const logo = `data:image/png;base64,${logoBuf.toString("base64")}`;
  const inspected = locale === "fr" ? "Nettoyés, testés et inspectés avant la vente" : "Cleaned, tested and inspected before sale";
  const footerLine = FULFILLMENT.delivery.offered ? (locale === "fr" ? "Deux succursales à Laval · Livraison disponible" : "Two Laval locations · Delivery available") : dict.common.twoLocations;
  const domain = BRAND.domain.replace(/^https?:\/\//, "");
  const titleSize = Math.round((format === "story" ? 60 : 50) * s);
  const pad = Math.round(56 * s);
  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", flexDirection: "column", background: "#F7F7F4", fontFamily: "Manrope", color: "#111111" }}>
        <div style={{ display: "flex", position: "relative", width, height: photo, overflow: "hidden", background: "#E9E9E6" }}>
          {photoData ? <img src={photoData} alt="" width={width} height={photo} style={{ objectFit: "cover", width, height: photo }} /> : null}
          <div style={{ position: "absolute", top: Math.round(40 * s), left: Math.round(40 * s), display: "flex", background: "#ED0101", color: "#ffffff", fontSize: Math.round(22 * s), fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", padding: `${Math.round(12 * s)}px ${Math.round(20 * s)}px`, borderRadius: 8 }}>
            {dict.hero.eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: "#ffffff", padding: `${Math.round(44 * s)}px ${pad}px ${Math.round(32 * s)}px` }}>
          <div style={{ display: "flex", fontSize: Math.round(22 * s), fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", color: "#656565" }}>{campaign.name}</div>
          <div style={{ marginTop: Math.round(10 * s), fontSize: titleSize, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5, color: "#111111", lineClamp: 2 }}>{nb(campaign.headline)}</div>
          <div style={{ display: "flex", marginTop: Math.round(18 * s), fontSize: Math.round(26 * s), color: "#656565" }}>{`${campaign.description}  ·  ${inspected}`}</div>
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #E9E9E6", paddingTop: Math.round(20 * s) }}>
            <img src={logo} alt="" width={Math.round(210 * s)} height={Math.round(70 * s)} style={{ objectFit: "contain", width: Math.round(210 * s), height: Math.round(70 * s) }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", fontSize: Math.round(22 * s), lineHeight: 1.35 }}>
              <span style={{ fontWeight: 800 }}>{primary.phone}</span>
              <span style={{ color: "#656565" }}>{footerLine}</span>
            </div>
          </div>
        </div>
        {safeBottom ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: safeBottom, background: "#F7F7F4", color: "#656565", fontSize: Math.round(22 * s), letterSpacing: 2, textTransform: "uppercase", fontWeight: 800 }}>
            {domain}
          </div>
        ) : null}
        <div style={{ display: "flex", height: Math.round(12 * s), background: "#ED0101" }} />
      </div>
    ),
    { width, height, fonts },
  );
}
