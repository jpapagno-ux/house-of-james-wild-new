// Stays, from the Ledger export (scripts/export-stays.py → stays.json).
// A stay gets its own page only when it has a hero photo and some content.
import data from "./stays.json";

type Block = { paras: string[]; items: string[] };
export type StayData = {
  slug: string; name: string; ledgerId: string | null; country: string | null; countrySlug: string | null; regionSlug: string | null; misfiled: string | null;
  category: string | null; tagline: string | null; quote: string | null; hero: string | null; gallery: string[];
  bestMonths: string | null; bestMonthsNote: string | null; bestFor: string[]; status: string | null; statusDate: string | null;
  coords: { lat: number; lng: number } | null; airport: string | null; airportDirections: string | null; founderNote: string | null;
  rooms: Block; experiences: Block; features: Block; onlyHere: string[]; why: { title: string | null; body: string }[];
  facts: Record<string, string>; faqs: { q: string; a: string }[]; reviewed: boolean; reserveChild: boolean; parentSlug: string | null; engine: string | null;
};

const has = (b: Block) => b.paras.length > 0 || b.items.length > 0;
export const pageReady = (s: StayData) => !!s.hero && (has(s.rooms) || has(s.features) || s.why.length > 0 || s.onlyHere.length > 0);

export const STAYS: StayData[] = data.stays as StayData[];
export const STAY_PAGES = STAYS.filter(pageReady);
export const stayBySlug = (slug: string) => STAY_PAGES.find((s) => s.slug === slug);
export const staysIn = (countrySlug: string) => STAYS.filter((s) => s.countrySlug === countrySlug);
export const BEST_FOR: Record<string, string> = { honeymoon: "Honeymoons", family: "Families", adventure: "Adventure", luxury: "Luxury", solo: "Solo travel", wildlife_photography: "Wildlife photography" };
