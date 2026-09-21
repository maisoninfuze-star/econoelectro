#!/usr/bin/env node
/**
 * Non-destructive catalog cleanup.
 *
 * Reads:  src/data/source/hostinger-products.json  (raw scrape, never modified)
 *         scripts/catalog-overrides.mjs             (human-authored fields)
 *         src/data/product-images.json              (optional: sizes from import-images)
 * Writes: src/data/products.json                     (structured, bilingual catalog)
 *         src/data/catalog-review.json               (records needing manual review)
 *         src/data/redirects.json                    (old URL -> new route)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { overrides } from "./catalog-overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const SOURCE = path.join(root, "src/data/source/hostinger-products.json");
const OUT = path.join(root, "src/data/products.json");
const REVIEW = path.join(root, "src/data/catalog-review.json");
const REDIRECTS = path.join(root, "src/data/redirects.json");
const IMAGE_MANIFEST = path.join(root, "src/data/product-images.json");

const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const imageManifest = fs.existsSync(IMAGE_MANIFEST)
  ? JSON.parse(fs.readFileSync(IMAGE_MANIFEST, "utf8"))
  : {};

const BRANDS = [
  "GE Profile", "Samsung", "LG", "Whirlpool", "Maytag", "GE", "Frigidaire", "KitchenAid",
  "Amana", "Blomberg", "Bosch", "Electrolux", "Kenmore", "Inglis",
];

const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{2600}-\u{27BF}]/gu;

function stripDecorations(name) {
  return name
    .replace(EMOJI_RE, " ")
    .replace(/\|\s*EconoElectroServices/gi, " ")
    .replace(/[•·]+\s*\t*/g, " ")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-\s.]+|[-\s.!]+$/g, "");
}

/** Title-case an ALL CAPS French/English title while keeping brands and units. */
function normalizeCase(s) {
  const letters = s.replace(/[^A-Za-zÀ-ÿ]/g, "");
  const upper = letters.replace(/[^A-ZÀ-Ý]/g, "").length;
  if (letters.length === 0 || upper / letters.length < 0.7) return s;
  const lower = s.toLowerCase();
  let out = lower.charAt(0).toUpperCase() + lower.slice(1);
  for (const b of BRANDS) {
    out = out.replace(new RegExp(`\\b${b.toLowerCase()}\\b`, "g"), b);
  }
  return out;
}

function detectBrand(text) {
  for (const b of BRANDS) {
    if (new RegExp(`\\b${b}\\b`, "i").test(text)) return b;
  }
  return null;
}

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/(ensemble|pack|set)\b/.test(t) && /(r[ée]frig|frigo|fridge)/.test(t) && /(cuisini|stove|range)/.test(t)) return "ensembles";
  if (/(laveuse|s[ée]cheuse|washer|dryer)/.test(t)) return "laveuses-secheuses";
  if (/(r[ée]frig|frigo|fridge|refrigerator)/.test(t)) return "refrigerateurs";
  if (/(cuisini|stove|range|po[êe]le)/.test(t)) return "cuisinieres";
  if (/(cong[ée]lateur|freezer|lave-vaisselle|dishwasher|gift card|carte-cadeau)/.test(t)) return "autres";
  return "autres";
}

function detectWidth(text) {
  const m = text.match(/(\d{2})\s*(po\b|pouces|"|-?inch|in\b)/i);
  return m ? Number(m[1]) : null;
}

function detectDims(text) {
  const L = text.match(/\bL\s*[:\-]\s*(\d{2,3})/);
  const H = text.match(/\bH\s*[:\-]\s*(\d{2,3})/);
  const P = text.match(/\bP\s*[:\-]\s*(\d{2,3})/);
  if (!L && !H && !P) return null;
  return { widthIn: L ? +L[1] : null, heightIn: H ? +H[1] : null, depthIn: P ? +P[1] : null };
}

function detectQuantity(text) {
  const m = text.match(/(\d+)\s*(units?|unit[ée]s|ensembles)\s*(available|disponibles)/i);
  return m ? Number(m[1]) : null;
}

function detectPriceFrom(text) {
  return /(à partir de|from \$|starting at)/i.test(text);
}

function detectLocation(text) {
  if (/901/.test(text) && /michelin/i.test(text)) return "vimont";
  if (/1777/.test(text) || /cur[ée]-labelle/i.test(text)) return "chomedey";
  return null;
}

function detectWarranty(text) {
  const m = text.match(/(garantie de \d+ mois|\d+-month warranty|garantie \d+ ans[^.|]*)/i);
  return m ? m[1] : null;
}

function detectLimitedStock(text) {
  return /(stock limit|quantit[ée]s? limit|limited quantit|limited stock|premier arriv)/i.test(text);
}

/** ULID timestamp (first 10 chars of the id after "prod_") -> ISO date. */
function ulidDate(id) {
  const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const t = id.replace(/^prod_/, "").slice(0, 10);
  let ms = 0;
  for (const c of t) ms = ms * 32 + ALPHABET.indexOf(c);
  return new Date(ms).toISOString();
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const seenSlugs = new Map();
function uniqueSlug(base) {
  const n = (seenSlugs.get(base) ?? 0) + 1;
  seenSlugs.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

const products = [];
const review = [];
const redirects = [];

const created = source.products.map((p) => ulidDate(p.id));
const newest = Math.max(...created.map((d) => Date.parse(d)));
const NEW_WINDOW_DAYS = 10;

for (const src of source.products) {
  const o = overrides[src.id] ?? {};
  const fullText = [src.originalName, src.description, ...(src.pageText ?? [])].join(" | ");
  const cleanedName = normalizeCase(stripDecorations(src.originalName));

  const brand = o.brand !== undefined ? o.brand : detectBrand(fullText);
  const category = o.category ?? detectCategory(fullText);
  const dims = o.dimensions ?? detectDims(fullText);
  const width = o.width ?? dims?.widthIn ?? detectWidth(src.originalName);
  const priceFrom = o.priceFrom ?? detectPriceFrom(src.originalName);
  const detectedQty = detectQuantity(fullText);
  const inventoryPolicy = o.inventoryPolicy ?? (detectedQty && detectedQty > 1 ? "multiple" : "unique");
  const quantity = o.quantity ?? (inventoryPolicy === "continue" ? 999 : detectedQty ?? 1);
  const status = o.status ?? "active";
  const createdAt = ulidDate(src.id);
  const newArrival = o.newArrival ?? (newest - Date.parse(createdAt) <= NEW_WINDOW_DAYS * 864e5);
  const compareAt = o.compareAtPrice !== undefined ? o.compareAtPrice : src.compareAtPrice;
  const sale = o.sale ?? (compareAt != null && compareAt > src.price);
  const warranty = o.warranty !== undefined ? o.warranty : detectWarranty(fullText);
  const locationId = o.locationId !== undefined ? o.locationId : detectLocation(fullText);

  const title = o.title ?? { fr: cleanedName, en: cleanedName };
  const shortDescription = o.shortDescription ?? { fr: "", en: "" };
  const description = o.description ?? { fr: stripDecorations(src.description).slice(0, 600), en: "" };

  const dirId = src.id.replace(/^prod_/, "").toLowerCase();
  let imageSources;
  if (o.images !== undefined) {
    imageSources = o.images; // explicit (often empty: flyer-only products)
  } else {
    imageSources = src.images
      .filter((im) => !im.promoFlyer || (o.imageCrops && o.imageCrops[im.file.split("__")[1]]))
      .map((im) => ({ url: im.url, file: im.file, crop: o.imageCrops?.[im.file.split("__")[1]] ?? null }));
  }
  const images = imageSources.map((im, i) => {
    const key = `${dirId}/${i + 1}`;
    const meta = imageManifest[key] ?? {};
    return {
      src: `/images/products/${dirId}/${i + 1}.webp`,
      alt: {
        fr: `${title.fr} – photo ${i + 1}`,
        en: `${title.en} – photo ${i + 1}`,
      },
      width: meta.width ?? 1200,
      height: meta.height ?? 1600,
      _source: { url: im.url, file: im.file, crop: im.crop ?? null },
    };
  });

  const badges = new Set(o.badges ?? []);
  if (sale) badges.add("sale");
  if (newArrival && status === "active") badges.add("new-arrival");
  if (!o.badges && detectLimitedStock(fullText)) badges.add("limited-stock");

  const baseSlug = slugify(title.fr) || slugify(src.id);
  const slug = o.slug ?? uniqueSlug(baseSlug);

  const priceLabel = { fr: `${Math.round(src.price)} $`, en: `$${Math.round(src.price)}` };
  const seoTitle = o.seoTitle ?? {
    fr: `${title.fr} | Écono Électro Laval`,
    en: `${title.en} | Écono Électro Laval`,
  };
  const seoDescription = o.seoDescription ?? {
    fr: `${shortDescription.fr || title.fr} ${priceFrom ? "À partir de" : "Offert à"} ${priceLabel.fr}. Électroménager remis à neuf, inspecté et disponible dans nos succursales de Laval.`.trim(),
    en: `${shortDescription.en || title.en} ${priceFrom ? "From" : "Offered at"} ${priceLabel.en}. Refurbished, inspected appliance available at our Laval locations.`.trim(),
  };

  const flags = [...(o.reviewFlags ?? [])];
  if (!brand) flags.push("Marque non identifiée.");
  if (images.length === 0) flags.push("Aucune photo de produit utilisable.");
  if (src.price < 100 && category !== "autres") flags.push(`Prix suspect (${src.price} $).`);
  if (!o.title) flags.push("Titre nettoyé automatiquement, à relire.");
  if (warranty) flags.push(`Garantie mentionnée dans l'annonce d'origine (« ${warranty} ») : non affichée tant que non confirmée.`);

  const product = {
    id: src.id,
    slug,
    sku: null,
    status,
    title,
    shortDescription,
    description,
    category,
    subcategory: o.subcategory ?? null,
    brand,
    model: o.model ?? null,
    condition: o.condition ?? "refurbished",
    conditionGrade: o.conditionGrade ?? null,
    conditionNotes: o.conditionNotes ?? { fr: "", en: "" },
    price: src.price,
    compareAtPrice: compareAt ?? null,
    priceFrom,
    currency: "CAD",
    dimensions: dims,
    width: width ?? null,
    color: o.color ?? null,
    finish: o.finish ?? null,
    images,
    quantity,
    inventoryPolicy,
    locationId,
    featured: o.featured ?? false,
    newArrival,
    sale,
    deliveryEligible: o.deliveryEligible ?? true,
    pickupEligible: o.pickupEligible ?? true,
    warranty,
    specifications: o.specifications ?? [],
    includes: o.includes ?? [],
    variants: o.variants ?? [],
    seoTitle,
    seoDescription,
    badges: [...badges],
    purchasable: o.purchasable ?? true,
    createdAt,
    source: {
      provider: "hostinger",
      originalId: src.id,
      originalName: src.originalName,
      originalSlug: src.originalSlug,
      originalUrl: src.originalUrl,
    },
    reviewFlags: flags,
  };
  products.push(product);

  if (flags.length) {
    review.push({ id: src.id, slug, originalName: src.originalName, status, flags });
  }

  redirects.push({
    source: `/${src.originalSlug}`,
    destination: status === "active" ? `/produits/${slug}` : `/boutique`,
    permanent: true,
    note: status === "active" ? "product" : "unpublished product -> shop",
  });
}

// Static page redirects from the old Hostinger site
redirects.push(
  { source: "/store", destination: "/boutique", permanent: true, note: "old store page" },
  { source: "/httpswwweconoelectroservicescom", destination: "/a-propos", permanent: true, note: "old 'Know Us' page" },
  { source: "/httpswwweconoelectroservicescomnos-avisappliances", destination: "/avis", permanent: true, note: "old reviews page" },
  { source: "/refurbished-appliances-in-quebec-fridges-stoves-washers-dryers-and-dishwashers-electromenagers", destination: "/contact", permanent: true, note: "old contact page" },
  { source: "/accueil", destination: "/", permanent: true, note: "typo-safe home alias" },
  { source: "/acceuil", destination: "/", permanent: true, note: "old misspelling" },
);

// Sort: featured first, then newest
products.sort((a, b) => Number(b.featured) - Number(a.featured) || Date.parse(b.createdAt) - Date.parse(a.createdAt));

fs.writeFileSync(OUT, JSON.stringify(products, null, 2));
fs.writeFileSync(REVIEW, JSON.stringify({ generatedAt: new Date().toISOString(), count: review.length, records: review }, null, 2));
fs.writeFileSync(REDIRECTS, JSON.stringify(redirects, null, 2));

const active = products.filter((p) => p.status === "active");
console.log(`Catalog: ${products.length} products (${active.length} active, ${products.length - active.length} draft).`);
console.log(`Review: ${review.length} records flagged -> src/data/catalog-review.json`);
console.log(`Redirects: ${redirects.length} -> src/data/redirects.json`);
for (const p of products) {
  console.log(`${p.status === "active" ? "✓" : "○"} ${p.slug}  [${p.category}/${p.subcategory ?? "-"}] ${p.brand ?? "—"} ${p.price}$ qty=${p.quantity} imgs=${p.images.length} new=${p.newArrival ? "Y" : "n"} badges=${p.badges.join(",")}`);
}
