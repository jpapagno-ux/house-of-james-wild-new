// Rate-card estimates for partners without a live booking engine (MORE
// Collection first, 1 Nov 2026). The card is the partner's published "from"
// rate per room type in rand, by year; an estimate multiplies it out for the
// guest's dates and party. It is always an estimate: the partner confirms the
// real price and availability before anything is charged. Pure functions, no
// imports, so plain Node can test them (the JSON is bound in
// lib/content/rate-cards/index.ts).

export type Basis = "pps" | "unit" | "exclusive";
export type CardRow = { key: string; name: string; units: string; zar: number; usd: number; basis: Basis; maxGuests: number; maxAdults?: number; minAge: number; child?: { from: number; to: number; pct: number; freeUnder?: number }; note: string };
export type Year = { validFrom: string; validTo: string; rows: CardRow[] };
type Card = { name: string; years: Record<string, Year> };
export type CardData = { _source: string; partner: string; currency: string; properties: Record<string, Card>; pages: Record<string, { property: string; rows?: string[] }>; offers?: OfferRules & { validTo?: string; notesByProperty?: Record<string, string[]> } };
export const BASIS_LABEL: Record<Basis, string> = { pps: "per person per night sharing", unit: "per room per night", exclusive: "exclusive use per night" };

/** The rows a page shows, from the latest year, for "from" prices. */
export function cardFor(DATA: CardData, pageKey: string): { property: string; partner: string; rows: CardRow[]; years: string[] } | null {
  const p = DATA.pages[pageKey];
  if (!p) return null;
  const card = DATA.properties[p.property];
  const years = Object.keys(card.years).sort();
  const latest = card.years[years[years.length - 1]].rows;
  const rows = p.rows ? p.rows.map((k) => latest.find((r) => r.key === k)).filter((r): r is CardRow => !!r) : latest;
  return { property: p.property, partner: DATA.partner, rows, years };
}

/** The card year that covers a check-in date, or null when no published card covers it. */
export function yearFor(DATA: CardData, property: string, checkIn: string, checkOut: string): Year | null {
  const card = DATA.properties[property];
  if (!card) return null;
  const last = new Date(Date.parse(checkOut) - 86400000).toISOString().slice(0, 10);
  return Object.values(card.years).find((y) => checkIn >= y.validFrom && last <= y.validTo) ?? null;
}

export type Party = { adults: number; children: number[] }; // children = ages
export type Estimate = { ok: true; nights: number; units: number; zar: number; usd: number; lines: string[] } | { ok: false; reason: string };

export const nightsOf = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

export function estimate(row: CardRow, nights: number, party: Party): Estimate {
  if (nights < 1) return { ok: false, reason: "Choose at least one night." };
  const guests = party.adults + party.children.length;
  if (party.children.some((a) => a < row.minAge)) return { ok: false, reason: `${row.name} welcomes guests from ${row.minAge}.` };
  const per = (z: number) => ({ zar: z, usd: Math.round((z * row.usd) / row.zar * 100) / 100 });
  if (row.basis === "exclusive") {
    if (guests > row.maxGuests || (row.maxAdults && party.adults > row.maxAdults)) return { ok: false, reason: `${row.name} sleeps up to ${row.maxGuests}${row.maxAdults ? ` (${row.maxAdults} adults)` : ""}.` };
    const t = per(row.zar * nights);
    return { ok: true, nights, units: 1, ...t, lines: [`${row.name}, whole villa × ${nights} ${nights === 1 ? "night" : "nights"}`] };
  }
  // Rooms needed: fill each room to its limit (adults first).
  const units = Math.max(1, Math.ceil(guests / row.maxGuests), row.maxAdults ? Math.ceil(party.adults / row.maxAdults) : 0);
  if (row.basis === "unit") {
    const t = per(row.zar * units * nights);
    return { ok: true, nights, units, ...t, lines: [`${units} × ${row.name} × ${nights} ${nights === 1 ? "night" : "nights"}`] };
  }
  // Per person sharing: adults at the full rate, children by the card's band.
  let people = party.adults;
  const lines = [`${party.adults} ${party.adults === 1 ? "adult" : "adults"} at the sharing rate`];
  for (const age of party.children) {
    const c = row.child;
    if (c?.freeUnder !== undefined && age < c.freeUnder) { lines.push(`Child aged ${age}: free`); continue; }
    if (c && age >= c.from && age <= c.to) { people += c.pct / 100; lines.push(`Child aged ${age}: ${c.pct}% of the adult rate`); continue; }
    people += 1; lines.push(`Guest aged ${age}: adult rate`);
  }
  if (party.adults === 1 && party.children.length === 0) lines.push("Single travellers usually pay a supplement; the lodge confirms it");
  const t = per(row.zar * people * nights);
  return { ok: true, nights, units, ...t, lines };
}

// Partner offers applied to an estimate (MORE Collection, 1 Nov 2026, terms from
// more.co.za/offers). A free-night offer and a celebration discount are not
// stated as combinable with each other, so the larger one applies; a returning-
// guest discount stacks on top. Multi-property offers (DiscoverMORE, Best of
// Both Worlds) need a second lodge, so they show as notes for the planner.
export type OfferRules = {
  freeNight?: { name: string; minNights: number; excludeRows?: string[] };
  celebrate?: { name: string; pct: number; minNights: number };
  returning?: { name: string; pct: number };
  notes?: string[];
};
export type OfferChoice = { celebrating: boolean; returning: boolean };
export type Applied = { zar: number; usd: number; savings: { name: string; zar: number; usd: number }[]; notes: string[] };

export function applyOffers(row: CardRow, e: Extract<Estimate, { ok: true }>, party: Party, rules: OfferRules | undefined, choice: OfferChoice): Applied {
  const toUsd = (z: number) => Math.round((z * e.usd) / (e.zar || 1) * 100) / 100;
  const notes: string[] = [];
  const savings: { name: string; zar: number }[] = [];
  if (!rules) return { zar: e.zar, usd: e.usd, savings: [], notes };
  const night = e.zar / e.nights;
  let free = 0, cel = 0;
  const fn = rules.freeNight;
  if (fn && !(fn.excludeRows ?? []).includes(row.key)) {
    if (e.nights >= fn.minNights) free = night;
    else notes.push(`${fn.name}: stay ${fn.minNights} nights and one night is free`);
  }
  const c = rules.celebrate;
  if (c && choice.celebrating) {
    if (e.nights < c.minNights) notes.push(`${c.name} needs ${c.minNights} nights or more`);
    else if (row.basis === "pps") cel = (row.zar * Math.min(2, party.adults) * e.nights * c.pct) / 100;
    else if (row.basis === "unit") cel = (row.zar * e.nights * c.pct) / 100;
    else notes.push(`${c.name} on a whole villa is confirmed with your quote`);
  }
  if (free || cel) {
    const best = free >= cel ? { name: fn!.name, zar: free } : { name: c!.name, zar: cel };
    savings.push(best);
    if (free && cel) notes.push(`${free >= cel ? c!.name : fn!.name} does not combine with ${best.name}; the larger saving is shown`);
  }
  let zar = e.zar - savings.reduce((s, x) => s + x.zar, 0);
  const r = rules.returning;
  if (r && choice.returning) { const off = (zar * r.pct) / 100; savings.push({ name: r.name, zar: off }); zar -= off; }
  return { zar, usd: toUsd(zar), savings: savings.map((s) => ({ ...s, usd: toUsd(s.zar) })), notes };
}
