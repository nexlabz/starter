import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/env";

// Public, indexable routes only. Add new marketing pages here.
const ROUTES = ["", "/features", "/pricing", "/changelog", "/about", "/contact", "/sign-up", "/sign-in"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return ROUTES.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
