#!/usr/bin/env node
/**
 * Composes ad videos from fal.ai clips + the ad panel (rendered by the site with
 * the exact price, condition and store) using ffmpeg.
 *
 *   npm run ads:export-videos -- [--locale fr] [--formats square,story] [--only key,…] [--base http://localhost:3000] [--out exports/meta-ads]
 *
 * Input:  exports/meta-ads/video-clips/*.mp4 (scripts/fal-videos.mjs)
 * Output: exports/meta-ads/<locale>/videos/<slug|campaigns-key>/<format>.mp4   1080×1080 / 1080×1920, 6 s, H.264, silent AAC track
 *         exports/meta-ads/<locale>/videos/frame-sheet.jpg                     mid-frame of every video for review
 * Requires ffmpeg + ffprobe on PATH.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import sharp from "sharp";
import { ensureServer } from "./lib/ensure-server.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const BASE = opt("--base", "http://localhost:3000").replace(/\/$/, "");
const LOCALE = opt("--locale", "fr");
const FORMATS = opt("--formats", "square,story").split(",");
const ONLY = opt("--only", null)?.split(",") ?? null;
const OUT = path.resolve(opt("--out", "exports/meta-ads"), LOCALE, "videos");
const CLIPS = path.resolve("exports/meta-ads/video-clips");
const HOLD = 1; // seconds the last frame is held

if (spawnSync("ffmpeg", ["-version"]).status !== 0) { console.error("ffmpeg is required (brew install ffmpeg)."); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(path.join(CLIPS, "manifest.json"), "utf8"));
const FORMAT_SPEC = { square: { width: 1080, height: 1080, photo: 590 }, story: { width: 1080, height: 1920, photo: 800 } };

const stopServer = await ensureServer(BASE, { warmup: [`/api/ads/copy?locale=${LOCALE}`] });
fs.mkdirSync(OUT, { recursive: true });
const frames = [];
let count = 0;

for (const clip of Object.values(manifest)) {
  if (ONLY && !ONLY.includes(clip.key)) continue;
  if (clip.approved === false) continue;
  const clipFile = path.resolve(clip.file);
  if (!fs.existsSync(clipFile)) continue;
  const dir = path.join(OUT, clip.kind === "campaign" ? `campaigns-${clip.key}` : clip.key);
  fs.mkdirSync(dir, { recursive: true });
  const duration = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", clipFile]).toString().trim());
  for (const format of FORMATS) {
    const spec = FORMAT_SPEC[format];
    const panelFormat = format === "story" ? "story-video" : format;
    const url = clip.kind === "campaign" ? `${BASE}/api/ads/campaign/${clip.key}?format=${panelFormat}&locale=${LOCALE}&layer=panel` : `${BASE}/api/ads/${clip.key}?format=${panelFormat}&locale=${LOCALE}&variant=scene&layer=panel`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`  ✗ panel ${clip.key} ${format}: ${res.status}`); continue; }
    const panel = path.join(dir, `${format}-panel.png`);
    fs.writeFileSync(panel, Buffer.from(await res.arrayBuffer()));
    const out = path.join(dir, `${format}.mp4`);
    const total = (duration + HOLD).toFixed(2);
    const filter = [
      `[0:v]scale=${spec.width}:${spec.photo}:force_original_aspect_ratio=increase,crop=${spec.width}:${spec.photo},setsar=1,tpad=stop_mode=clone:stop_duration=${HOLD}[clip]`,
      `color=c=0xF7F7F4:s=${spec.width}x${spec.height}:d=${total}:r=30[bg]`,
      `[bg][clip]overlay=0:0:shortest=1[b1]`,
      `[1:v]format=rgba,fade=t=in:st=0:d=0.45:alpha=1[panel]`,
      `[b1][panel]overlay=0:0:shortest=1,format=yuv420p[out]`,
    ].join(";");
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", clipFile, "-loop", "1", "-i", panel, "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100", "-filter_complex", filter, "-map", "[out]", "-map", "2:a", "-t", total, "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-movflags", "+faststart", out]);
    if (r.status !== 0) { console.error(`  ✗ ffmpeg ${clip.key} ${format}: ${r.stderr}`); continue; }
    fs.unlinkSync(panel);
    count++;
    if (format === FORMATS[0]) {
      const frame = path.join(dir, `${format}-frame.jpg`);
      spawnSync("ffmpeg", ["-v", "error", "-y", "-ss", (duration / 2).toFixed(2), "-i", out, "-frames:v", "1", frame]);
      frames.push({ file: frame, label: clip.key });
    }
  }
  console.log(`✓ ${clip.key}`);
}

// Frame sheet for review
if (frames.length) {
  const T = 300, COLS = 5, ROWS = Math.ceil(frames.length / COLS);
  const comps = [];
  for (let i = 0; i < frames.length; i++) {
    comps.push({ input: await sharp(frames[i].file).resize(T, T, { fit: "inside" }).toBuffer(), left: (i % COLS) * (T + 8) + 8, top: Math.floor(i / COLS) * (T + 8) + 8 });
  }
  await sharp({ create: { width: COLS * (T + 8) + 8, height: ROWS * (T + 8) + 8, channels: 3, background: "#e9e9e6" } }).composite(comps).jpeg({ quality: 82 }).toFile(path.join(OUT, "frame-sheet.jpg"));
  for (const f of frames) fs.unlinkSync(f.file);
}
stopServer();
console.log(`\n${count} videos → ${OUT}`);
