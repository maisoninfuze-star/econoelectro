import type { MetadataRoute } from "next";
import { BRAND } from "@/config/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.shortName,
    description: BRAND.tagline.fr,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#ffffff",
    lang: "fr-CA",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
