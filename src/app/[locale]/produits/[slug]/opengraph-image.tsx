import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ogFonts } from "@/lib/seo/og-fonts";
import { ogImageData } from "@/lib/seo/og-image";
import { getCommerce } from "@/lib/commerce";
import { formatPrice } from "@/lib/i18n/format";

export const alt = "Écono Électro Services";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ProductOgImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : "fr";
  const dict = getDictionary(locale);
  const product = await getCommerce().getProductBySlug(slug);
  const logo = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public/brand/logo-192.png"))).toString("base64")}`;
  const photo = product?.images[0] ? await ogImageData(product.images[0].src) : null;
  const title = product ? product.title[locale] || product.title.fr : "Écono Électro";
  const price = product ? formatPrice(product.price, locale, { decimals: false }) : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f7f4", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 52, width: 680 }}>
          <img src={logo} alt="" width={270} height={90} style={{ objectFit: "contain" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, color: "#656565", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>{product?.brand ?? (product ? dict.categories[product.category].name : "")}</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#111111", lineHeight: 1.1, marginTop: 12 }}>{title}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 20 }}>
              {product?.priceFrom ? <span style={{ fontSize: 22, color: "#656565" }}>{dict.product.priceFrom}</span> : null}
              <span style={{ fontSize: 48, fontWeight: 800, color: "#ed0101" }}>{price}</span>
              {product?.compareAtPrice && product.compareAtPrice > product.price ? <span style={{ fontSize: 26, color: "#8a8a8a", textDecoration: "line-through" }}>{formatPrice(product.compareAtPrice, locale, { decimals: false })}</span> : null}
            </div>
            <div style={{ fontSize: 20, color: "#656565", marginTop: 14 }}>{`${dict.condition.refurbished} · ${dict.common.twoLocations}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, background: "#e9e9e6" }}>{photo ? <img src={photo} alt="" width={520} height={630} style={{ objectFit: "cover", width: 520, height: 630 }} /> : null}</div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
