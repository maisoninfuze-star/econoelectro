#!/usr/bin/env node
/**
 * Imports product photos and creatives into public/images as optimized WebP.
 *
 *   node scripts/import-images.mjs [--from <dir of original downloads>] [--creatives <dir>]
 *
 * - Product photos: fetched from the original Hostinger CDN URL recorded in
 *   src/data/products.json (or read from --from when a local copy exists),
 *   optionally cropped, resized to max 1600px, saved as WebP (q82).
 * - Writes src/data/product-images.json with final dimensions so that
 *   clean-catalog.mjs can embed exact width/height (prevents layout shift).
 * - Creatives: resized to max 2000px WebP (q80).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const FROM = opt("--from");
const CREATIVES = opt("--creatives");

const products = JSON.parse(fs.readFileSync(path.join(root, "src/data/products.json"), "utf8"));
const manifestPath = path.join(root, "src/data/product-images.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

async function loadSource(im) {
  if (FROM) {
    const local = path.join(FROM, im._source.file);
    if (fs.existsSync(local)) return fs.readFileSync(local);
  }
  const res = await fetch(im._source.url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${im._source.url}`);
  return Buffer.from(await res.arrayBuffer());
}

let done = 0;
for (const p of products) {
  const dir = path.join(root, "public", path.dirname(p.images[0]?.src ?? "/images/products/x/1.webp"));
  for (const im of p.images) {
    const out = path.join(root, "public", im.src);
    const key = im.src.replace("/images/products/", "").replace(".webp", "");
    if (fs.existsSync(out) && manifest[key]) continue;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    let img = sharp(await loadSource(im)).rotate();
    if (im._source.crop) {
      const [l, t, r, b] = im._source.crop;
      img = img.extract({ left: l, top: t, width: r - l, height: b - t });
    }
    img = img.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
    const info = await img.webp({ quality: 82 }).toFile(out);
    manifest[key] = { width: info.width, height: info.height };
    done++;
  }
  void dir;
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Product images: ${done} written, ${Object.keys(manifest).length} in manifest.`);

if (CREATIVES && fs.existsSync(CREATIVES)) {
  const outDir = path.join(root, "public/images/creatives");
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(CREATIVES)) {
    if (!/\.(jpe?g|png|webp)$/i.test(f)) continue;
    const name = f.replace(/\.(jpe?g|png|webp)$/i, "");
    const info = await sharp(path.join(CREATIVES, f))
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, `${name}.webp`));
    console.log(`creative ${name}.webp ${info.width}x${info.height}`);
  }
}
