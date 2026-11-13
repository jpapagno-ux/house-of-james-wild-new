// Island hops (James, 13 Nov 2026): the house-wide answer to "can I combine these two islands?".
//
// The stay record already says how each property is reached (airport and airportDirections, read from the brand's own
// site in the library). This layer reads those two fields and nothing else, so it adds no new facts: two stays that
// share a gateway airport can be paired with a connection through it, and each stay's own transfer is quoted as the
// library holds it. Where the house has drawn a full network for a country (flights and boats between islands, each
// with its source), that network is registered in NETWORKS and its direct links are named in the answer.
//
// How it stays out of the way of the library sync:
//   - nothing here writes to stays.json; the question is added when the site reads the export (lib/content/stays.ts);
//   - a stay that already has a hand-written "combine" question in the library keeps it, and gets nothing added;
//   - a country is switched on by adding its slug to ISLAND_COUNTRIES, one at a time, after James has read the answers.

export type HopStay = {
  slug: string; name: string; countrySlug: string | null; country: string | null;
  airport: string | null; airportDirections: string | null;
  coords: { lat: number; lng: number } | null;
  faqs: { q: string; a: string }[];
};
export type Gateway = { code: string; name: string };
/** A direct link between two gateways, as its operator or a brand publishes it. No source, no link. */
export type HopLink = { from: string; to: string; mode: "air" | "boat"; time: string | null; source: string; checked: string };

/** Countries whose stay pages carry the generated question. Add a slug only after its answers are approved. */
export const ISLAND_COUNTRIES = new Set<string>(["fiji"]);

/** Direct links between gateways, by country. French Polynesia's full network lives in lib/content/french-polynesia.ts
 *  (NODES, LEGS, ROUTES) and moves here when its hand-written questions are retired; until then it is left untouched. */
export const NETWORKS: Record<string, HopLink[]> = {
  fiji: [
    { from: "NAN", to: "SVU", mode: "air", time: "about an hour", source: "Jean-Michel Cousteau Resort, getting here (fijiresort.com)", checked: "2026-11-13" },
  ],
};

const DASH = /[–—]/;
/** "Savusavu Airport (SVU), via Nadi International Airport (NAN)" -> [{SVU, Savusavu Airport}, {NAN, Nadi International Airport}]. */
export function gateways(airport: string | null): Gateway[] {
  if (!airport) return [];
  const out: Gateway[] = [];
  for (const m of airport.matchAll(/([^()]+?)\s*\(([A-Z]{3})\)/g)) {
    const name = m[1].replace(/^[\s,;.]+/, "").replace(/^(?:and|or|via)\s+/i, "").trim();
    if (name && !DASH.test(name) && !out.some((g) => g.code === m[2])) out.push({ code: m[2], name });
  }
  return out;
}

const firstSentence = (t: string | null) => {
  if (!t) return null;
  const s = (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();
  return s.length >= 20 && s.length <= 260 && !DASH.test(s) ? s : null;
};
const km = (a: HopStay["coords"], b: HopStay["coords"]) => {
  if (!a || !b) return Infinity;
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (((b.lng - a.lng + 540) % 360) - 180) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
};
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const tidy = (n: string) => n.replace(/\s+/g, " ").trim();
const hasCombine = (s: HopStay) => (s.faqs ?? []).some((f) => /\bcombin/i.test(f.q));

/** The pairing behind the answer: the gateway shared, and the nearest house stays that share it. */
export function pairing(stay: HopStay, all: HopStay[]): { gateway: Gateway; partners: HopStay[]; total: number } | null {
  const mine = gateways(stay.airport);
  if (!stay.countrySlug || mine.length === 0) return null;
  const others = all.filter((o) => o.slug !== stay.slug && o.countrySlug === stay.countrySlug);
  // The stay's own (first-named) gateway wins when another stay shares it; otherwise the wider hub.
  for (const g of mine) {
    const share = others.filter((o) => gateways(o.airport).some((x) => x.code === g.code));
    if (share.length === 0) continue;
    const partners = [...share].sort((a, b) => km(stay.coords, a.coords) - km(stay.coords, b.coords) || a.name.localeCompare(b.name)).slice(0, 3);
    return { gateway: g, partners, total: share.length };
  }
  return null;
}

/** The generated question for one stay, or none: wrong country, no shared gateway, or the library already answers it. */
export function combineFaqs(stay: HopStay, all: HopStay[], countries: Set<string> = ISLAND_COUNTRIES): { q: string; a: string }[] {
  if (!stay.countrySlug || !countries.has(stay.countrySlug) || hasCombine(stay)) return [];
  const p = pairing(stay, all);
  if (!p) return [];
  const where = stay.country ?? "the islands";
  const me = tidy(stay.name);
  const names = listOf([me, ...p.partners.map((x) => tidy(x.name))]);
  const more = p.total > p.partners.length ? `, as are ${p.total - p.partners.length} more house stays` : "";
  const own = gateways(stay.airport)[0];
  const link = (NETWORKS[stay.countrySlug] ?? []).find((l) => own && own.code !== p.gateway.code && ((l.from === own.code && l.to === p.gateway.code) || (l.to === own.code && l.from === p.gateway.code)));
  const hop = link ? ` ${own.name} is ${link.time ? `${link.time} from` : "linked to"} ${p.gateway.name} by ${link.mode === "air" ? "air" : "boat"}.` : "";
  const mine = firstSentence(stay.airportDirections);
  const a = `Yes. ${names} are ${p.partners.length === 1 ? "both" : "all"} reached through ${p.gateway.name} (${p.gateway.code})${more}, so one journey can take in ${p.partners.length === 1 && !more ? "both" : "two of them"} with a connection there.${hop}${mine ? ` Getting to ${me}: ${mine}` : ""} James plans the order and the transfers for your dates.`;
  return [{ q: `Can you combine ${me} with another island in ${where}?`, a }];
}
