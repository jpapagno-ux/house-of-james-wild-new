import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { LIVE_ROUTES } from "@/lib/site";

// Lists only routes that exist in the current build step. From step 6 it
// splits by volume (stays, safaris, voyages…) via generateSitemaps().
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LIVE_ROUTES.map((r) => ({ url: absoluteUrl(r.path), lastModified: now, changeFrequency: r.changeFrequency, priority: r.priority }));
}
