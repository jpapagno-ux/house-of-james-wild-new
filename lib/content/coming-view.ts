// What's Coming, the view (James, 2 Nov 2026): "robust search by country and a sort by year and date
// feature and timed for most recent to oldest". Pure helpers for the /whats-coming explorer, the
// tickers on destination and stay pages, and their tests. Kept import-free so plain Node can load it.

export type ViewStatus = "opening" | "rebuilding";
export type ViewItem = {
  slug: string; name: string; ledgerId: string | null;
  country: string | null; countrySlug: string | null; regionSlug: string | null;
  status: string; date: string | null;
};
export type Sort = "soonest" | "latest" | "filed";
export type Group = "year" | "region";
export type ViewState = { q: string; region: string | null; country: string | null; year: string | null; status: ViewStatus | null; sort: Sort; group: Group };

export const DEFAULT_STATE: ViewState = { q: "", region: null, country: null, year: null, status: null, sort: "soonest", group: "year" };
export const SORTS: { key: Sort; label: string }[] = [
  { key: "soonest", label: "Opening soonest" },
  { key: "latest", label: "Latest first" },
  { key: "filed", label: "Recently filed" },
];
/** The year chip for an undated entry. */
export const TBC = "tbc";
export const STATUS_CHIPS: { key: ViewStatus; label: string }[] = [
  { key: "opening", label: "Opening" },
  { key: "rebuilding", label: "Being reimagined" },
];

/** Opening and announced read as openings; rebuilding and reopened as returns. */
export const viewStatus = (s: string): ViewStatus => (s === "rebuilding" || s === "reopened" ? "rebuilding" : "opening");

const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const pad = (n: number) => String(n).padStart(2, "0");
/** The last day a coming date covers ("2027-08" is 31 August), or null when undated. Same rule as lib/dates.ts endOf. */
export function endKey(date: string | null): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-");
  if (!/^\d{4}$/.test(y ?? "")) return null;
  if (!m) return `${y}-12-31`;
  if (!d) return `${y}-${m}-${pad(lastDay(Number(y), Number(m)))}`;
  return `${y}-${m}-${d.slice(0, 2)}`;
}
export const yearOf = (date: string | null): string | null => (date && /^\d{4}/.test(date) ? date.slice(0, 4) : null);
export const yearKey = (c: ViewItem): string => yearOf(c.date) ?? TBC;
export const yearLabel = (key: string): string => (key === TBC ? "Date to come" : key);

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function filterComing<T extends ViewItem>(items: readonly T[], s: Partial<Pick<ViewState, "region">> & Pick<ViewState, "q" | "country" | "year" | "status">): T[] {
  const words = fold(s.q.trim()).split(/\s+/).filter(Boolean);
  return items.filter((c) => {
    if (s.region && c.regionSlug !== s.region) return false;
    if (s.country && c.countrySlug !== s.country) return false;
    if (s.year && yearKey(c) !== s.year) return false;
    if (s.status && viewStatus(c.status) !== s.status) return false;
    if (!words.length) return true;
    const hay = fold(`${c.name} ${c.country ?? ""}`);
    return words.every((w) => hay.includes(w));
  });
}

/**
 * soonest: the nearest date first (a month or a year counts to its last day), undated last.
 * latest:  "most recent to oldest" read as the furthest date first, undated last.
 * filed:   the newest Ledger ID first (the library has no filed-on date yet; the ID is the proxy).
 */
export function sortComing<T extends ViewItem>(items: readonly T[], sort: Sort): T[] {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name);
  return [...items].sort((a, b) => {
    if (sort === "filed") return (b.ledgerId ?? "").localeCompare(a.ledgerId ?? "") || byName(a, b);
    const ea = endKey(a.date), eb = endKey(b.date);
    if (ea === eb) return byName(a, b);
    if (!ea) return 1;
    if (!eb) return -1;
    return sort === "latest" ? eb.localeCompare(ea) : ea.localeCompare(eb);
  });
}

/** Year groups in the order the sort gives them; one flat group for "Recently filed". */
export function groupByYear<T extends ViewItem>(items: readonly T[], sort: Sort): { key: string; label: string; items: T[] }[] {
  if (sort === "filed") return items.length ? [{ key: "all", label: "Recently filed", items: [...items] }] : [];
  const out: { key: string; label: string; items: T[] }[] = [];
  for (const c of items) {
    const k = yearKey(c);
    const g = out.find((x) => x.key === k);
    if (g) g.items.push(c); else out.push({ key: k, label: yearLabel(k), items: [c] });
  }
  return out;
}

/**
 * Region groups (PR #201, James 2 Nov 2026: "the page scales by region"): one group per region in the
 * order the house lists regions, entries inside each in the order the sort gave them.
 */
export function groupByRegionView<T extends ViewItem>(items: readonly T[], regions: readonly { slug: string; name: string }[]): { key: string; label: string; items: T[] }[] {
  const order = new Map(regions.map((r, i) => [r.slug, i]));
  const out: { key: string; label: string; items: T[] }[] = [];
  for (const c of items) {
    const k = c.regionSlug ?? "elsewhere";
    const g = out.find((x) => x.key === k);
    if (g) g.items.push(c); else out.push({ key: k, label: regions.find((r) => r.slug === k)?.name ?? "Elsewhere", items: [c] });
  }
  return out.sort((a, b) => (order.get(a.key) ?? 99) - (order.get(b.key) ?? 99));
}
/** Region chips with counts, in the house's region order. */
export function regionCounts(items: readonly ViewItem[], regions: readonly { slug: string; name: string }[]): { slug: string; name: string; count: number }[] {
  return groupByRegionView(items, regions).map((g) => ({ slug: g.key, name: g.label, count: g.items.length }));
}

/** Whole days from `today` to an exact date (YYYY-MM-DD); null for a month, a year or no date. */
export function daysTo(date: string | null, today: string): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 86400000) : null;
}
export function countdown(date: string | null, today: string): string | null {
  const n = daysTo(date, today);
  if (n === null || n < 0) return null;
  if (n === 0) return "Opens today";
  if (n === 1) return "1 day to go";
  return `${n} days to go`;
}

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** The departures-board date: "11 DEC 2026", "AUG 2027", "2026", or null. */
export function boardDate(date: string | null): string | null {
  if (!date) return null;
  const [y, m, d] = date.split("-");
  if (!m) return y;
  const mon = MON[Number(m) - 1] ?? "";
  return d ? `${Number(d)} ${mon} ${y}` : `${mon} ${y}`;
}
/** The board's status column: "OPENS 11 DEC 2026", "REOPENS AUG 2027", "BEING REIMAGINED". */
export function boardStatus(c: Pick<ViewItem, "status" | "date">): string {
  const when = boardDate(c.date);
  if (viewStatus(c.status) === "rebuilding") return when ? `REOPENS ${when}` : "BEING REIMAGINED";
  return when ? `OPENS ${when}` : "OPENING SOON";
}

/** "5 openings and returns, 2026 to 2027" from the entries themselves. */
export function countLine(items: readonly ViewItem[]): string {
  const opens = items.filter((c) => viewStatus(c.status) === "opening").length;
  const returns = items.length - opens;
  const noun = opens && returns ? (items.length === 1 ? "opening or return" : "openings and returns") : opens ? (opens === 1 ? "opening" : "openings") : returns === 1 ? "return" : "returns";
  const years = [...new Set(items.map((c) => yearOf(c.date)).filter((y): y is string => !!y))].sort();
  const span = years.length === 0 ? "" : years.length === 1 ? `, ${years[0]}` : `, ${years[0]} to ${years[years.length - 1]}`;
  return `${items.length} ${noun}${span}`;
}

/** Country chips with counts, in name order. */
export function countryCounts(items: readonly ViewItem[]): { slug: string; name: string; count: number }[] {
  const m = new Map<string, { slug: string; name: string; count: number }>();
  for (const c of items) if (c.countrySlug) { const x = m.get(c.countrySlug) ?? { slug: c.countrySlug, name: c.country ?? c.countrySlug, count: 0 }; x.count++; m.set(c.countrySlug, x); }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
}
export function yearCounts(items: readonly ViewItem[]): { key: string; label: string; count: number }[] {
  const m = new Map<string, number>();
  for (const c of items) m.set(yearKey(c), (m.get(yearKey(c)) ?? 0) + 1);
  return [...m.entries()].sort(([a], [b]) => (a === TBC ? 1 : b === TBC ? -1 : a.localeCompare(b))).map(([key, count]) => ({ key, label: yearLabel(key), count }));
}

const SORT_KEYS = new Set<Sort>(["soonest", "latest", "filed"]);
/** ?q=&region=&country=&year=&status=&sort=&group= into a view state; unknown values fall back to the default. */
export function parseQuery(search: string): ViewState {
  const p = new URLSearchParams(search);
  const sort = p.get("sort") as Sort | null;
  const status = p.get("status");
  return {
    q: (p.get("q") ?? "").slice(0, 80),
    region: p.get("region") || null,
    country: p.get("country") || null,
    year: p.get("year") || null,
    status: status === "opening" || status === "rebuilding" ? status : null,
    sort: sort && SORT_KEYS.has(sort) ? sort : "soonest",
    group: p.get("group") === "region" ? "region" : "year",
  };
}
/** The query string for a state, default values left out ("" for the default view). */
export function toQuery(s: ViewState): string {
  const p = new URLSearchParams();
  if (s.q.trim()) p.set("q", s.q.trim());
  if (s.region) p.set("region", s.region);
  if (s.country) p.set("country", s.country);
  if (s.year) p.set("year", s.year);
  if (s.status) p.set("status", s.status);
  if (s.sort !== "soonest") p.set("sort", s.sort);
  if (s.group !== "year") p.set("group", s.group);
  const q = p.toString();
  return q ? `?${q}` : "";
}

// ── The board: openings and live offers (James, 2 Nov 2026: "add updated specials and savings for the ticker") ──

/** One entry on a departures board. Openings carry a sun mark; offers a % tag. */
export type BoardEntry = {
  key: string;
  /** opening: What's Coming · offer: a live public offer · new: new to the Ledger · sailing: a voyage's next departure. */
  kind: "opening" | "offer" | "new" | "sailing";
  /** Its volume (lib/volumes.ts): a small tab in the volume's colour. */
  volume?: import("@/lib/volumes").VolumeKey | null;
  /** Set on a region top-up for a country board: "Also in Asia". */
  also?: string;
  place: string | null; // country, set small
  name: string; // property
  flap: string; // OPENS 11 DEC 2026 · STAY 4 NIGHTS, SAVE 10%
  tail?: string; // BOOK BY 31 MAR 2027
  href: string;
};

// Trade terms never reach a public board (house rule: no commission or net rates on the site).
const TRADE = /commission|\bnet\b|net rate|agent rate|trade rate/i;
export const offerIsPublic = (o: { headline: string; name: string; conditions?: string }) => !TRADE.test(o.headline) && !TRADE.test(o.name);

/** 2027-03-31 -> 31 MAR 2027 (the board's own date style). */
export function boardDay(iso: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  return m ? `${Number(m[3])} ${MON[Number(m[2]) - 1]} ${m[1]}` : null;
}

/** The offer's line on the board: the headline as filed, and the last day it can be used. */
export function offerBoardLines(o: { headline: string; program: string; bookingWindow?: boolean; departure?: string }, lastDay: string | null): { flap: string; tail?: string } {
  const flap = o.headline.replace(/\s+/g, " ").trim().toUpperCase();
  const day = boardDay(lastDay);
  if (!day) return { flap };
  if (o.program === "Final Call" && o.departure && o.departure === lastDay) return { flap, tail: `DEPARTS ${day}` };
  return { flap, tail: `${o.bookingWindow ? "BOOK BY" : "TRAVEL BY"} ${day}` };
}

/** Openings first in their order, the offers dealt in between them as evenly as they go. */
export function mixBoard(openings: readonly BoardEntry[], offers: readonly BoardEntry[]): BoardEntry[] {
  if (!openings.length) return [...offers];
  if (!offers.length) return [...openings];
  const per = Math.ceil(offers.length / openings.length);
  const out: BoardEntry[] = [];
  openings.forEach((o, i) => { out.push(o, ...offers.slice(i * per, (i + 1) * per)); });
  return out;
}
