import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { LIVE_ROUTES } from "@/lib/site";
import { STAY_PAGES } from "@/lib/content/stays";
import { REGION_DATA } from "@/lib/content/regions";
import { COUNTRIES } from "@/lib/content/countries";

// Every page that renders indexable: the signed-off pages in LIVE_ROUTES, plus
// the Ledger pages that are indexable by rule (stay pages, ready regions,
// country pages). Pages kept noindex (hubs awaiting sign-off, previews,
// regions not ready) never appear. Keep this in step with each page's
// buildMetadata noindex rule.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const out = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => {
    if (!out.has(path)) out.set(path, { url: absoluteUrl(path), lastModified: now, changeFrequency, priority });
  };
  LIVE_ROUTES.forEach((r) => add(r.path, r.priority, r.changeFrequency));
  REGION_DATA.filter((r) => r.ready).forEach((r) => add(`/destinations/${r.slug}`, 0.7, "monthly"));
  COUNTRIES.forEach((c) => add(`/destinations/${c.region}/${c.slug}`, 0.7, "monthly"));
  STAY_PAGES.forEach((s) => add(`/stays/${s.slug}`, 0.6, "monthly"));
  return [...out.values()];
}
