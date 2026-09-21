import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/panier", "/en/cart", "/commande", "/en/checkout"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
