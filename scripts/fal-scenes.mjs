#!/usr/bin/env node
/**
 * Places each APPROVED product cutout into a generated lifestyle scene with
 * fal.ai Bria Product Shot. Bria keeps the product pixels intact and only
 * generates the surroundings, so the appliance in the ad is the real unit.
 *
 *   FAL_KEY=... node scripts/fal-scenes.mjs [--only slug1,slug2] [--force]
 *
 * Input:  public/images/ads/cutouts/manifest.json (approved: true entries)
 * Output: public/images/ads/scenes/<product-dir>.jpg (+ manifest.json)
 * REVIEW EVERY SCENE: delete any file where the scene invented another
 * appliance or the scale looks wrong. The ad renderer falls back to the
 * studio/photo variant when no scene file exists.
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
const OUT = path.resolve("public/images/ads/scenes");
fs.mkdirSync(OUT, { recursive: true });

const SUFFIX = " Photorealistic editorial interior photography, soft natural daylight, realistic scale, no other appliances anywhere in the scene, no people, no text, no logos.";
const SCENES = {
  refrigerateurs: "A bright modern Canadian kitchen with white shaker cabinets, light oak floor and quartz counters; the refrigerator stands in a dedicated alcove between the cabinets as the single focal point.",
  cuisinieres: "A warm modern kitchen with white cabinets, a light wood floor and a marble backsplash; the range is built into the cabinetry run as the single focal point.",
  "laveuses-secheuses": "A clean modern laundry room with light grey walls, a wooden folding counter to one side, a window with soft daylight and a few folded towels; the washer and dryer stand on the tiled floor as the single focal point.",
  ensembles: "A bright open-plan Canadian home with white cabinets and light oak floor, kitchen and laundry area in one view; the appliances stand together as the single focal point.",
  autres: "A bright modern Canadian kitchen with white shaker cabinets and light oak floor; the appliance stands against the wall as the single focal point.",
};
// Bria's "manual_padding" keeps the product large; the output aspect ratio follows
// cutout + padding. Padding is computed per cutout to target a ~1.6:1 frame with
// the appliance ≈ 85 % of the height, so the 1:1, 4:5 and 9:16 ad crops (anchored
// at 62 % height) keep the whole unit visible.
const TARGET_RATIO = 1.6;
function paddingFor(w, h) {
  const top = Math.round(h * 0.11);
  const bottom = Math.round(h * 0.07);
  const H = h + top + bottom;
  const side = Math.max(Math.round(w * 0.06), Math.round((TARGET_RATIO * H - w) / 2));
  return [side, side, top, bottom]; // left, right, top, bottom
}

const products = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const cutouts = JSON.parse(fs.readFileSync("public/images/ads/cutouts/manifest.json", "utf8"));
const manifestPath = path.join(OUT, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

for (const [pid, cut] of Object.entries(cutouts)) {
  if (!cut.approved) continue;
  const p = products.find((x) => x.id === pid);
  if (!p || (ONLY && !ONLY.includes(p.slug))) continue;
  const dirId = path.basename(cut.file, ".png");
  const outFile = path.join(OUT, `${dirId}.jpg`);
  if (fs.existsSync(outFile) && !FORCE) { console.log(`· ${p.slug} (exists)`); continue; }
  if (manifest[pid]?.approved === false && !FORCE) { console.log(`· ${p.slug} (rejected on review)`); continue; }
  const prompt = (SCENES[p.category] ?? SCENES.autres) + SUFFIX;
  process.stdout.write(`${p.slug} … `);
  try {
    const png = fs.readFileSync(path.join("public", cut.file));
    const meta = await sharp(png).metadata();
    const padding = paddingFor(meta.width, meta.height);
    const res = await fetch("https://fal.run/fal-ai/bria/product-shot", {
      method: "POST",
      headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: `data:image/png;base64,${png.toString("base64")}`, scene_description: prompt, placement_type: "manual_padding", padding_values: padding, num_results: 1, fast: false, optimize_description: true }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const json = await res.json();
    const img = Buffer.from(await (await fetch(json.images[0].url)).arrayBuffer());
    const info = await sharp(img).jpeg({ quality: 88 }).toFile(outFile);
    manifest[pid] = { slug: p.slug, file: `/images/ads/scenes/${dirId}.jpg`, width: info.width, height: info.height, cutout: cut.file, padding, prompt, generatedAt: new Date().toISOString(), model: "fal-ai/bria/product-shot", reviewed: false };
    console.log(`ok ${info.width}x${info.height}`);
  } catch (e) {
    console.log(`FAIL ${e.message}`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
console.log(`\nScenes in ${OUT}. Review them, delete any that are not right, then: npm run ads:export -- --studio --scenes`);
