#!/usr/bin/env node
/**
 * Exports Meta (Facebook / Instagram) ad creatives + copy for the current catalog.
 *
 *   npm run ads:export -- [--base http://localhost:3000] [--locale fr] [--formats square,portrait,story] [--only slug1,slug2] [--out exports/meta-ads] [--studio] [--scenes]
 *
 * If nothing is listening at --base (localhost), the script starts "next dev" on that
 * port for the duration of the export and stops it afterwards (--no-auto-server disables this).
 * Against a deployment: --base https://www.econoelectroservices.com with ADS_EXPORT_ENABLED=1 set there.
 *
 * --studio also exports <format>-studio.png for products with a reviewed cutout
 *          (public/images/ads/cutouts, see scripts/fal-cutouts.mjs).
 * --scenes also exports <format>-scene.png for products with a reviewed fal.ai
 *          lifestyle scene (public/images/ads/scenes, see scripts/fal-scenes.mjs).
 * Campaign creatives (generated scene + headline) are always exported to campaigns/<key>/.
 *
 * Output:
 *   exports/meta-ads/<locale>/<slug>/{square,portrait,story}.png   1080×1080, 1080×1350, 1080×1920
 *   exports/meta-ads/<locale>/ad-copy.json + ad-copy.md             primary text, headline, description, UTM landing URL
 *   exports/meta-ads/<locale>/contact-sheet.jpg                      quick visual review
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ensureServer } from "./lib/ensure-server.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const BASE = opt("--base", "http://localhost:3000").replace(/\/$/, "");
const LOCALE = opt("--locale", "fr");
const FORMATS = opt("--formats", "square,portrait,story").split(",");
const ONLY = opt("--only", null)?.split(",") ?? null;
const OUT = path.resolve(opt("--out", "exports/meta-ads"), LOCALE);
const STUDIO = args.includes("--studio");
const SCENES = args.includes("--scenes");
const VARIANTS = [...(STUDIO ? ["studio"] : []), ...(SCENES ? ["scene"] : [])];

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const stopServer = await ensureServer(BASE, { autoStart: !args.includes("--no-auto-server"), warmup: [`/api/ads/copy?locale=${LOCALE}`] });

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
    for (const variant of VARIANTS) {
      const vres = await fetch(`${BASE}/api/ads/${p.slug}?format=${format}&locale=${LOCALE}&variant=${variant}`);
      if (vres.ok && vres.headers.get("x-ad-variant") === variant) {
        const vfile = path.join(dir, `${format}-${variant}.png`);
        fs.writeFileSync(vfile, Buffer.from(await vres.arrayBuffer()));
        files.push(vfile);
      } else if (vres.ok) {
        await vres.arrayBuffer(); // drain the fallback render
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

// Campaign creatives
for (const c of copy.campaigns) {
  const dir = path.join(OUT, "campaigns", c.key);
  fs.mkdirSync(dir, { recursive: true });
  for (const format of FORMATS) {
    const res = await fetch(`${BASE}/api/ads/campaign/${c.key}?format=${format}&locale=${LOCALE}`);
    if (!res.ok) { console.error(`  ✗ campaign ${c.key} ${format}: ${res.status}`); continue; }
    const file = path.join(dir, `${format}.png`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    if (format === "square") squares.unshift(file);
    count++;
  }
  console.log(`✓ campaign ${c.key}`);
}

// Copy files
fs.writeFileSync(path.join(OUT, "ad-copy.json"), JSON.stringify(copy, null, 2));
const md = [];
md.push(`# Textes publicitaires Meta — ${LOCALE.toUpperCase()} (${copy.campaign})`, "", `Généré le ${copy.generatedAt}. Chaque bloc = 1 annonce. Bouton : Magasiner (SHOP_NOW).`, "");
md.push("## Campagnes (angles)", "");
for (const c of copy.campaigns) {
  md.push(`### ${c.name}`, "", `Visuels : \`campaigns/${c.key}/square.png\`, \`portrait.png\`, \`story.png\``, "", "**Texte principal**", "", c.primaryText, "", `**Titre :** ${c.headline}`, "", `**Description :** ${c.description}`, "", `**Lien :** ${c.landingUrl}`, "");
}
md.push("## Annonces par produit", "");
for (const p of products) {
  md.push(`### ${p.productTitle}`, "", `Visuels : \`${p.slug}/square.png\` (fil), \`portrait.png\` (fil 4:5), \`story.png\` (Stories/Reels); variantes \`-studio\` / \`-scene\` lorsque disponibles`, "", "**Texte principal**", "", p.primaryText, "", `**Titre :** ${p.headline}`, "", `**Description :** ${p.description}`, "", `**Lien :** ${p.landingUrl}`, ...(p.notes.length ? ["", `> ⚠️ ${p.notes.join(" ")}`] : []), "");
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
stopServer();
