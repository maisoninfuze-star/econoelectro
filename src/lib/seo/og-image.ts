import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const cache = new Map<string, string>();

/**
 * Loads a local (public/) or remote image for next/og and returns a JPEG data URL.
 * Satori cannot decode WebP, so everything is normalised to JPEG (max 1200px).
 */
export async function ogImageData(src: string): Promise<string | null> {
  const hit = cache.get(src);
  if (hit) return hit;
  try {
    const buf = src.startsWith("http")
      ? Buffer.from(await (await fetch(src)).arrayBuffer())
      : await readFile(path.join(process.cwd(), "public", src));
    const jpeg = await sharp(buf).resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    const url = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
    cache.set(src, url);
    return url;
  } catch {
    return null;
  }
}
