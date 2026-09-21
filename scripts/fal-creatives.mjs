#!/usr/bin/env node
/**
 * Generates editorial creatives with fal.ai (FLUX 1.1 Pro Ultra).
 *
 *   FAL_KEY=... node scripts/fal-creatives.mjs [--out public/images/creatives] [--only hero-appliance-set]
 *
 * These images are *editorial scenes* (studio appliance sets, kitchen and
 * laundry-room interiors). They are never used as product photos: product
 * pages and cards always show the real photo of the actual unit for sale.
 * A generative edit test on a real store photo produced a different appliance
 * (see docs/CREATIVES.md), so AI edits of product photos are intentionally
 * excluded from the pipeline.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const MODEL = "fal-ai/flux-pro/v1.1-ultra";
const STYLE = " Ultra-realistic editorial retail photography, natural soft daylight, neutral warm off-white tones, clean composition, sharp focus, no people, no text, no watermarks, no logos, no brand names.";

export const JOBS = {
  "hero-appliance-set": {
    aspect_ratio: "4:5",
    prompt: "A premium studio composition of a matching stainless steel kitchen and laundry appliance set: a French-door refrigerator, a freestanding electric range with a smooth glass cooktop, and a front-load washer and dryer pair, arranged slightly staggered on a seamless warm off-white studio floor and backdrop, gentle realistic floor shadows, three-quarter angle, high-end appliance catalogue look." + STYLE,
  },
  "hero-appliance-set-wide": {
    aspect_ratio: "16:9",
    prompt: "A premium studio composition of a matching stainless steel appliance set: a French-door refrigerator, a freestanding electric range with a smooth glass cooktop, and a front-load washer and dryer pair, arranged in a row on a seamless warm off-white studio floor and backdrop, gentle realistic floor shadows, slight three-quarter angle, high-end appliance catalogue look." + STYLE,
  },
  "kitchen-lifestyle": {
    aspect_ratio: "4:3",
    prompt: "A bright modern Canadian family kitchen with a stainless steel French-door refrigerator and a stainless electric range with glass cooktop, white shaker cabinets, light oak floor, quartz counters, morning window light, editorial interior photography, wide angle." + STYLE,
  },
  "laundry-lifestyle": {
    aspect_ratio: "4:3",
    prompt: "A clean, modern laundry room with a white front-load washer and matching dryer side by side under a wooden countertop, folded towels, soft window light, calm minimal interior, editorial interior photography." + STYLE,
  },
};

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(opt("--out", "public/images/creatives"));
const ONLY = opt("--only", null);
const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("FAL_KEY is required (see .env.example)."); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

for (const [name, job] of Object.entries(JOBS)) {
  if (ONLY && ONLY !== name) continue;
  process.stdout.write(`${name} … `);
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: job.prompt, aspect_ratio: job.aspect_ratio, num_images: 1, output_format: "jpeg", safety_tolerance: "2", enable_safety_checker: true }),
  });
  if (!res.ok) { console.error(`failed (${res.status}) ${await res.text()}`); continue; }
  const json = await res.json();
  const url = json.images?.[0]?.url;
  if (!url) { console.error("no image returned"); continue; }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const info = await sharp(buf).resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(OUT, `${name}.webp`));
  console.log(`ok ${info.width}x${info.height}`);
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ model: MODEL, generatedAt: new Date().toISOString(), jobs: JOBS }, null, 2));
