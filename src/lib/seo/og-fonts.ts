import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/** Fonts for next/og ImageResponse (Satori needs explicit font data; static Manrope instances, OFL). */
export async function ogFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [regular, extrabold] = await Promise.all([readFile(path.join(dir, "Manrope-Regular.woff")), readFile(path.join(dir, "Manrope-ExtraBold.woff"))]);
  return [
    { name: "Manrope", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Manrope", data: extrabold, weight: 800 as const, style: "normal" as const },
  ];
}
