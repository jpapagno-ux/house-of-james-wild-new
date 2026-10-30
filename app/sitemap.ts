import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { LIVE_ROUTES } from "@/lib/site";
import { STAY_PAGES } from "@/lib/content/stays";
import { REGION_DATA } from "@/lib/content/regions";
import { COUNTRIES } from "@/lib/content/countries";
import { RESERVES, campReady } from "@/lib/content/reserves";

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
  // Hubs and house pages approved by James, 28 Oct 2026.
  ["/about", "/about/founder", "/about/team", "/stays", "/safaris", "/voyages", "/gatherings", "/overland", "/destinations", "/journal", "/plan", "/plan/iggi", "/compass", "/the-ledger", "/partners", "/for-advisors", "/travel-notes"].forEach((p) => add(p, 0.8, "weekly"));
  RESERVES.forEach((r) => { add(`/safaris/${r.slug}`, 0.7, "monthly"); r.camps.filter(campReady).forEach((c) => add(`/safaris/${r.slug}/${c.slug}`, 0.6, "monthly")); });
  REGION_DATA.filter((r) => r.ready || r.slug === "polar-antarctica").forEach((r) => add(`/destinations/${r.slug}`, 0.7, "monthly"));
  COUNTRIES.forEach((c) => add(`/destinations/${c.region}/${c.slug}`, 0.7, "monthly"));
  STAY_PAGES.forEach((s) => add(`/stays/${s.slug}`, 0.6, "monthly"));
  return [...out.values()];
}
