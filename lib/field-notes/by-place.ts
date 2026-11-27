import { COUNTRIES } from "@/lib/content/countries";
import { COUNTRY_FIELD_NOTES, FIELD_NOTES, SPECIES_PAGES } from "./notes";

// Which species pages belong to which country (James, 24 Nov 2026). A note belongs to every country whose page
// carries it; Amazon and Galápagos notes also belong to the countries those waters lie in. One list for the house
// search and for the Atlas "Wildlife here" line, so the two never disagree.
const REGION_COUNTRIES: Record<string, string[]> = { Amazon: ["peru", "brazil", "ecuador-galapagos"], "Galápagos": ["ecuador-galapagos"], Alaska: [], Antarctica: [], Arctic: ["norway"], Indonesia: ["indonesia"], "French Polynesia": ["tahiti"], Fiji: ["fiji"], "Costa Rica": ["costa-rica"], Belize: ["belize"], Patagonia: ["chile", "argentina"] };

export type SpeciesLink = { name: string; href: string };

export const speciesName = (id: string): string => { const t = FIELD_NOTES[id].title.replace(/^The /, ""); return t[0].toUpperCase() + t.slice(1); };

/** The countries a species page is filed under, as COUNTRIES records. */
export function speciesCountries(id: string) {
  const note = FIELD_NOTES[id];
  const slugs = [...new Set([...Object.entries(COUNTRY_FIELD_NOTES).filter(([, ids]) => ids.includes(id)).map(([s]) => s), ...(REGION_COUNTRIES[note.region] ?? [])])];
  return slugs.map((s) => COUNTRIES.find((c) => c.slug === s)).filter((c): c is (typeof COUNTRIES)[number] => !!c);
}

/** Species pages by place name: every country, plus the two waters by their own names. */
export function speciesByPlace(): Record<string, SpeciesLink[]> {
  const out: Record<string, SpeciesLink[]> = {};
  const put = (place: string, id: string) => { (out[place] ??= []).push({ name: speciesName(id), href: `/wildlife/${id}` }); };
  for (const id of Object.keys(SPECIES_PAGES)) {
    for (const c of speciesCountries(id)) put(c.name, id);
    const region = FIELD_NOTES[id].region;
    if (REGION_COUNTRIES[region]) put(region, id);
  }
  return out;
}
