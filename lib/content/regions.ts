// Regions, from the Ledger export (scripts/export-regions.py → regions.json).
// Re-run the export to refresh; nothing here is typed by hand.
import data from "./regions.json";
import LIBRARY from "./countries-library.json";
import STAY_ROWS from "./stays.json";

export type RegionCountry = { name: string; slug: string | null; image: string | null; line: string; stays: number; bestMonths: string | null; reviewed: boolean; /** destination card: on the site before its stays */ coming?: boolean };
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

// The region export lists only the countries filed against the region record; countries that
// have their own Ledger country page (countries-library) and live stays are added here, with
// their stay counts from the stays export (James, 30 Oct 2026: Europe showed Greece alone while
// Portugal, Ireland, Spain, Italy, Switzerland and France were filed). Featured stays are topped
// up from the same export so a region never shows fewer than four. Destination cards (a library
// country page with staysComing and no stays yet, Sri Lanka first, 1 Nov 2026) are listed too,
// marked coming so the card reads "Stays coming soon" rather than "0 stays".
type LibCountry = { slug: string; name: string; region: string; subtitle?: string; leading?: string; hero?: { src?: string | null } | null; bestShort?: string; contentStatus?: string; staysComing?: boolean };
type StayRow = { volumes?: string[] | null; reviewed?: boolean; slug: string; name: string; ledgerId: string | null; tagline: string | null; hero: string | null; country: string | null; countrySlug: string | null; regionSlug: string | null; status: string | null; statusDate: string | null; reserveChild?: boolean; misfiled?: unknown };
const LIB = (LIBRARY.countries as LibCountry[]);
const ROWS = (STAY_ROWS.stays as StayRow[]).filter((x) => !x.misfiled);
// next/image serves only these hosts (next.config.ts)
const OK_HOST = /^(\/|https:\/\/(res\.cloudinary\.com|cdn\.prod\.website-files\.com|media\.base44\.com|base44\.app|[a-z0-9-]+\.supabase\.co)\/)/;
const countIn = (slug: string) => ROWS.filter((x) => x.countrySlug === slug).length;

export const REGION_DATA: RegionData[] = (data.regions as RegionData[]).map((r) => {
  const have = new Set(r.countries.map((c) => c.slug));
  const added: RegionCountry[] = LIB.filter((c) => c.region === r.slug && !have.has(c.slug) && (countIn(c.slug) > 0 || c.staysComing)).map((c) => ({
    name: c.name, slug: c.slug, image: fix(c.hero?.src ?? null), line: (c.leading || c.subtitle || "").split(/(?<=\.)\s/)[0], stays: countIn(c.slug), bestMonths: c.bestShort ?? null, reviewed: c.contentStatus === "approved" || c.contentStatus === "published",
    ...(countIn(c.slug) === 0 ? { coming: true } : {}),
  }));
  const comingSlugs = new Set(LIB.filter((c) => c.staysComing).map((c) => c.slug));
  const countries = [...r.countries.map((c) => ({ ...c, image: fix(c.image), stays: Math.max(c.stays, c.slug ? countIn(c.slug) : 0) })).map((c) => (c.stays === 0 && c.slug && comingSlugs.has(c.slug) ? { ...c, coming: true } : c)), ...added].sort((a, b) => b.stays - a.stays);
  // Featured stays must have a page (the stays export); stays filed under the region's own volume
  // (Europe: Volume V, Dá Licença first) and reviewed stays lead the top-up.
  const ROW_SLUGS = new Set(ROWS.map((x) => x.slug));
  const featured = r.featured.map((f) => ({ ...f, image: fix(f.image) as string })).filter((f) => OK_HOST.test(f.image ?? "") && ROW_SLUGS.has(f.slug));
  const lead = (x: StayRow & { volumes?: string[] | null; reviewed?: boolean }) => (x.volumes?.includes(r.slug) ? 0 : 2) + (x.reviewed ? 0 : 1);
  if (featured.length < 4) {
    const seen = new Set(featured.map((f) => f.slug));
    for (const x of ROWS.filter((x) => x.regionSlug === r.slug && x.hero && OK_HOST.test(fix(x.hero) ?? "") && !x.reserveChild && !seen.has(x.slug)).sort((a, b) => lead(a) - lead(b)).slice(0, 4 - featured.length))
      featured.push({ name: x.name, slug: x.slug, ledgerId: x.ledgerId, tagline: x.tagline, image: fix(x.hero) as string, country: x.country ?? "", status: x.status, statusDate: x.statusDate, reserveChild: false });
  }
  const stayCount = Math.max(r.stayCount, countries.reduce((n, c) => n + c.stays, 0));
  return { ...r, hero: fix(r.hero), gallery: r.gallery.map((g) => fix(g) as string), countries, featured, stayCount };
});
export const EXPORTED_ON = data.exportedOn;
export const regionBySlug = (slug: string) => REGION_DATA.find((r) => r.slug === slug);
