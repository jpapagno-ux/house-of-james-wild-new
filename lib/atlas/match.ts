import { today } from "../dates.ts";

// Atlas Search, Phase 01 (James, 20 Nov 2026: staging pilot). The one set of rules behind the Ask the House bar and
// the results at /atlas: the query and its address, the three separate lines every result prints (season, offer,
// availability), how unknown data is treated, and the two orders (Best match, Savings first). Pure and import-free
// beyond lib/dates.ts, like lib/content/ships/search-match.ts, so the page, the tests and any later surface (Atlas by
// Voice, The House Surprise, The Elsewhere Room) read one definition.
//
// House rules written into the code:
// - A filter never matches on a fact that is not filed, and a missing fact never makes a record unsuitable. Missing
//   occupancy, child policy or season is its own state, printed on the card.
// - Season, offer eligibility and availability are three different things. A stay in season is never called available.
// - An offer "applies" only when every condition can be checked from the search. Anything else "may apply".
// - Nothing is computed about a saving: the headline is the partner's own filed words.

export const CATEGORIES = [
  "hotels", "resorts", "villas", "private-residences", "safari-camps-and-lodges", "private-safaris",
  "ocean-voyages-and-yachts", "expedition-voyages", "river-voyages", "land-journeys", "overland-expeditions",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_LABEL: Record<Category, string> = {
  hotels: "Hotels", resorts: "Resorts", villas: "Villas", "private-residences": "Private Residences",
  "safari-camps-and-lodges": "Safari Camps and Lodges", "private-safaris": "Private Safaris",
  "ocean-voyages-and-yachts": "Ocean Voyages and Yachts", "expedition-voyages": "Expedition Voyages", "river-voyages": "River Voyages",
  "land-journeys": "Land Journeys", "overland-expeditions": "Overland Expeditions",
};
export const CATEGORY_GROUPS: { label: string; items: Category[] }[] = [
  { label: "Stays", items: ["hotels", "resorts", "villas", "private-residences"] },
  { label: "Safaris", items: ["safari-camps-and-lodges", "private-safaris"] },
  { label: "Voyages", items: ["ocean-voyages-and-yachts", "expedition-voyages", "river-voyages"] },
  { label: "Journeys", items: ["land-journeys", "overland-expeditions"] },
];

/** Editorial collections: a second layer that may overlap any category, never a category themselves. */
export const COLLECTIONS = ["the-exceptional-few", "timeless-voyages"] as const;
export type Collection = (typeof COLLECTIONS)[number];
export const COLLECTION_LABEL: Record<Collection, string> = { "the-exceptional-few": "The Exceptional Few", "timeless-voyages": "Timeless Voyages" };

export const INTERESTS = ["wildlife", "wellness", "water", "islands", "culture", "adventure", "romance", "family"] as const;
export type Interest = (typeof INTERESTS)[number];
export const INTEREST_LABEL: Record<Interest, string> = { wildlife: "Wildlife", wellness: "Wellness", water: "Water", islands: "Islands", culture: "Culture", adventure: "Adventure", romance: "Romance", family: "Family" };

export type AtlasOffer = {
  id: string; program: string; headline: string;
  /** The window as filed (ISO). `bookingWindow`: the window is a booking deadline, not travel dates. */
  from: string; to: string; bookingWindow: boolean;
  /** The date the terms were last checked (ISO). */
  checked: string;
  /** Conditions are filed as free text; their presence means eligibility cannot be settled by a search. */
  hasConditions: boolean;
  /** What kind of condition the free text is, read by rule at build (lib/atlas/classify.ts). Never the text itself. */
  condition?: ConditionKind | null;
  /** The shortest stay the conditions name ("Minimum stay 2 nights"), when they name one. */
  minStay?: number | null;
  /** Final Call: the departure the offer belongs to. */
  departure: string | null;
  /** Booking-window offers: the last sailing or stay date covered, when filed. */
  travelUntil: string | null;
};

export type ConditionKind = "occasion" | "combination" | "returning" | "single" | "family" | "other";
const CONDITION_WORDS: Record<ConditionKind, string> = {
  occasion: "It is for a celebration such as a honeymoon, anniversary or milestone birthday.",
  combination: "It asks for a combination of properties or a longer route.",
  returning: "It is for returning guests.",
  single: "It concerns the single supplement.",
  family: "It concerns children or family rooms.",
  other: "Conditions apply.",
};

export type AtlasRecord = {
  id: string;
  kind: "stay" | "camp" | "reserve" | "ship" | "sailing" | "voyage" | "route" | "dossier" | "coming";
  name: string; href: string;
  /** The Atlas category. null: the record is awaiting editorial classification and matches no category filter. */
  category: Category | null;
  /** While awaiting classification: the category the rules propose, used only to tell a traveller how many records a category filter is holding back. Never printed as the record's category. */
  proposed: Category | null;
  /** What the Ledger itself files the record as ("Lodge", "Motor yacht"), printed when no category is confirmed. */
  filedAs: string;
  country: string | null; countries: string[]; region: string | null; regionLabel: string | null;
  tagline: string | null;
  image: string | null;
  /** The founder or partner mark, printed only from Ledger status. */
  mark: string | null;
  collections: Collection[];
  interests: Interest[];
  /** Standing in house order: 3 The Exceptional Few, 2 a founder mark, 1 a partner mark, 0 none. */
  standing: number;
  /** Best months (0 = January): the place's own filed months where they read cleanly, else the country's month bands; null when neither is filed. */
  bestMonths: number[] | null;
  /** Where bestMonths came from: the record's own Ledger entry, or its country. */
  seasonOf?: "place" | "country" | null;
  /** The operator offers the whole property for exclusive use as well as individual rooms (confirmed, lib/atlas/category-decisions.json). */
  exclusiveUse?: boolean;
  /** The Ledger files this record as suited to families (its own "best for" list). Not an occupancy figure. */
  familyFiled?: boolean;
  /** Ships and voyages: open departures as [from, to] (ISO; to = from for a dated sailing). null: none are published. */
  departures: [string, string][] | null;
  /** The most guests one unit or the vessel takes, where filed. null: not filed. */
  sleeps: number | null;
  /** Ships: youngest child accepted (0 = all ages). null: not filed. undefined: not a question for this record. */
  minChildAge?: number | null;
  /** A published "from" figure already shown on the record's own page, with its basis. Never computed here. */
  price: { amount: string; basis: string } | null;
  /** How the record is booked today: a live engine on its page, or a request to the house. */
  booking: "engine" | "request";
  offers: AtlasOffer[];
};

export type Sort = "best" | "savings";
export type AtlasQuery = {
  where: string; cat: Category[]; col: Collection[];
  /** Exact dates (ISO) or flexible months (YYYY-MM); never both. */
  from: string | null; to: string | null; months: string[];
  adults: number; children: number[];
  interests: Interest[]; sort: Sort;
};
export const EMPTY: AtlasQuery = { where: "", cat: [], col: [], from: null, to: null, months: [], adults: 2, children: [], interests: [], sort: "best" };

// ---- the query and its address -----------------------------------------------------------------------------------

const ISO = /^\d{4}-\d{2}-\d{2}$/, YM = /^\d{4}-\d{2}$/;
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? Math.floor(n) : lo));

/** Read a shared search from its address. Anything unrecognised is dropped, never guessed. */
export function fromQuery(p: URLSearchParams): AtlasQuery {
  const from = p.get("from"), to = p.get("to");
  const dated = !!from && !!to && ISO.test(from) && ISO.test(to) && to > from;
  return {
    where: (p.get("where") ?? "").trim().slice(0, 80).replace(/^anywhere$/i, ""),
    cat: list(p.get("cat")).filter((c): c is Category => (CATEGORIES as readonly string[]).includes(c)),
    col: list(p.get("col")).filter((c): c is Collection => (COLLECTIONS as readonly string[]).includes(c)),
    from: dated ? from : null, to: dated ? to : null,
    months: dated ? [] : [...new Set(list(p.get("months")).filter((m) => YM.test(m)))].sort().slice(0, 12),
    adults: clamp(Number(p.get("adults") ?? 2), 1, 16),
    children: list(p.get("children")).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 17).slice(0, 8),
    interests: list(p.get("for")).filter((i): i is Interest => (INTERESTS as readonly string[]).includes(i)),
    sort: p.get("sort") === "savings" ? "savings" : "best",
  };
}

/** The address of a search: only what differs from an empty search, in a fixed order, so one search has one address. */
export function toQuery(q: AtlasQuery): string {
  const p = new URLSearchParams();
  if (q.where.trim()) p.set("where", q.where.trim());
  if (q.cat.length) p.set("cat", CATEGORIES.filter((c) => q.cat.includes(c)).join(","));
  if (q.col.length) p.set("col", COLLECTIONS.filter((c) => q.col.includes(c)).join(","));
  if (q.from && q.to) { p.set("from", q.from); p.set("to", q.to); }
  else if (q.months.length) p.set("months", [...q.months].sort().join(","));
  if (q.adults !== 2) p.set("adults", String(q.adults));
  if (q.children.length) p.set("children", q.children.join(","));
  if (q.interests.length) p.set("for", INTERESTS.filter((i) => q.interests.includes(i)).join(","));
  if (q.sort === "savings") p.set("sort", "savings");
  return p.toString().replace(/%2C/g, ",");
}

export const hasDates = (q: AtlasQuery) => (!!q.from && !!q.to) || q.months.length > 0;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (ym: string) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
const day = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const dateWords = day;
const lastDay = (ym: string) => { const y = Number(ym.slice(0, 4)), m = Number(ym.slice(5, 7)); return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`; };
/** The periods a search asks about, as [from, to] ISO ranges: one for exact dates, one per flexible month. */
export const periods = (q: AtlasQuery): [string, string][] => (q.from && q.to ? [[q.from, q.to]] : q.months.map((m) => [`${m}-01`, lastDay(m)] as [string, string]));
const monthsOf = (q: AtlasQuery): number[] => {
  const out = new Set<number>();
  for (const [a, b] of periods(q)) { let y = Number(a.slice(0, 4)), m = Number(a.slice(5, 7)); const end = b.slice(0, 7); for (let i = 0; i < 24; i++) { out.add(m - 1); if (`${y}-${String(m).padStart(2, "0")}` >= end) break; m++; if (m > 12) { m = 1; y++; } } }
  return [...out];
};
const nights = (q: AtlasQuery) => (q.from && q.to ? Math.round((Date.parse(q.to) - Date.parse(q.from)) / 864e5) : null);

// ---- where ---------------------------------------------------------------------------------------------------------

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const STOP = new Set(["in", "the", "a", "an", "of", "to", "and", "for", "on", "at", "near", "with", "by"]);

/** 0: no match. 3: the record's own name. 2: its country, region or waters. 1: its tagline or what it is filed as. */
export function whereScore(r: AtlasRecord, where: string): number {
  const words = norm(where).split(" ").filter((w) => w && !STOP.has(w));
  if (!words.length) return 1;
  const name = norm(r.name), place = norm([r.country, ...r.countries, r.regionLabel].filter(Boolean).join(" ")), rest = norm([r.tagline, r.filedAs, r.category ? CATEGORY_LABEL[r.category] : ""].filter(Boolean).join(" "));
  const has = (hay: string, w: string) => (` ${hay}`).includes(` ${w}`);
  if (words.every((w) => has(name, w))) return 3;
  if (words.every((w) => has(place, w))) return 2;
  if (words.every((w) => has(name, w) || has(place, w) || has(rest, w))) return 1;
  return 0;
}

// ---- the three lines -----------------------------------------------------------------------------------------------

export type SeasonState = "in" | "outside" | "not-filed" | "sails" | "no-dates";
export function season(r: AtlasRecord, q: AtlasQuery): { state: SeasonState; line: string } {
  if (r.kind === "coming") return { state: "not-filed", line: "Not open yet. The date is the operator's own announcement and can move." };
  if (r.departures) return { state: "sails", line: r.departures.length ? `Sails ${sailingSpan(r.departures)}.` : "No open departures are published at present." };
  if (!r.bestMonths) return { state: "not-filed", line: "Ask the house about the best months here." };
  const here = r.seasonOf === "place";
  const inPlace = here ? " here" : r.country ? ` in ${r.country}` : "";
  if (!hasDates(q)) return { state: "no-dates", line: `Best months${inPlace}: ${monthRuns(r.bestMonths)}.` };
  const asked = monthsOf(q);
  return asked.some((m) => r.bestMonths!.includes(m))
    ? { state: "in", line: `Your dates fall in the best months${here ? " filed for this place" : r.country ? ` for ${r.country}` : ""}. Opening dates are confirmed by the house.` }
    : { state: "outside", line: `Outside the best months${here ? " filed for this place" : r.country ? ` for ${r.country}` : ""} (${monthRuns(r.bestMonths)}).` };
}

const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/**
 * A place's own "best months" as filed ("May to October", "June - September, December to February", "Year-round").
 * Read only when every word is a month or a joining word; a sentence, a caveat or a bracket returns null, and the
 * country's month bands are used instead. Nothing is guessed from prose.
 */
export function parseMonths(text: string | null | undefined): number[] | null {
  const t = (text ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (!t || t.length > 70) return null;
  if (/^(open )?(all year|year[- ]round)$/.test(t)) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const month = (w: string) => { const i = MONTH_KEYS.indexOf(w.slice(0, 3)); return i >= 0 && MONTHS[i].toLowerCase().startsWith(w) && w.length >= 3 ? i : -1; };
  const out = new Set<number>();
  for (const part of t.replace(/[\u2012-\u2015]/g, "-").replace(/\b(late|early|mid)[- ]/g, "").split(/,|&|\band\b/)) {
    const m = part.trim().match(/^([a-z]+)(?:\s*(?:-|to|through)\s*([a-z]+))?$/);
    if (!m) return null;
    const a = month(m[1]), b = m[2] ? month(m[2]) : a;
    if (a < 0 || b < 0) return null;
    for (let i = a; ; i = (i + 1) % 12) { out.add(i); if (i === b) break; }
  }
  return out.size ? [...out].sort((x, y) => x - y) : null;
}
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** [0,1,2,10,11] reads "Nov to Mar": runs of months, wrapping the year end. */
export function monthRuns(ms: number[]): string {
  const set = new Set(ms); if (set.size >= 12) return "all year"; if (!set.size) return "none filed";
  const runs: [number, number][] = [];
  for (let m = 0; m < 12; m++) if (set.has(m) && !set.has((m + 11) % 12)) { let e = m; while (set.has((e + 1) % 12) && (e + 1) % 12 !== m) e = (e + 1) % 12; runs.push([m, e]); }
  return runs.map(([a, b]) => (a === b ? SHORT[a] : `${SHORT[a]} to ${SHORT[b]}`)).join(", ");
}
const sailingSpan = (d: [string, string][]) => { const a = d.map((x) => x[0]).sort()[0], b = d.map((x) => x[1]).sort().pop()!; return a.slice(0, 7) === b.slice(0, 7) ? `in ${monthName(a.slice(0, 7))}` : `${monthName(a.slice(0, 7))} to ${monthName(b.slice(0, 7))}`; };

export type OfferState = "eligible" | "unknown" | "outside" | "recheck";
export const FRESH_DAYS = 45;
const overlaps = (a: [string, string], b: [string, string]) => a[0] <= b[1] && b[0] <= a[1];
const within = (inner: [string, string], outer: [string, string]) => outer[0] <= inner[0] && inner[1] <= outer[1];
/** "Stay 4 nights, pay 3" asks for four nights. null when the headline names no stay length. */
export const minNights = (headline: string) => { const m = headline.match(/\bstay\s+(\d{1,2})\b/i) ?? headline.match(/\b(\d{1,2})\s*(?:\+|or more)?\s*nights?\b/i); return m ? Number(m[1]) : null; };

/**
 * One state for one offer against one search. "eligible" is the only state printed as applying, and it needs every
 * test to pass on filed facts: terms checked within FRESH_DAYS, exact dates inside the travel window (or the named
 * departure inside the dates), the stay as long as the headline asks, and no free-text conditions left untested.
 */
export function offerState(o: AtlasOffer, q: AtlasQuery, on: string = today()): OfferState {
  const age = Math.round((Date.parse(on) - Date.parse(o.checked)) / 864e5);
  const ps = periods(q);
  const travel: [string, string] | null = o.bookingWindow ? (o.travelUntil ? [on, o.travelUntil] : null) : [o.from, o.to];
  if (ps.length && travel && !ps.some((p) => overlaps(p, travel))) return "outside";
  if (ps.length && o.departure && !ps.some((p) => p[0] <= o.departure! && o.departure! <= p[1])) return "outside";
  if (!Number.isFinite(age) || age > FRESH_DAYS) return "recheck";
  if (!(q.from && q.to) || !travel || o.hasConditions) return "unknown";
  const stay: [string, string] = [q.from, q.to];
  if (o.departure ? !(stay[0] <= o.departure && o.departure <= stay[1]) : !within(stay, travel)) return "unknown";
  const need = needNights(o), n = nights(q);
  if (need !== null && n !== null && n < need) return "unknown";
  return "eligible";
}
/** The stay an offer asks for: the longer of what its headline and its conditions name. null when neither names one. */
export const needNights = (o: AtlasOffer) => { const a = minNights(o.headline), b = o.minStay ?? null; return a === null ? b : b === null ? a : Math.max(a, b); };
/** Why an offer only "may apply", in a sentence, from filed facts alone. */
export function mayApplyReason(o: AtlasOffer, q: AtlasQuery): string {
  const need = needNights(o), n = nights(q);
  if (need !== null && n !== null && n < need) return `It asks for at least ${need} nights and your dates are ${n}.`;
  if (o.hasConditions) return CONDITION_WORDS[o.condition ?? "other"];
  if (!(q.from && q.to)) return "Add exact dates to check it.";
  return "Your dates run past its travel window.";
}
const RANK: Record<OfferState, number> = { eligible: 0, unknown: 1, recheck: 2, outside: 3 };
export type OfferLine = { offer: AtlasOffer; state: OfferState; line: string; meta: string };
/** The offer a card shows: the best state first, then the most recently checked. null when the record has none. */
export function offerLine(r: AtlasRecord, q: AtlasQuery, on: string = today()): OfferLine | null {
  const ranked = r.offers.map((o) => ({ o, s: offerState(o, q, on) })).sort((a, b) => RANK[a.s] - RANK[b.s] || b.o.checked.localeCompare(a.o.checked));
  const top = ranked[0]; if (!top) return null;
  const { o, s } = top;
  // Only an offer whose terms are current and whose window meets the search is shown. One that runs outside the dates,
  // or whose terms are overdue a check, is not printed at all (Release Gate, 20 Nov 2026).
  if (s === "outside" || s === "recheck") return null;
  const win = o.bookingWindow ? `Book by ${day(o.to)}` : `Travel ${day(o.from)} to ${day(o.to)}`;
  const line = s === "eligible" ? `${o.headline}. Applies to your dates.` : `${o.headline}. May apply. ${mayApplyReason(o, q)} Your advisor confirms.`;
  return { offer: o, state: s, line, meta: `${win} · Terms checked ${day(o.checked)}` };
}

export type AvailabilityState = "engine" | "departs" | "none-in-dates" | "no-departures" | "request";
export function availability(r: AtlasRecord, q: AtlasQuery): { state: AvailabilityState; line: string } {
  if (r.kind === "coming") return { state: "request", line: "Not bookable yet. The house takes your interest now and confirms dates once the operator publishes them." };
  if (r.departures) {
    if (!r.departures.length) return { state: "no-departures", line: "Departures on request. Nothing is held yet." };
    const ps = periods(q);
    const hit = (ps.length ? r.departures.filter((d) => ps.some((p) => overlaps(d, p))) : r.departures).map((d) => d[0]).sort()[0];
    if (!hit) return { state: "none-in-dates", line: `No published departure in your dates. Next: ${day(r.departures.map((d) => d[0]).sort()[0])}.` };
    return { state: "departs", line: `Departs ${day(hit)}, as published by the operator. Cabins are confirmed by the house.` };
  }
  if (r.booking === "engine") return { state: "engine", line: "Live rates on this stay's page. Nothing is held until you reserve." };
  return { state: "request", line: "Availability on request. Nothing is held yet." };
}

/** Facts the search asked about that the Ledger does not hold for this record. Printed on the card, never guessed. */
export function unknowns(r: AtlasRecord, q: AtlasQuery): string[] {
  const out: string[] = [];
  const party = q.adults + q.children.length;
  if (r.kind !== "route" && r.kind !== "dossier" && r.kind !== "reserve" && r.kind !== "coming" && party > 2 && r.sleeps === null) out.push(r.familyFiled ? `Rooms for ${party} travellers are confirmed by the house before anything is planned.` : `Rooms for ${party} travellers are confirmed by the house before anything is planned.`);
  if (q.children.length && r.minChildAge === null) out.push("The policy for children is confirmed by the house.");
  return out;
}

// ---- matching and order --------------------------------------------------------------------------------------------

export type Result = { record: AtlasRecord; where: number; season: ReturnType<typeof season>; offer: OfferLine | null; availability: ReturnType<typeof availability>; unknowns: string[] };
export type Outcome = {
  results: Result[];
  /** Records that met the search but for a category filter, because they await editorial classification. */
  awaitingCategory: number;
  /** Those same records, in the same order as the results. Shown apart from the results, under what the Ledger files them as, never as members of the category. */
  awaiting: Result[];
  /** Savings first with no current offer among the results: the order is Best match, and the page says so. */
  savingsEmpty: boolean;
  /** How many results carry at least one fact the search asked about and the Ledger does not hold. */
  withUnknowns: number;
  offers: { eligible: number; mayApply: number };
};

/** Does the record meet every filter set? A filed fact can exclude; a missing fact never does. */
export function matches(r: AtlasRecord, q: AtlasQuery, opts: { ignoreCategory?: boolean } = {}): boolean {
  if (whereScore(r, q.where) === 0) return false;
  if (!opts.ignoreCategory && q.cat.length && (!r.category || !q.cat.includes(r.category))) return false;
  if (q.col.length && !q.col.some((c) => r.collections.includes(c))) return false;
  if (q.interests.length && !q.interests.every((i) => r.interests.includes(i))) return false;
  const party = q.adults + q.children.length;
  if (r.sleeps !== null && party > r.sleeps) return false;
  if (typeof r.minChildAge === "number" && q.children.some((age) => age < r.minChildAge!)) return false;
  // Ships: a published calendar with no departure in the dates is a filed fact. An unpublished calendar is not.
  const ps = periods(q);
  if (ps.length && r.departures && r.departures.length && !r.departures.some((d) => ps.some((p) => overlaps(d, p)))) return false;
  // A dated sailing answers a search that gives dates, or one that names it. Otherwise her ship stands for her sailings.
  if (r.kind === "sailing" && !ps.length && whereScore(r, q.where) < 3) return false;
  // A place that is not open yet is found by name or place only: never by dates, guests, interests or a collection.
  if (r.kind === "coming" && (!q.where.trim() || ps.length > 0 || q.interests.length > 0 || q.col.length > 0 || q.cat.length > 0)) return false;
  return true;
}

const cmp = (...keys: number[]) => keys;
function order(a: number[], b: number[]) { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }

export function search(records: AtlasRecord[], q: AtlasQuery, on: string = today()): Outcome {
  const row = (r: AtlasRecord): Result => ({ record: r, where: whereScore(r, q.where), season: season(r, q), offer: offerLine(r, q, on), availability: availability(r, q), unknowns: unknowns(r, q) });
  const results: Result[] = records.filter((r) => matches(r, q)).map(row);
  const awaiting: Result[] = q.cat.length ? records.filter((r) => !r.category && !!r.proposed && q.cat.includes(r.proposed) && matches(r, q, { ignoreCategory: true })).map(row) : [];
  const seasonRank = (s: SeasonState) => (s === "in" || s === "sails" ? 0 : s === "no-dates" || s === "not-filed" ? 1 : 2);
  const offerRank = (o: OfferLine | null) => (!o ? 2 : o.state === "eligible" ? 0 : o.state === "unknown" ? 1 : 2);
  const fresh = (o: OfferLine | null) => (o && offerRank(o) < 2 ? -Date.parse(o.offer.checked) : 0);
  const deadline = (o: OfferLine | null) => (o && offerRank(o) < 2 ? Date.parse(o.offer.departure ?? o.offer.to) : Number.MAX_SAFE_INTEGER);
  // Best match (house order): how well it answers the search, facts confirmed before facts missing, house standing,
  // season, how it is booked; an offer that applies only breaks a tie.
  const best = (x: Result) => cmp(-x.where, x.unknowns.length ? 1 : 0, -x.record.standing, seasonRank(x.season.state), x.record.booking === "engine" ? 0 : 1, x.offer?.state === "eligible" ? 0 : 1);
  // Savings first: relevance still leads; then the offer's state, how recently its terms were checked, and only then
  // the nearer deadline (a tie-break, never the reason an offer leads).
  const savings = (x: Result) => cmp(-x.where, offerRank(x.offer), fresh(x.offer), deadline(x.offer), ...best(x).slice(1));
  const key = q.sort === "savings" ? savings : best;
  const byKey = (a: Result, b: Result) => order(key(a), key(b)) || a.record.name.localeCompare(b.record.name);
  results.sort(byKey); awaiting.sort(byKey);
  return {
    results, awaitingCategory: awaiting.length, awaiting,
    savingsEmpty: q.sort === "savings" && !results.some((x) => x.offer),
    withUnknowns: results.filter((x) => x.unknowns.length).length,
    offers: { eligible: results.filter((x) => x.offer?.state === "eligible").length, mayApply: results.filter((x) => x.offer?.state === "unknown").length },
  };
}

/** The search in a few words, for the results heading and the page title. */
/** Whether a Where entry reads as a place the Ledger knows (a country, region or sea), given the list of known places. */
export function isPlace(where: string, places: string[]): boolean {
  const words = norm(where).split(" ").filter((w) => w && !STOP.has(w));
  return words.length > 0 && places.some((p) => { const hay = ` ${norm(p)}`; return words.every((w) => hay.includes(` ${w}`)); });
}
/**
 * The results heading. A place reads "Safari Camps and Lodges in Botswana"; a name or any other word reads
 * "Results for Dulini", never "Everything in Dulini". `place` defaults to true for callers without the place list.
 */
export function describe(q: AtlasQuery, place = true): string {
  const one = q.cat.length === 1 ? CATEGORY_LABEL[q.cat[0]] : q.cat.length ? `${q.cat.length} categories` : q.col.length === 1 ? COLLECTION_LABEL[q.col[0]] : null;
  const where = q.where.trim();
  if (!where) return `${one ?? "Everything"} anywhere`;
  if (place) return `${one ?? "Everything"} in ${where}`;
  return one ? `${one} matching ${where}` : `Results for ${where}`;
}
export function datesWords(q: AtlasQuery): string | null {
  if (q.from && q.to) return `${day(q.from)} to ${day(q.to)}`;
  if (q.months.length) return q.months.length > 2 ? `${monthName(q.months[0])} and ${q.months.length - 1} more` : q.months.map(monthName).join(", ");
  return null;
}
/** The dates in as few words as a narrow cell allows: "10 to 17 Jun 2027", "28 Jun to 3 Jul 2027", "Jun 2027 +2". */
export function datesShort(q: AtlasQuery): string | null {
  if (q.from && q.to) {
    const d = (iso: string) => Number(iso.slice(8, 10)), m = (iso: string) => SHORT[Number(iso.slice(5, 7)) - 1], y = (iso: string) => iso.slice(0, 4);
    if (q.from.slice(0, 7) === q.to.slice(0, 7)) return `${d(q.from)} to ${d(q.to)} ${m(q.to)} ${y(q.to)}`;
    return `${d(q.from)} ${m(q.from)}${y(q.from) === y(q.to) ? "" : ` ${y(q.from)}`} to ${d(q.to)} ${m(q.to)} ${y(q.to)}`;
  }
  if (q.months.length) { const f = q.months[0]; return `${SHORT[Number(f.slice(5, 7)) - 1]} ${f.slice(0, 4)}${q.months.length > 1 ? ` +${q.months.length - 1}` : ""}`; }
  return null;
}
export const partyWords = (q: AtlasQuery) => `${q.adults} ${q.adults === 1 ? "adult" : "adults"}${q.children.length ? `, ${q.children.length} ${q.children.length === 1 ? "child" : "children"}` : ""}`;
