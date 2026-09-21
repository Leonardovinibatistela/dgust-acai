import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// O site é uma página só (cardápio e pedido ficam nela).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
