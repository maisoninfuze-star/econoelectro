#!/usr/bin/env node
/**
 * Exports Meta (Facebook / Instagram) ad creatives + copy for the current catalog.
 *
 *   npm run dev            # in another terminal (or npm start with ADS_EXPORT_ENABLED=1)
 *   npm run ads:export -- [--base http://localhost:3000] [--locale fr] [--formats square,portrait,story] [--only slug1,slug2] [--out exports/meta-ads] [--studio]
 *
 * --studio also exports <format>-studio.png for products that have a reviewed
 * cutout in public/images/ads/cutouts (see scripts/fal-cutouts.mjs).
 *
 * Output:
 *   exports/meta-ads/<locale>/<slug>/{square,portrait,story}.png   1080×1080, 1080×1350, 1080×1920
 *   exports/meta-ads/<locale>/ad-copy.json + ad-copy.md             primary text, headline, description, UTM landing URL
 *   exports/meta-ads/<locale>/contact-sheet.jpg                      quick visual review
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const BASE = opt("--base", "http://localhost:3000").replace(/\/$/, "");
const LOCALE = opt("--locale", "fr");
const FORMATS = opt("--formats", "square,portrait,story").split(",");
const ONLY = opt("--only", null)?.split(",") ?? null;
const OUT = path.resolve(opt("--out", "exports/meta-ads"), LOCALE);
const STUDIO = args.includes("--studio");

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

try {
  await fetch(BASE);
} catch {
  console.error(`No server at ${BASE}. Start it with "npm run dev" first.`);
  process.exit(1);
}

const copy = await getJson(`${BASE}/api/ads/copy?locale=${LOCALE}`);
const products = copy.products.filter((p) => !ONLY || ONLY.includes(p.slug));
fs.mkdirSync(OUT, { recursive: true });

let count = 0;
const squares = [];
const CONCURRENCY = Number(opt("--concurrency", "4"));

async function exportProduct(p) {
  const dir = path.join(OUT, p.slug);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const format of FORMATS) {
    const res = await fetch(`${BASE}/api/ads/${p.slug}?format=${format}&locale=${LOCALE}`);
    if (!res.ok) { console.error(`  ✗ ${p.slug} ${format}: ${res.status}`); continue; }
    const file = path.join(dir, `${format}.png`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    files.push(file);
    if (STUDIO) {
      const sres = await fetch(`${BASE}/api/ads/${p.slug}?format=${format}&locale=${LOCALE}&studio=1`);
      if (sres.ok && sres.headers.get("x-ad-variant") === "studio") {
        const sfile = path.join(dir, `${format}-studio.png`);
        fs.writeFileSync(sfile, Buffer.from(await sres.arrayBuffer()));
        files.push(sfile);
      } else if (sres.ok) {
        await sres.arrayBuffer(); // drain
      }
    }
  }
  console.log(`✓ ${p.slug}`);
  return files;
}

const queue = [...products];
const results = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const p = queue.shift();
      results.push(...(await exportProduct(p)));
    }
  }),
);
for (const p of products) {
  for (const f of results.filter((x) => x.startsWith(path.join(OUT, p.slug) + path.sep))) {
    count++;
    if (path.basename(f).startsWith("square")) squares.push(f);
  }
}

// Copy files
fs.writeFileSync(path.join(OUT, "ad-copy.json"), JSON.stringify(copy, null, 2));
const md = [];
md.push(`# Textes publicitaires Meta — ${LOCALE.toUpperCase()} (${copy.campaign})`, "", `Généré le ${copy.generatedAt}. Chaque bloc = 1 annonce. Bouton : Magasiner (SHOP_NOW).`, "");
md.push("## Campagnes (angles)", "");
for (const c of copy.campaigns) {
  md.push(`### ${c.name}`, "", "**Texte principal**", "", c.primaryText, "", `**Titre :** ${c.headline}`, "", `**Description :** ${c.description}`, "", `**Lien :** ${c.landingUrl}`, "");
}
md.push("## Annonces par produit", "");
for (const p of products) {
  md.push(`### ${p.productTitle}`, "", `Visuels : \`${p.slug}/square.png\` (fil), \`portrait.png\` (fil 4:5), \`story.png\` (Stories/Reels)`, "", "**Texte principal**", "", p.primaryText, "", `**Titre :** ${p.headline}`, "", `**Description :** ${p.description}`, "", `**Lien :** ${p.landingUrl}`, ...(p.notes.length ? ["", `> ⚠️ ${p.notes.join(" ")}`] : []), "");
}
fs.writeFileSync(path.join(OUT, "ad-copy.md"), md.join("\n"));

// Contact sheet
if (squares.length) {
  const T = 270, COLS = 5, ROWS = Math.ceil(squares.length / COLS);
  const composites = [];
  for (let i = 0; i < squares.length; i++) {
    composites.push({ input: await sharp(squares[i]).resize(T, T).toBuffer(), left: (i % COLS) * (T + 8) + 8, top: Math.floor(i / COLS) * (T + 8) + 8 });
  }
  await sharp({ create: { width: COLS * (T + 8) + 8, height: ROWS * (T + 8) + 8, channels: 3, background: "#e9e9e6" } })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, "contact-sheet.jpg"));
}
console.log(`\n${count} creatives for ${products.length} products → ${OUT}`);
