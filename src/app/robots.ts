import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/projects", "/team", "/billing", "/onboarding", "/start"] }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
