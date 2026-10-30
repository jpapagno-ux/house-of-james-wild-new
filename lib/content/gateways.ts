// The house's overnight in a country's gateway city: the stay James books for
// the first and last night of a safari there. Shown on the country page and on
// every stay page in that country, once the gateway stay has its own page.
import { STAYS, pageReady } from "./stays";

type Gateway = { slug: string; city: string; line: string };
export const GATEWAYS: Record<string, Gateway> = {
  // James, 29 Oct 2026: partner lodge and the house's overnight Nairobi property (vetted 2018).
  kenya: { slug: "hemingways-nairobi", city: "Nairobi", line: "Most Kenya safaris start and end with a night in Nairobi. The house books Hemingways in Karen: quiet, close to the Ngong Hills, and about 20 minutes from Wilson Airport for the bush flights." },
};

export const gatewayFor = (countrySlug?: string | null, exclude?: string) => {
  const g = countrySlug ? GATEWAYS[countrySlug] : undefined;
  if (!g || g.slug === exclude) return null;
  const s = STAYS.find((x) => x.slug === g.slug);
  return s && pageReady(s) ? { ...g, stay: s } : null;
};
