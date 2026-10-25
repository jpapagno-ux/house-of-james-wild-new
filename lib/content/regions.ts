// Regions, from the Ledger export (scripts/export-regions.py → regions.json).
// Re-run the export to refresh; nothing here is typed by hand.
import data from "./regions.json";

export type RegionCountry = { name: string; slug: string | null; image: string | null; line: string; stays: number; bestMonths: string | null; reviewed: boolean };
export type RegionStay = { name: string; slug: string; ledgerId: string | null; tagline: string | null; image: string; country: string; status: string | null; statusDate: string | null; reserveChild: boolean };
export type RegionData = {
  slug: string; name: string; tagline: string; intro: string[]; heading: string;
  highlightsTitle: string; highlights: { title: string; text: string }[];
  hero: string | null; gallery: string[];
  facts: Record<string, string>; faqs: { q: string; a: string }[];
  countries: RegionCountry[]; featured: RegionStay[]; stayCount: number;
  reviewed: boolean; ready: boolean;
};

// Base44 serves AVIF as octet-stream; route those through /img/b44.
const fix = (u: string | null) => (u && /media\.base44\.com\/images\/public\/[^/]+\/[^/]+\.avif$/i.test(u) ? `/img/b44/${u.split("/").pop()}` : u);

export const REGION_DATA: RegionData[] = (data.regions as RegionData[]).map((r) => ({
  ...r,
  hero: fix(r.hero),
  gallery: r.gallery.map((g) => fix(g) as string),
  countries: r.countries.map((c) => ({ ...c, image: fix(c.image) })),
  featured: r.featured.map((f) => ({ ...f, image: fix(f.image) as string })),
}));
export const EXPORTED_ON = data.exportedOn;
export const regionBySlug = (slug: string) => REGION_DATA.find((r) => r.slug === slug);
