#!/usr/bin/env node
/**
 * Removes the background of each product's first photo with fal.ai (Bria RMBG)
 * so ads can show the appliance on a clean studio backdrop. The appliance's
 * own pixels are NOT altered — only the surroundings are removed.
 *
 *   FAL_KEY=... node scripts/fal-cutouts.mjs [--only slug1,slug2] [--force]
 *
 * Output: public/images/ads/cutouts/<product-dir>.png (+ manifest.json)
 * REVIEW EVERY CUTOUT before running ads with --studio: on cluttered shots the
 * model can keep a sliver of a neighbouring unit. Delete any file that is not
 * clean; the ad renderer falls back to the real photo when no cutout exists.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("FAL_KEY is required (see .env.example)."); process.exit(1); }
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ONLY = opt("--only", null)?.split(",") ?? null;
const FORCE = args.includes("--force");
const OUT = path.resolve("public/images/ads/cutouts");
fs.mkdirSync(OUT, { recursive: true });

const products = JSON.parse(fs.readFileSync("src/data/products.json", "utf8")).filter(
  (p) => p.status === "active" && p.images.length > 0 && p.subcategory !== "carte-cadeau" && (!ONLY || ONLY.includes(p.slug)),
);
const manifestPath = path.join(OUT, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

for (const p of products) {
  const dirId = p.images[0].src.split("/")[3];
  const outFile = path.join(OUT, `${dirId}.png`);
  if (fs.existsSync(outFile) && !FORCE) { console.log(`· ${p.slug} (exists)`); continue; }
  if (manifest[p.id]?.approved === false && !FORCE) { console.log(`· ${p.slug} (rejected on review, use --force to regenerate)`); continue; }
  process.stdout.write(`${p.slug} … `);
  try {
    const src = path.join("public", p.images[0].src);
    const jpeg = await sharp(src).resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
    const res = await fetch("https://fal.run/fal-ai/bria/background/remove", {
      method: "POST",
      headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: `data:image/jpeg;base64,${jpeg.toString("base64")}` }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const json = await res.json();
    const png = Buffer.from(await (await fetch(json.image.url)).arrayBuffer());
    const info = await sharp(png).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 }).png({ compressionLevel: 9 }).toFile(outFile);
    manifest[p.id] = { slug: p.slug, file: `/images/ads/cutouts/${dirId}.png`, width: info.width, height: info.height, source: p.images[0].src, generatedAt: new Date().toISOString(), model: "fal-ai/bria/background/remove", reviewed: false };
    console.log(`ok ${info.width}x${info.height}`);
  } catch (e) {
    console.log(`FAIL ${e.message}`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
console.log(`\nCutouts in ${OUT}. Review them, delete any that are not clean, then: npm run ads:export -- --studio`);
