import { isPast, today } from "../../dates.ts";

// Departures known only by month (James, 2 Nov 2026). Some operators (Antarctica21) show exact
// dates and fares by cabin only inside a live booking tool, so a voyage carries its sailings as
// month groups: the season, the month or months, how many sailings, and the "from" fare per ship,
// exactly as the operator's pages give them. When exact dates are filed they go in as ordinary
// dated departures (ShipDeparture) and the existing dates grid shows them; any month a dated
// sailing covers then drops out of the month list on its own (`withoutDated`).
//
// Pure module, no runtime imports beyond lib/dates.ts, so the tests load it with plain Node.

export type MonthDeparture = {
  /** "2027-28"; null when the operator names no season. */
  season: string | null;
  /** YYYY-MM keys, in order; empty when the month cannot be placed in a year. */
  months: string[];
  /** The operator's own words ("November, March"), for groups whose months have no year. */
  monthsText: string | null;
  /** Number of sailings, when published. */
  count: number | null;
  /** "From" fare per ship slug (or per "From"), per person, double cabin. */
  prices: Record<string, number>;
  /** A fare given only as a line of text (a season announcement), printed as given. */
  priceText: string | null;
  status: "sold-out" | "not-open" | null;
  direction?: string;
  nights?: number;
  /** On a ship page: the voyage this group belongs to, and its page. */
  itinerary?: string;
  href?: string;
};

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthWord = (key: string) => `${MON[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;

/** "February 2028"; "November 2026 and March 2027"; "March and April 2027". */
export function monthsLabel(g: Pick<MonthDeparture, "months" | "monthsText">): string | null {
  if (!g.months.length) return g.monthsText;
  const years = [...new Set(g.months.map((m) => m.slice(0, 4)))];
  const names = g.months.map((m) => MON[Number(m.slice(5, 7)) - 1]);
  if (years.length === 1) return `${names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0]} ${years[0]}`;
  const words = g.months.map(monthWord);
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** "2027-28" → "2027-28 season". */
export const seasonLabel = (s: string | null) => (s ? `${s} season` : "Season to be announced");

/** The last month a season-only group can still sail (the southern season ends by April). */
export function seasonEnd(season: string | null): string | null {
  const m = season?.match(/^(\d{4})-\d{2}$/);
  return m ? `${Number(m[1]) + 1}-04` : null;
}

/**
 * Month groups with past months removed (lib/dates.ts) and groups left with nothing dropped.
 * When a month drops out of a multi-month group, its sailing count no longer holds and is cleared.
 * A group with no placeable month stays until its season ends; with no season, it stays.
 */
export function activeMonths<T extends MonthDeparture>(groups: readonly T[], on: string = today()): T[] {
  const out: T[] = [];
  for (const g of groups) {
    if (!g.months.length) { if (!isPast(seasonEnd(g.season), on)) out.push(g); continue; }
    const months = g.months.filter((m) => !isPast(m, on));
    if (!months.length) continue;
    out.push(months.length === g.months.length ? g : { ...g, months, monthsText: null, count: null });
  }
  return out;
}

/** Month groups minus the months that dated sailings already cover (same itinerary when given). */
export function withoutDated<T extends MonthDeparture>(groups: readonly T[], dated: readonly { date: string; itinerary?: string }[]): T[] {
  if (!dated.length) return [...groups];
  return groups.flatMap((g) => {
    const covered = new Set(dated.filter((d) => !g.itinerary || !d.itinerary || d.itinerary === g.itinerary).map((d) => d.date.slice(0, 7)));
    if (!g.months.length) return covered.size ? [] : [g];
    const months = g.months.filter((m) => !covered.has(m));
    if (!months.length) return [];
    return [months.length === g.months.length ? g : { ...g, months, monthsText: null, count: null }];
  });
}

/** Lowest numeric "from" across groups that are still open to book. */
export function lowestFrom(groups: readonly MonthDeparture[], ship?: string): number | null {
  const all = groups.filter((g) => g.status !== "sold-out").flatMap((g) => Object.entries(g.prices).filter(([k]) => !ship || k === ship || k === "From").map(([, v]) => v));
  return all.length ? Math.min(...all) : null;
}
