import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ogFonts } from "@/lib/seo/og-fonts";
import { ogImageData } from "@/lib/seo/og-image";

export const alt = "Écono Électro Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const [logoBuf, photo] = await Promise.all([readFile(path.join(process.cwd(), "public/brand/logo-192.png")), ogImageData("/images/creatives/hero-appliance-set-wide.webp")]);
  const logo = `data:image/png;base64,${logoBuf.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f7f4", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56, width: 600 }}>
          <img src={logo} alt="" width={330} height={110} style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, color: "#ed0101", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>{dict.hero.eyebrow}</div>
            <div style={{ fontSize: 54, fontWeight: 800, color: "#111111", lineHeight: 1.05, marginTop: 14 }}>{dict.hero.headline}</div>
            <div style={{ fontSize: 22, color: "#656565", marginTop: 18 }}>{dict.hero.reassurance}</div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1 }}>
          {photo ? <img src={photo} alt="" width={600} height={630} style={{ objectFit: "cover", width: 600, height: 630 }} /> : null}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
