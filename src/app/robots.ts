import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// O painel (/admin) é só do dono: fica fora do Google.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
