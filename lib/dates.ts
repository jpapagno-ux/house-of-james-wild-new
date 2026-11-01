// The one date rule for the whole site (James, 1 Nov 2026): nothing past its
// date shows. Offers, ship departures and season bands, voyage sailings,
// House Sessions, rate-card years and What's Coming entries all pass through
// here, so there is one definition of "today" and one of "past".
//
// The site is built statically, so "today" is the build date in the house's
// time zone; the library sync workflow redeploys daily (docs/site-rules.md).
// No imports: the tests load this file directly with Node.

/** The house's time zone (James is in Florida). */
export const SITE_TZ = "America/New_York";

/** Today as YYYY-MM-DD in the site's time zone (or the zone given). */
export function today(now: Date = new Date(), timeZone: string = SITE_TZ): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const pad = (n: number) => String(n).padStart(2, "0");
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/**
 * The last day a date covers, as YYYY-MM-DD: "2027-03-14" → itself,
 * "2027-03" → "2027-03-31", "2027" → "2027-12-31", an ISO timestamp → its
 * day, and a display date such as "22 May 2027 · Bali to Komodo" → "2027-05-22".
 * null when the text holds no date.
 */
export function endOf(date: string | null | undefined): string | null {
  if (!date) return null;
  const s = date.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${pad(lastDay(Number(m[1]), Number(m[2])))}`;
  m = s.match(/^(\d{4})$/);
  if (m) return `${m[1]}-12-31`;
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.findIndex((x) => x.startsWith(m![2].toLowerCase().slice(0, 3)));
    if (mi >= 0) return `${m[3]}-${pad(mi + 1)}-${pad(Number(m[1]))}`;
  }
  m = s.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (m) {
    const mi = MONTHS.findIndex((x) => x.startsWith(m![1].toLowerCase().slice(0, 3)));
    if (mi >= 0) return `${m[2]}-${pad(mi + 1)}-${pad(lastDay(Number(m[2]), mi + 1))}`;
  }
  return null;
}

/** True once a date's last day is before `on` (today by default). Undated or unreadable is never past. */
export function isPast(end: string | null | undefined, on: string = today()): boolean {
  const e = endOf(end);
  return e !== null && e < on;
}

/** The items whose end has not passed. `getEnd` returns the item's last date (or null to keep it). */
export function activeOnly<T>(items: readonly T[], getEnd: (item: T) => string | null | undefined, on: string = today()): T[] {
  return items.filter((x) => !isPast(getEnd(x), on));
}

/** A departure or season band ends on `dateTo` when it has one, else on `date`: a band that has started but not ended stays. */
export const departureEnd = (d: { date: string; dateTo?: string | null }) => d.dateTo || d.date;

/** A ship record with only its remaining departures. */
export function withActiveDepartures<S extends { departures: { date: string; dateTo?: string | null }[] }>(ship: S, on: string = today()): S {
  return { ...ship, departures: activeOnly(ship.departures, departureEnd, on) };
}

type SailingGroup = { sailings: { date: string }[] };
/** Voyage sailing groups with past sailings removed, and groups left with none dropped. */
export function activeGroups<G extends SailingGroup>(groups: readonly G[], on: string = today()): G[] {
  return groups.map((g) => ({ ...g, sailings: activeOnly(g.sailings, (s) => s.date, on) })).filter((g) => g.sailings.length > 0);
}

/** The first remaining date among items (for "next sailing"), or null. */
export function nextDate<T>(items: readonly T[], getStart: (item: T) => string | null | undefined, on: string = today()): string | null {
  const starts = items.map((x) => endOf(getStart(x))).filter((d): d is string => !!d && d >= on).sort();
  return starts[0] ?? null;
}

/** The line shown wherever a ship or voyage has no remaining dated departures. */
export const NO_DATES = { title: "New dates to be announced", line: "The published dates have all sailed. Ask James for the next season's dates and fares." };
