// The house's overnight in a country's gateway city: the stay James books for
// the first and last night of a safari there. Shown on the country page and on
// every stay page in that country, once the gateway stay has its own page.
import { STAYS, pageReady } from "./stays";
import { hubsForCountry, hubLabel } from "./arrivals";
import { COUNTRIES } from "./countries";

type Gateway = { slug: string; city: string; line: string };
export const GATEWAYS: Record<string, Gateway> = {
  // James, 29 Oct 2026: partner lodge and the house's overnight Nairobi property (vetted 2018).
  kenya: { slug: "hemingways-nairobi", city: "Nairobi", line: "Most Kenya safaris start and end with a night in Nairobi. The house books Hemingways in Karen: quiet, close to the Ngong Hills, and about 20 minutes from Wilson Airport for the bush flights." },
};

// Stage 5 (Last Mile): a Ledger hub flagged `is_gateway_overnight` with its gateway stay on record
// takes precedence over the hand list above; the hand entry stays as the fallback until then.
const fromLedger = (countrySlug: string): Gateway | undefined => {
  const name = COUNTRIES.find((c) => c.slug === countrySlug)?.name;
  const hub = hubsForCountry(name).find((h) => h.gatewayOvernight && h.gatewayRef);
  if (!hub) return undefined;
  const stay = STAYS.find((s) => s.slug === hub.gatewayRef);
  return stay ? { slug: stay.slug, city: hub.city ?? stay.country ?? hub.name, line: hub.houseNotes ?? `Most journeys here begin or end with a night near ${hubLabel(hub)}. The house books ${stay.name} for the first or last night.` } : undefined;
};

export const gatewayFor = (countrySlug?: string | null, exclude?: string) => {
  const g = countrySlug ? fromLedger(countrySlug) ?? GATEWAYS[countrySlug] : undefined;
  if (!g || g.slug === exclude) return null;
  const s = STAYS.find((x) => x.slug === g.slug);
  return s && pageReady(s) ? { ...g, stay: s } : null;
};
