import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatInches, formatPrice } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";
import { href } from "@/lib/i18n/routes";
import { SITE_URL } from "@/lib/seo/metadata";
import { FULFILLMENT, LOCATIONS, PRIMARY_LOCATION_ID, getLocation } from "@/config/business";
import { CATEGORIES } from "@/config/site";
import { getAvailability, type CategoryId, type Product } from "@/lib/commerce/types";
import { productKind } from "./kind";

/**
 * Meta ad copy generated from structured product data. Every sentence is
 * traceable to the catalog or to business facts the store already publishes
 * (inspected before sale, two Laval stores, delivery offered, free pickup).
 * No warranty, financing, review-count or "lowest price" claims.
 */
export interface ProductAdCopy {
  id: string;
  slug: string;
  productTitle: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: "SHOP_NOW";
  landingUrl: string;
  price: string;
  compareAtPrice: string | null;
  notes: string[];
}

export interface CampaignAdCopy {
  key: string;
  name: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: "SHOP_NOW";
  landingUrl: string;
}

export const AD_CAMPAIGN = "meta-catalogue-2026-09";

function utm(url: string, content: string, campaign = AD_CAMPAIGN): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "facebook");
  u.searchParams.set("utm_medium", "paid_social");
  u.searchParams.set("utm_campaign", campaign);
  u.searchParams.set("utm_content", content);
  return u.toString();
}

function clip(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function productAdCopy(p: Product, locale: Locale): ProductAdCopy {
  const dict = getDictionary(locale);
  const fr = locale === "fr";
  const price = formatPrice(p.price, locale, { decimals: false });
  const compare = p.compareAtPrice && p.compareAtPrice > p.price ? formatPrice(p.compareAtPrice, locale, { decimals: false }) : null;
  const title = p.title[locale] || p.title.fr;
  const kind = productKind(p, locale);
  const loc = p.locationId ? getLocation(p.locationId) : null;
  const availability = getAvailability(p);
  const notes: string[] = [];

  const priceSentence = p.priceFrom
    ? fr ? `${title} : à partir de ${price}.` : `${title}: from ${price}.`
    : compare
      ? fr ? `${title} à ${price} au lieu de ${compare}.` : `${title} for ${price} instead of ${compare}.`
      : fr ? `${title} à ${price}.` : `${title} for ${price}.`;
  const short = p.shortDescription[locale] || p.shortDescription.fr;
  const inspected = fr ? "Nettoyé, testé et inspecté par notre équipe avant la vente." : "Cleaned, tested and inspected by our team before sale.";
  const where = loc
    ? fr ? `En stock à notre succursale ${loc.shortName.fr}.` : `In stock at our ${loc.shortName.en} store.`
    : fr ? "En stock dans nos succursales de Laval." : "In stock at our Laval stores.";
  const fulfil = FULFILLMENT.delivery.offered
    ? fr ? "Cueillette sans frais ou livraison disponible." : "Free pickup or delivery available."
    : fr ? "Cueillette sans frais en magasin." : "Free store pickup.";
  let stock = "";
  if (availability === "out-of-stock") {
    stock = fr ? "Vendu." : "Sold.";
    notes.push(fr ? "Produit vendu : ne pas diffuser." : "Product sold: do not run.");
  } else if (p.priceFrom) {
    stock = fr ? "Plusieurs unités offertes; le prix exact est confirmé selon l'unité choisie." : "Several units available; the exact price is confirmed for the unit you choose.";
  } else if (p.inventoryPolicy === "unique" || p.quantity === 1) {
    stock = fr ? "Unité unique : dès qu'elle est vendue, elle est retirée du site." : "One-of-a-kind unit: once sold, it is removed from the site.";
  } else if (p.quantity > 1 && p.inventoryPolicy !== "continue") {
    stock = fr ? `${p.quantity} en stock.` : `${p.quantity} in stock.`;
  }
  if (p.images.length === 0) notes.push(fr ? "Aucune photo : ajouter une photo avant diffusion." : "No photo: add one before running.");

  const primaryText = [priceSentence, short, inspected, `${where} ${fulfil}`, stock].filter(Boolean).join("\n");
  const headlineBase = [kind, p.brand, p.width ? formatInches(p.width, locale) : null].filter(Boolean).join(" ");
  const headline = clip(`${headlineBase} – ${p.priceFrom ? (fr ? "dès " : "from ") : ""}${price}`, 40);
  const description = fr ? "Remis à neuf · Inspecté · Laval" : "Refurbished · Inspected · Laval";
  const landingUrl = utm(`${SITE_URL}${href(locale, "product", { slug: p.slug })}`, p.slug);
  void dict;
  return { id: p.id, slug: p.slug, productTitle: title, primaryText, headline, description, callToAction: "SHOP_NOW", landingUrl, price, compareAtPrice: compare, notes };
}

export function campaignAdCopy(products: Product[], locale: Locale): CampaignAdCopy[] {
  const dict = getDictionary(locale);
  const fr = locale === "fr";
  const active = products.filter((p) => p.status === "active" && getAvailability(p) !== "out-of-stock" && p.subcategory !== "carte-cadeau");
  const minPrice = (cat: CategoryId) => {
    const prices = active.filter((p) => p.category === cat).map((p) => p.price);
    return prices.length ? formatPrice(Math.min(...prices), locale, { decimals: false }) : null;
  };
  const primary = LOCATIONS.find((l) => l.id === PRIMARY_LOCATION_ID)!;
  const delivery = FULFILLMENT.delivery.offered ? (fr ? "Livraison disponible ou cueillette sans frais." : "Delivery available or free pickup.") : fr ? "Cueillette sans frais." : "Free pickup.";
  const stores = fr ? "Deux succursales à Laval, ouvertes 7 jours sur 7." : "Two Laval stores, open 7 days a week.";
  const inspected = fr ? "Chaque appareil est nettoyé, testé et inspecté avant la vente." : "Every appliance is cleaned, tested and inspected before sale.";
  const cat = (id: CategoryId) => `${SITE_URL}${href(locale, "category", { category: id })}`;
  const out: CampaignAdCopy[] = [];

  const sets = minPrice("ensembles");
  if (sets) {
    out.push({
      key: "ensembles",
      name: fr ? "Ensembles 4 appareils" : "4-piece appliance sets",
      primaryText: [fr ? `Équipez toute la maison d'un coup : réfrigérateur, cuisinière, laveuse et sécheuse assortis, à partir de ${sets}.` : `Equip the whole home at once: matching refrigerator, range, washer and dryer, from ${sets}.`, inspected, fr ? "Acheter en ensemble coûte moins cher que les appareils vendus séparément, et nous coordonnons une seule livraison." : "Buying a set costs less than the appliances sold separately, and we coordinate a single delivery.", stores].join("\n"),
      headline: clip(fr ? `Ensembles d'électroménagers dès ${sets}` : `Appliance sets from ${sets}`, 40),
      description: fr ? "Remis à neuf · Inspectés · Laval" : "Refurbished · Inspected · Laval",
      callToAction: "SHOP_NOW",
      landingUrl: utm(cat("ensembles"), "campagne-ensembles"),
    });
  }
  const laundry = minPrice("laveuses-secheuses");
  if (laundry) {
    out.push({
      key: "laveuses-secheuses",
      name: fr ? "Laveuses et sécheuses" : "Washers and dryers",
      primaryText: [fr ? `Ensemble laveuse et sécheuse à partir de ${laundry}. Samsung, LG, GE, Maytag et Blomberg, en blanc, gris ou acier inoxydable, formats standard et compacts.` : `Washer and dryer sets from ${laundry}. Samsung, LG, GE, Maytag and Blomberg, in white, grey or stainless, standard and compact sizes.`, inspected, delivery, stores].join("\n"),
      headline: clip(fr ? `Laveuse et sécheuse dès ${laundry}` : `Washer and dryer from ${laundry}`, 40),
      description: fr ? "Ensembles inspectés · Laval" : "Inspected sets · Laval",
      callToAction: "SHOP_NOW",
      landingUrl: utm(cat("laveuses-secheuses"), "campagne-laveuses-secheuses"),
    });
  }
  const fridges = minPrice("refrigerateurs");
  if (fridges) {
    out.push({
      key: "refrigerateurs",
      name: fr ? "Réfrigérateurs" : "Refrigerators",
      primaryText: [fr ? `Réfrigérateurs remis à neuf à partir de ${fridges} : portes françaises, congélateur en bas, formats de 32 à 37 po, Samsung, LG, GE, Maytag et plus.` : `Refurbished refrigerators from ${fridges}: French door, bottom freezer, 32 to 37 in., Samsung, LG, GE, Maytag and more.`, fr ? "Les dimensions exactes sont indiquées sur chaque fiche pour que l'appareil entre dans votre cuisine." : "Exact dimensions are listed on every product so the appliance fits your kitchen.", inspected, delivery].join("\n"),
      headline: clip(fr ? `Réfrigérateurs dès ${fridges}` : `Refrigerators from ${fridges}`, 40),
      description: fr ? "Remis à neuf · Inspectés · Laval" : "Refurbished · Inspected · Laval",
      callToAction: "SHOP_NOW",
      landingUrl: utm(cat("refrigerateurs"), "campagne-refrigerateurs"),
    });
  }
  const ranges = minPrice("cuisinieres");
  if (ranges) {
    out.push({
      key: "cuisinieres",
      name: fr ? "Cuisinières" : "Ranges",
      primaryText: [fr ? `Cuisinières électriques remises à neuf à partir de ${ranges} : Whirlpool, LG, Maytag, Amana, surface vitrocéramique ou double four, fini acier inoxydable.` : `Refurbished electric ranges from ${ranges}: Whirlpool, LG, Maytag, Amana, ceramic glass cooktop or double oven, stainless finish.`, inspected, delivery, stores].join("\n"),
      headline: clip(fr ? `Cuisinières dès ${ranges}` : `Ranges from ${ranges}`, 40),
      description: fr ? "Remis à neuf · Inspectées · Laval" : "Refurbished · Inspected · Laval",
      callToAction: "SHOP_NOW",
      landingUrl: utm(cat("cuisinieres"), "campagne-cuisinieres"),
    });
  }
  out.push({
    key: "marque",
    name: fr ? "Notoriété locale" : "Local awareness",
    primaryText: [dict.hero.headline, fr ? "Électroménagers remis à neuf à Laval : réfrigérateurs, cuisinières, laveuses, sécheuses et ensembles, à une fraction du prix du neuf." : "Refurbished appliances in Laval: refrigerators, ranges, washers, dryers and sets at a fraction of the price of new.", inspected, `${stores} ${fr ? "Appelez-nous au" : "Call us at"} ${primary.phone}.`].join("\n"),
    headline: clip(dict.hero.eyebrow, 40),
    description: fr ? "Deux succursales · 7 jours sur 7" : "Two stores · Open 7 days",
    callToAction: "SHOP_NOW",
    landingUrl: utm(`${SITE_URL}${href(locale, "shop")}`, "campagne-marque"),
  });
  void CATEGORIES;
  return out;
}
