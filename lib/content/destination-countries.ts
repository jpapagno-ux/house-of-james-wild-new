import { COUNTRIES } from "./countries";
import { GUIDES } from "./guides";

// Every country the site has a page for: the Ledger's countries (with stays) and the countries told as a
// guide (Indonesia, by sea). One list for the Advisor DNA picker, the advisor cards and the Ledger
// filters, so an advisor can name any country a traveller can open (audit, 7 Nov 2026).
const REGION_NAME = new Map(COUNTRIES.map((c) => [c.region, c.regionName]));
export type DestinationCountry = { slug: string; name: string; region: string; regionName: string };
export const DESTINATION_COUNTRIES: DestinationCountry[] = [
  ...COUNTRIES.map((c) => ({ slug: c.slug, name: c.name, region: c.region, regionName: c.regionName })),
  ...Object.values(GUIDES)
    .filter((g) => !g.parent && !COUNTRIES.some((c) => c.slug === g.slug))
    .map((g) => ({ slug: g.slug, name: g.name, region: g.region, regionName: REGION_NAME.get(g.region) ?? g.region })),
];
export const destinationCountry = (slug: string) => DESTINATION_COUNTRIES.find((c) => c.slug === slug) ?? null;
