#!/usr/bin/env node
/**
 * Generates short video clips for ads with fal.ai image-to-video (Kling 2.5 Turbo Pro
 * by default): a slow, smooth camera move on a still scene. Sources:
 *   - approved product scenes  (public/images/ads/scenes, real unit placed by Bria)
 *   - campaign scenes           (public/images/creatives, FLUX editorial rooms)
 * The prompt pins the appliance as static and unchanged; REVIEW every clip
 * (scripts/export-meta-videos.mjs writes a frame sheet) and delete any clip where
 * the appliance drifts, since the ad must show the real unit.
 *
 *   FAL_KEY=... node scripts/fal-videos.mjs [--only slug-or-campaign,…] [--force] [--model fal-ai/kling-video/v2.5-turbo/pro/image-to-video] [--concurrency 3]
 *
 * Output: exports/meta-ads/video-clips/<id>.mp4 + manifest.json (git-ignored, large)
 */
import fs from "node:fs";
import path from "node:path";

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error("FAL_KEY is required (see .env.example)."); process.exit(1); }
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const ONLY = opt("--only", null)?.split(",") ?? null;
const FORCE = args.includes("--force");
const MODEL = opt("--model", "fal-ai/kling-video/v2.5-turbo/pro/image-to-video");
const CONCURRENCY = Number(opt("--concurrency", "3"));
const OUT = path.resolve("exports/meta-ads/video-clips");
fs.mkdirSync(OUT, { recursive: true });

const NEGATIVE = "people, hands, text, letters, logos, distortion, morphing, warping, extra appliances, open doors, flicker, camera shake";
const MOVES = {
  refrigerateurs: "Slow, smooth cinematic camera push-in toward the refrigerator in a bright kitchen.",
  cuisinieres: "Slow, smooth cinematic camera push-in toward the range in a bright kitchen.",
  "laveuses-secheuses": "Slow, smooth cinematic camera push-in toward the washer and dryer in a bright laundry room.",
  ensembles: "Slow, smooth cinematic camera glide toward the appliances in a bright home.",
  autres: "Slow, smooth cinematic camera push-in toward the appliance.",
};
const STATIC = " The appliance stays perfectly still and completely unchanged, doors closed, no new objects, no people, no text. Soft natural daylight, subtle light shift only.";
const CAMPAIGN_IMAGES = {
  ensembles: "/images/creatives/hero-appliance-set-wide.webp",
  "laveuses-secheuses": "/images/creatives/laundry-lifestyle.webp",
  refrigerateurs: "/images/creatives/kitchen-fridge.webp",
  cuisinieres: "/images/creatives/kitchen-range.webp",
  marque: "/images/creatives/kitchen-lifestyle.webp",
};

const products = JSON.parse(fs.readFileSync("src/data/products.json", "utf8"));
const scenesManifest = fs.existsSync("public/images/ads/scenes/manifest.json") ? JSON.parse(fs.readFileSync("public/images/ads/scenes/manifest.json", "utf8")) : {};
const manifestPath = path.join(OUT, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

const jobs = [];
for (const [pid, sc] of Object.entries(scenesManifest)) {
  if (!sc.approved) continue;
  const p = products.find((x) => x.id === pid);
  if (!p) continue;
  jobs.push({ id: path.basename(sc.file, ".jpg"), kind: "product", key: p.slug, productId: pid, image: sc.file, prompt: (MOVES[p.category] ?? MOVES.autres) + STATIC });
}
for (const [key, image] of Object.entries(CAMPAIGN_IMAGES)) {
  jobs.push({ id: `campaign-${key}`, kind: "campaign", key, image, prompt: (MOVES[key] ?? MOVES.ensembles) + STATIC });
}

async function submit(job) {
  const outFile = path.join(OUT, `${job.id}.mp4`);
  if (fs.existsSync(outFile) && !FORCE) { console.log(`· ${job.key} (exists)`); return; }
  if (manifest[job.id]?.approved === false && !FORCE) { console.log(`· ${job.key} (rejected on review, use --force)`); return; }
  const imgPath = path.join("public", job.image);
  const mime = job.image.endsWith(".webp") ? "image/webp" : "image/jpeg";
  const dataUrl = `data:${mime};base64,${fs.readFileSync(imgPath).toString("base64")}`;
  const started = Date.now();
  process.stdout.write(`▶ ${job.key} … submitted\n`);
  const sub = await fetch(`https://queue.fal.run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: dataUrl, prompt: job.prompt, negative_prompt: NEGATIVE, duration: "5" }),
  });
  if (!sub.ok) throw new Error(`${job.key}: submit ${sub.status} ${await sub.text()}`);
  const { request_id, status_url, response_url } = await sub.json();
  // Poll until done
  for (;;) {
    await new Promise((r) => setTimeout(r, 5000));
    const st = await fetch(status_url, { headers: { Authorization: `Key ${KEY}` } });
    const j = await st.json();
    if (j.status === "COMPLETED") break;
    if (j.status === "FAILED" || Date.now() - started > 15 * 60_000) throw new Error(`${job.key}: ${j.status} (${request_id})`);
  }
  const res = await fetch(response_url, { headers: { Authorization: `Key ${KEY}` } });
  const json = await res.json();
  const url = json.video?.url;
  if (!url) throw new Error(`${job.key}: no video in response`);
  fs.writeFileSync(outFile, Buffer.from(await (await fetch(url)).arrayBuffer()));
  manifest[job.id] = { kind: job.kind, key: job.key, productId: job.productId ?? null, file: outFile.replace(process.cwd() + path.sep, ""), source: job.image, prompt: job.prompt, model: MODEL, generatedAt: new Date().toISOString(), seconds: Math.round((Date.now() - started) / 1000), reviewed: false };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ ${job.key} (${Math.round((Date.now() - started) / 1000)} s)`);
}

const queue = jobs.filter((j) => !ONLY || ONLY.includes(j.key));
let failed = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) {
    const job = queue.shift();
    try { await submit(job); } catch (e) { failed++; console.error(`✗ ${e.message}`); }
  }
}));
console.log(`\nClips in ${OUT}${failed ? ` (${failed} failed)` : ""}. Review them with: npm run ads:export-videos (writes a frame sheet), delete any clip that drifts, then re-run.`);
