/**
 * Centralized business configuration for Écono Électro Services.
 *
 * Every piece of business information displayed on the site comes from this
 * file. Fields marked `needsConfirmation: true` (or wrapped in an
 * `unconfirmed` object) were found on the previous website or in product
 * listings but have NOT been confirmed by the business. They are rendered
 * only when their `confirmed` flag is set to true.
 *
 * See docs/BUSINESS-CONFIRMATION.md for the full checklist.
 */

export type LocationId = "vimont" | "chomedey";

export interface StoreLocation {
  id: LocationId;
  /** Display name, e.g. "Écono Électro – Vimont" */
  name: { fr: string; en: string };
  /** Short neighbourhood label used in UI badges */
  shortName: { fr: string; en: string };
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  phone: string; // human-readable
  phoneE164: string; // for tel: links
  /** Google Maps directions target (address-based, no Place ID required) */
  mapsQuery: string;
  /** Approximate coordinates for LocalBusiness schema (from the address). */
  geo: { latitude: number; longitude: number };
}

export const BRAND = {
  name: "Écono Électro Services",
  shortName: "Écono Électro",
  legalName: "Écono Électro Services",
  tagline: {
    fr: "Électroménagers remis à neuf à prix réduits.",
    en: "Refurbished appliances at reduced prices.",
  },
  /** Primary red derived from the existing logo (sampled #ED0101). */
  color: "#ED0101",
  domain: "https://www.econoelectroservices.com",
  /** Alternate domain seen in a product listing (www.econoelectro.ca). Needs confirmation. */
  alternateDomainUnconfirmed: "https://www.econoelectro.ca",
} as const;

export const LOCATIONS: StoreLocation[] = [
  {
    id: "vimont",
    name: { fr: "Écono Électro – Vimont", en: "Écono Électro – Vimont" },
    shortName: { fr: "Vimont (rue Michelin)", en: "Vimont (Michelin St.)" },
    address: {
      street: "901, rue Michelin",
      city: "Laval",
      province: "QC",
      postalCode: "H7L 5B6",
      country: "CA",
    },
    phone: "438-773-7775",
    phoneE164: "+14387737775",
    mapsQuery: "901 Rue Michelin, Laval, QC H7L 5B6",
    geo: { latitude: 45.6017, longitude: -73.7295 },
  },
  {
    id: "chomedey",
    name: { fr: "Écono Électro – Chomedey", en: "Écono Électro – Chomedey" },
    shortName: {
      fr: "Chomedey (boul. Curé-Labelle)",
      en: "Chomedey (Curé-Labelle Blvd.)",
    },
    address: {
      street: "1777, boulevard Curé-Labelle",
      city: "Laval",
      province: "QC",
      postalCode: "H7T 1L1",
      country: "CA",
    },
    phone: "438-835-3167",
    phoneE164: "+14388353167",
    mapsQuery: "1777 Boulevard Curé-Labelle, Laval, QC H7T 1L1",
    geo: { latitude: 45.5588, longitude: -73.7437 },
  },
];

export const PRIMARY_LOCATION_ID: LocationId = "vimont";

export function getLocation(id: LocationId | null | undefined) {
  return LOCATIONS.find((l) => l.id === id) ?? null;
}

/** Opening hours: identical for both locations. */
export const HOURS = {
  /** ISO weekday numbers 1 (Mon) – 7 (Sun) */
  days: [1, 2, 3, 4, 5, 6, 7] as const,
  opens: "10:00",
  closes: "19:00",
  display: {
    fr: { days: "Lundi au dimanche", time: "10 h à 19 h" },
    en: { days: "Monday to Sunday", time: "10 a.m. to 7 p.m." },
  },
  /** For schema.org OpeningHoursSpecification */
  schemaDays: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
} as const;

/**
 * CONTACT EMAIL — NEEDS CONFIRMATION.
 * The previous site displayed "econoelectro2.@gmail.com", which is malformed
 * (a dot directly before "@"). We do NOT publish a guessed address.
 * Set `confirmed: true` and the correct `value` once verified, and the email
 * will appear in the footer, contact page and schema.
 */
export const CONTACT_EMAIL = {
  confirmed: false,
  value: "", // TODO(business): confirm — previous site showed "econoelectro2.@gmail.com"
  sourceValue: "econoelectro2.@gmail.com",
};

/** Social profiles — none were linked on the previous site. Add and confirm. */
export const SOCIAL = {
  facebook: { confirmed: false, url: "" }, // Listings mention "Facebook Marketplace"
  instagram: { confirmed: false, url: "" },
  tiktok: { confirmed: false, url: "" },
};

/**
 * WhatsApp — only enabled when a business WhatsApp number is confirmed.
 * The store phone numbers are not known to be WhatsApp-enabled.
 */
export const WHATSAPP = {
  confirmed: false,
  phoneE164: "",
};

/** Customer reviews source. */
export const REVIEWS = {
  platform: "Google",
  /**
   * Public link to all reviews. Address-based Maps search until the business
   * provides the exact Google Business Profile / Place link.
   */
  url: "https://www.google.com/maps/search/?api=1&query=%C3%89cono+%C3%89lectro+Services+901+Rue+Michelin+Laval+QC",
  placeUrlConfirmed: false,
};

/**
 * Fulfillment. Delivery is offered (the business advertises "Service de
 * livraison rapide" and "Livraison disponible"). Fees, zones and lead times
 * are NOT confirmed and are therefore not displayed as facts.
 */
export const FULFILLMENT = {
  delivery: {
    offered: true,
    /** Areas mentioned in listings ("Laval/Montréal") — confirm before publishing. */
    areasUnconfirmed: ["Laval", "Montréal"],
    feeConfirmed: false,
    fee: null as number | null,
    leadTimeConfirmed: false,
    installationOfferedUnconfirmed: true,
  },
  pickup: {
    offered: true,
    /** Pickup is available at both stores unless a product is assigned to one location. */
    locations: ["vimont", "chomedey"] as LocationId[],
  },
};

/**
 * Warranty — NOT CONFIRMED. Several previous listings mentioned a
 * "garantie de 3 mois". Until the business confirms the exact terms, no
 * warranty claim is displayed anywhere on the site.
 */
export const WARRANTY = {
  confirmed: false,
  summary: {
    fr: "", // e.g. "Garantie de 3 mois sur les pièces et la main-d'œuvre"
    en: "",
  },
  sourceMention: "Garantie de 3 mois (mentionnée dans plusieurs annonces d'origine)",
};

/** Returns — NOT CONFIRMED. Nothing is claimed until confirmed. */
export const RETURNS = {
  confirmed: false,
  summary: { fr: "", en: "" },
};

/** Financing — NOT CONFIRMED and therefore not mentioned. */
export const FINANCING = { confirmed: false, summary: { fr: "", en: "" } };

/** Taxes handled by the commerce provider (Shopify) at checkout. */
export const TAXES = {
  region: "QC",
  labels: { fr: "TPS et TVQ calculées à la caisse", en: "GST and QST calculated at checkout" },
};

export const ANNOUNCEMENT = {
  fr: FULFILLMENT.delivery.offered
    ? "Deux succursales à Laval • Livraison disponible • Ouvert 7 jours"
    : "Deux succursales à Laval • Ouvert 7 jours",
  en: FULFILLMENT.delivery.offered
    ? "Two Laval locations • Delivery available • Open 7 days"
    : "Two Laval locations • Open 7 days",
};

export const CURRENCY = "CAD";

/** Default opening year is unknown; copyright uses the current year dynamically. */
export const COPYRIGHT_HOLDER = BRAND.legalName;
