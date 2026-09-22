import "server-only";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cache = new Map<string, string>();

/** Cache key that changes when a local file is replaced (same path, new content). */
async function cacheKey(prefix: string, src: string): Promise<string> {
  if (src.startsWith("http")) return `${prefix}${src}`;
  try {
    const s = await stat(path.join(process.cwd(), "public", src));
    return `${prefix}${src}@${s.mtimeMs}:${s.size}`;
  } catch {
    return `${prefix}${src}`;
  }
}

/**
 * Loads a local (public/) or remote image for next/og and returns a JPEG data URL.
 * Satori cannot decode WebP, so everything is normalised to JPEG (max 1200px).
 */
/** Loads a local PNG (with alpha) for next/og, resized to max 1200px, as a PNG data URL. */
export async function ogPngData(src: string): Promise<string | null> {
  const key = await cacheKey("png:", src);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const buf = await readFile(path.join(process.cwd(), "public", src));
    const png = await sharp(buf).resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 8 }).toBuffer();
    const url = `data:image/png;base64,${png.toString("base64")}`;
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

export async function ogImageData(src: string): Promise<string | null> {
  const key = await cacheKey("jpg:", src);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const buf = src.startsWith("http")
      ? Buffer.from(await (await fetch(src)).arrayBuffer())
      : await readFile(path.join(process.cwd(), "public", src));
    const jpeg = await sharp(buf).resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    const url = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}
