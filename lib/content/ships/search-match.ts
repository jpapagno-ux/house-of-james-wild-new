import { endOf, isPast, today } from "../../dates.ts";
import type { Activity, ShipTraits, SingleSupplement } from "./registry.ts";

// "Find your voyage" (James, 2 Nov 2026): the matching rules behind the search on /voyages, kept
// pure so the page, the tests and any later site (Polar Crossings) read one definition. Every
// answer is a filed ship and every filter reads a published fact: a ship whose operator does not
// publish a fact never matches a filter on it (the results say how many were left out and why).
//
// No runtime imports beyond lib/dates.ts, so the tests load it with plain Node.

export type SearchWhere = "nile" | "amazon" | "mekong" | "galapagos" | "indonesia" | "seychelles" | "polar" | "tahiti" | "caribbean" | "bahamas" | "mediterranean";
export type Who = "couple" | "family" | "solo" | "group";
export type LengthKey = "short" | "week" | "long";

export const WHERE: Record<SearchWhere, string> = { nile: "Nile", amazon: "Amazon", mekong: "Mekong", galapagos: "Galápagos", indonesia: "Indonesia", seychelles: "Seychelles", polar: "Polar", tahiti: "Tahiti", caribbean: "Caribbean", bahamas: "Bahamas", mediterranean: "Mediterranean" };
export const WHO: Record<Who, string> = { couple: "Couple", family: "Family", solo: "Solo", group: "Group" };
export const LENGTHS: Record<LengthKey, { label: string; min: number; max: number }> = {
  short: { label: "Up to 4 nights", min: 1, max: 4 },
  week: { label: "5 to 7 nights", min: 5, max: 7 },
  long: { label: "8 nights or more", min: 8, max: 999 },
};
/** Budget ceilings, per person, on the lowest published fare ("from"). */
export const BUDGETS = [5000, 10000, 20000] as const;

export type SearchItem = {
  slug: string; name: string; href: string; eyebrow: string; operator: string | null;
  image: { url: string; alt: string } | null;
  price: { label: string; amount: string } | null;
  /** Lowest published per-person fare, two sharing; null when none is published. */
  low: number | null;
  where: SearchWhere[];
  /** YYYY-MM months with a real, bookable departure, past ones already dropped. */
  months: string[];
  /** Voyage lengths she sails, in nights. */
  nights: number[];
  traits: ShipTraits;
  /** Her record names couples or honeymooners among the travellers she suits. */
  couples: boolean;
  /** The whole ship can be chartered by one party. */
  charter: boolean;
  ports: string[];
  routes: { name: string; href: string }[];
  page: boolean;
};

export type SearchState = { where: SearchWhere | null; when: string | null; who: Who | null; ages: number[]; what: Activity[]; len: LengthKey | null; budget: number | null; q: string };
export const EMPTY: SearchState = { where: null, when: null, who: null, ages: [], what: [], len: null, budget: null, q: "" };

const pad = (n: number) => String(n).padStart(2, "0");
const ym = (iso: string) => iso.slice(0, 7);
const nextMonth = (k: string) => { const y = Number(k.slice(0, 4)), m = Number(k.slice(5, 7)); return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`; };

/**
 * Months with a real departure: a dated sailing gives its month; a season band (A&K's rate periods,
 * "any sailing that starts in the period") gives every month it spans. Sold-out or full sailings and
 * anything already past (lib/dates.ts) give none; a band under way counts from this month.
 */
export function departureMonths(deps: readonly { date: string; dateTo?: string | null; status?: string | null }[], on: string = today()): string[] {
  const out = new Set<string>();
  const now = ym(on);
  for (const d of deps) {
    if (/full|sold/i.test(d.status ?? "")) continue;
    const end = d.dateTo || d.date;
    if (isPast(end, on)) continue;
    let k = ym(d.date) < now ? now : ym(d.date);
    const last = ym(endOf(end) ?? end);
    for (let i = 0; k <= last && i < 60; i++, k = nextMonth(k)) out.add(k);
  }
  return [...out].sort();
}

/** Months from month groups (operators that publish months only), skipping sold-out groups and past months. */
export function groupMonths(groups: readonly { months: string[]; status: string | null }[], on: string = today()): string[] {
  return [...new Set(groups.filter((g) => g.status !== "sold-out").flatMap((g) => g.months.filter((m) => !isPast(m, on))))].sort();
}

/** The single supplement in a few words, for result rows and the solo table. */
export function singleLabel(s: SingleSupplement | undefined): string | null {
  if (!s) return null;
  if (s.kind === "none") return "No supplement in a solo cabin";
  if (s.kind === "applies") return "Supplement applies, on request";
  return s.max && s.max !== s.pct ? `${s.pct}% to ${s.max}%` : `${s.pct}%`;
}
/** Sort weight for solo travellers: no supplement first, then the lowest percentage. */
export const singleWeight = (s: SingleSupplement | undefined) => (!s ? 999 : s.kind === "none" ? -1 : s.kind === "applies" ? 500 : s.pct);

export const childLabel = (t: ShipTraits) => (t.minChildAge === undefined ? null : t.minChildAge === 0 ? "Children of all ages" : `Children ${t.minChildAge} and over`);

/** Does a ship meet every filter set? Unpublished facts never match a filter on them. */
export function matches(x: SearchItem, s: SearchState): boolean {
  if (s.where && !x.where.includes(s.where)) return false;
  if (s.when && !x.months.includes(s.when)) return false;
  if (s.len) { const L = LENGTHS[s.len]; if (!x.nights.some((n) => n >= L.min && n <= L.max)) return false; }
  if (s.budget !== null && (x.low === null || x.low > s.budget)) return false;
  for (const a of s.what) if (!(x.traits.activities ?? []).includes(a)) return false;
  if (s.who === "couple" && !x.couples) return false;
  if (s.who === "group" && !x.charter) return false;
  if (s.who === "solo" && !(x.traits.single && x.traits.single.kind !== "applies")) return false;
  if (s.who === "family") {
    const min = x.traits.minChildAge;
    if (min === undefined) return false;
    if (s.ages.length && min > Math.min(...s.ages)) return false;
  }
  if (s.q.trim()) {
    const q = s.q.trim().toLowerCase();
    const hay = [x.name, x.operator ?? "", x.eyebrow, ...x.ports, ...x.routes.map((r) => r.name)].join(" | ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/** Matching ships, in registry order; solo travellers see the lowest supplement first. */
export function search(items: readonly SearchItem[], s: SearchState): SearchItem[] {
  const hits = items.filter((x) => matches(x, s));
  return s.who === "solo" ? [...hits].sort((a, b) => singleWeight(a.traits.single) - singleWeight(b.traits.single)) : hits;
}

/** The published facts behind a match, one short line each, for the result row. */
export function reasons(x: SearchItem, s: SearchState): string[] {
  const out: string[] = [];
  if (s.who === "family") { const c = childLabel(x.traits); if (c) out.push(c); if (x.traits.connecting) out.push("Connecting cabins"); if (x.traits.kidsProgramme) out.push("Kids' programme"); }
  if (s.who === "solo") { const l = singleLabel(x.traits.single); if (l) out.push(x.traits.single?.kind === "percent" ? `Single supplement ${l}` : l); }
  if (s.who === "group") out.push("Whole-ship charter");
  if (s.len) out.push(x.nights.filter((n) => n >= LENGTHS[s.len!].min && n <= LENGTHS[s.len!].max).sort((a, b) => a - b).map((n) => `${n}`).join(", ") + " nights");
  if (s.when) out.push(`Sails ${monthName(s.when)}`);
  return out;
}

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthName = (k: string) => `${MON[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;

/** Why a filter left ships out: the published fact they lack. */
export function leftOut(items: readonly SearchItem[], s: SearchState): string | null {
  if (s.who === "family") { const n = items.filter((x) => x.traits.minChildAge === undefined && matches(x, { ...s, who: null, ages: [] })).length; if (n) return `${n} more ${n === 1 ? "ship does" : "ships do"} not publish a minimum age for children; ask James.`; }
  if (s.who === "solo") { const n = items.filter((x) => !(x.traits.single && x.traits.single.kind !== "applies") && matches(x, { ...s, who: null })).length; if (n) return `${n} more ${n === 1 ? "ship does" : "ships do"} not publish a single supplement; ask James.`; }
  if (s.budget !== null) { const n = items.filter((x) => x.low === null && matches(x, { ...s, budget: null })).length; if (n) return `${n} more ${n === 1 ? "ship has" : "ships have"} no published fare to compare; ask James.`; }
  return null;
}

/** Filtered URLs (?where=…): never indexed (middleware.ts). */
export const SEARCH_PARAMS = ["where", "when", "who", "ages", "what", "len", "budget", "q"] as const;

export function toQuery(s: SearchState): string {
  const p = new URLSearchParams();
  if (s.where) p.set("where", s.where);
  if (s.when) p.set("when", s.when);
  if (s.who) p.set("who", s.who);
  if (s.who === "family" && s.ages.length) p.set("ages", s.ages.join(","));
  if (s.what.length) p.set("what", s.what.join(","));
  if (s.len) p.set("len", s.len);
  if (s.budget !== null) p.set("budget", String(s.budget));
  if (s.q.trim()) p.set("q", s.q.trim());
  return p.toString();
}

const ACT = new Set(["wildlife", "diving", "snorkelling", "kayaking", "hiking", "culture", "slow", "sailing"]);
export function fromQuery(p: URLSearchParams): SearchState {
  const where = p.get("where"), who = p.get("who"), len = p.get("len"), when = p.get("when"), budget = Number(p.get("budget"));
  return {
    where: where && where in WHERE ? (where as SearchWhere) : null,
    when: when && /^\d{4}-\d{2}$/.test(when) ? when : null,
    who: who && who in WHO ? (who as Who) : null,
    ages: (p.get("ages") ?? "").split(",").filter(Boolean).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < 18).slice(0, 8),
    what: (p.get("what") ?? "").split(",").filter((a): a is Activity => ACT.has(a)),
    len: len && len in LENGTHS ? (len as LengthKey) : null,
    budget: (BUDGETS as readonly number[]).includes(budget) ? budget : null,
    q: (p.get("q") ?? "").slice(0, 60),
  };
}

export type PageLink = { label: string; href: string };
/** Real pages a filter combination lands on: the waters hub, the category page, the type hub. */
export function pageLinks(s: SearchState, pages: { where: Partial<Record<SearchWhere, PageLink>>; who: Partial<Record<Who, PageLink>>; what: Partial<Record<Activity, PageLink>> }): PageLink[] {
  const out: PageLink[] = [];
  if (s.who && pages.who[s.who]) out.push(pages.who[s.who]!);
  if (s.where && pages.where[s.where]) out.push(pages.where[s.where]!);
  for (const a of s.what) if (pages.what[a]) out.push(pages.what[a]!);
  return out.filter((l, i) => out.findIndex((x) => x.href === l.href) === i).slice(0, 3);
}

export type Suggestion = { label: string; kind: "Ship" | "Route" | "Port" | "Operator"; href?: string; detail?: string };
/** Typeahead over ships, routes, ports and operators. Ships and routes open their page; ports and operators filter. */
export function suggest(items: readonly SearchItem[], q: string, max = 8): Suggestion[] {
  const t = q.trim().toLowerCase();
  if (t.length < 2) return [];
  const all: Suggestion[] = [];
  const seen = new Set<string>();
  const add = (x: Suggestion) => { const k = `${x.kind}|${x.label}`; if (!seen.has(k)) { seen.add(k); all.push(x); } };
  for (const x of items) add({ label: x.name, kind: "Ship", href: x.href, detail: x.eyebrow });
  for (const x of items) for (const r of x.routes) add({ label: r.name, kind: "Route", href: r.href, detail: x.name });
  for (const x of items) for (const p of x.ports) add({ label: p, kind: "Port" });
  for (const x of items) if (x.operator) add({ label: x.operator, kind: "Operator" });
  const score = (s: Suggestion) => { const l = s.label.toLowerCase(); return l.startsWith(t) ? 0 : l.split(/[\s(,]+/).some((w) => w.startsWith(t)) ? 1 : l.includes(t) ? 2 : 9; };
  return all.map((s) => [score(s), s] as const).filter(([n]) => n < 9).sort((a, b) => a[0] - b[0]).slice(0, max).map(([, s]) => s);
}
