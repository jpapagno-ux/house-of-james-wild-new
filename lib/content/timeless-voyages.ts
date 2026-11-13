import DATA from "./timeless-voyages.json";

// Timeless Voyages: the house's premium ships collection inside Voyages (James, 13 Nov 2026). Membership lives in
// Airtable (Editorial Layer, table "Timeless Voyages") and arrives here through scripts/export-editorial-layer.mjs,
// the same path as The Exceptional Few. Only published rows with approved image rights are exported. A ship can be
// in both collections; The Exceptional Few entrance always wins on her page.
export type TimelessVoyage = {
  id: string; vesselSlug: string; vesselName: string | null; operator: string | null; collectionNumber: number; ledgerId: string | null;
  sailingStatus: "sailing" | "launching"; launchDate: string | null; signatureEdition: boolean; heroLine: string | null; whyItBelongs: string[];
  before: string[]; beyond: string[];
};

export const TIMELESS_VOYAGES = DATA.records as unknown as TimelessVoyage[];
export const timelessVoyageFor = (slug: string) => TIMELESS_VOYAGES.find((t) => t.vesselSlug === slug) ?? null;
/** Ships whose first season is still ahead, shown under "Maiden Voyages". */
export const maidenVoyages = (on = new Date().toISOString().slice(0, 10)) => TIMELESS_VOYAGES.filter((t) => t.sailingStatus === "launching" && (!t.launchDate || t.launchDate > on));
