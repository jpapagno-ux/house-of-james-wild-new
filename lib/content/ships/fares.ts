import { cabinColour, cruiseOnly, dayLabel, isPackage, monthLabel, rateBasisOf, undash, type ShipDeparture, type ShipRecord } from "./types";

// Dates and rates, reshaped for reading (James, 2 Nov 2026): fares once per season or rate
// window ("2027 fares: Deluxe Stateroom US$11,500 · Premium Suite US$23,000"), broken out by
// date only where prices really differ, and the sailings as a compact date grid by month.
// Season bands (A&K: one fare for any sailing that starts in the band) are rate windows with
// no dates of their own. Built from departures already filtered by lib/dates.ts.

export type FareWindow = { key: string; label: string; sub?: string; prices: [string, number][]; count: number; plan: string; from: string; to: string };
export type Sailing = { id: string; date: string; dateTo: string | null; day: string; month: string; when: string; route: string; routeLabel: string; nights: number | null; status: "Open" | "Few left" | "Full" | null; prices: [string, number][]; plan: string };
export type DatesData = { windows: FareWindow[]; sailings: Sailing[]; routes: { name: string; label: string; colour: string }[]; cabins: { type: string; colour: string }[]; bands: boolean };

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const days = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86400000;
const priced = (d: ShipDeparture) => Object.entries(d.prices).filter((e): e is [string, number] => typeof e[1] === "number" && e[1] > 0);
/** A sailing has its own dates; a band is a season that one fare covers (over two weeks long). */
const isSailing = (d: ShipDeparture) => !d.dateTo || days(d.date, d.dateTo) <= 15;

function status(d: ShipDeparture): Sailing["status"] {
  const left = d.cabinsLeft ? Object.values(d.cabinsLeft).reduce((a, b) => a + (b || 0), 0) : null;
  const s = d.status ?? "";
  if (/full|sold/i.test(s) || left === 0) return "Full";
  if (/few|left|limited/i.test(s) || (left != null && left <= 3)) return "Few left";
  if (/open|available/i.test(s) || left != null) return "Open";
  return null;
}

const routeShort = (s: ShipRecord, name: string) => {
  const it = s.itineraries.find((i) => i.name === name);
  const m = name.match(/^Itinerary ([A-Z])\b/);
  if (m) return `Route ${m[1]}`;
  return undash(it ? it.direction.split(" (")[0].split(", ")[0] : name);
};

export function datesData(s: ShipRecord, plan: (what: string, date: string, full: boolean) => string): DatesData {
  const deps = cruiseOnly(s).filter((d) => !isPackage(d));
  const perNight = rateBasisOf(s) === "per-night";
  const routeNames = [...new Set(deps.map((d) => d.itinerary))];
  const routes = routeNames.map((n) => ({ name: n, label: perNight ? undash(n) : routeShort(s, n), colour: cabinColour(routeNames, n) }));
  const cabinTypes = [...new Set(deps.flatMap((d) => priced(d).map(([k]) => k)))];
  const cabins = cabinTypes.map((t) => ({ type: t, colour: cabinColour(s.cabins.map((c) => c.type), t) }));
  const bands = deps.length > 0 && !deps.some(isSailing);

  // Rate windows: departures with the same fares (per-night ships: the same length, since the fare follows the nights).
  const groups = new Map<string, ShipDeparture[]>();
  for (const d of deps) {
    const k = perNight ? `${d.nights ?? ""}n` : isSailing(d) ? JSON.stringify(priced(d).sort()) : `${d.date}|${d.dateTo}|${d.itinerary}`;
    groups.set(k, [...(groups.get(k) ?? []), d]);
  }
  const yearsOf = (ds: ShipDeparture[]) => [...new Set(ds.map((d) => d.date.slice(0, 4)))];
  const all = [...groups.entries()];
  const windows: FareWindow[] = all.map(([key, ds]) => {
    const sorted = [...ds].sort((a, b) => a.date.localeCompare(b.date));
    const from = sorted[0].date, to = sorted[sorted.length - 1].dateTo ?? sorted[sorted.length - 1].date;
    const yrs = yearsOf(ds);
    const shared = all.some(([k2, d2]) => k2 !== key && yearsOf(d2).some((y) => yrs.includes(y)));
    const rts = [...new Set(ds.map((d) => d.itinerary))];
    const routeNote = routes.length > 1 && rts.length < routes.length ? rts.map((r) => routes.find((x) => x.name === r)!.label).join(", ") : null;
    let label: string;
    if (perNight) label = `${ds[0].nights} nights`;
    else if (!isSailing(ds[0])) label = ds[0].season ? undash(ds[0].season) : `${dayLabel(from)} to ${dayLabel(to)}`;
    else if (!shared) label = `${yrs.join(" and ")} fares`;
    else if (ds.length <= 3) label = `${sorted.map((d) => dayLabel(d.date)).join(", ")} sailing${ds.length > 1 ? "s" : ""}`;
    else { const a = from.slice(0, 7), b = (sorted[sorted.length - 1].date).slice(0, 7); label = a.slice(0, 4) === b.slice(0, 4) ? `${MON[+a.slice(5) - 1]} to ${MON[+b.slice(5) - 1]} ${a.slice(0, 4)}` : `${MON[+a.slice(5) - 1]} ${a.slice(0, 4)} to ${MON[+b.slice(5) - 1]} ${b.slice(0, 4)}`; }
    const sub = [routeNote, !isSailing(ds[0]) ? `${dayLabel(from)} to ${dayLabel(to)}, one fare for any sailing that starts in it` : `${ds.length} sailing${ds.length > 1 ? "s" : ""}`].filter(Boolean).join(" · ");
    const lowest = Math.min(...ds.flatMap((d) => priced(d).map(([, p]) => p)));
    const prices = perNight ? ([["From", lowest]] as [string, number][]) : priced(ds[0]).sort((a, b) => a[1] - b[1]);
    return { key, label, sub, prices, count: ds.length, plan: plan(`${label}, ${s.name}`, `${from} to ${to}`, false), from, to };
  }).sort((a, b) => a.from.localeCompare(b.from) || a.prices[0][1] - b.prices[0][1]);

  const sailings: Sailing[] = bands ? [] : deps.filter(isSailing).sort((a, b) => a.date.localeCompare(b.date)).map((d, i) => {
    const st = status(d);
    return {
      id: `${d.date}-${i}`, date: d.date, dateTo: d.dateTo ?? null, day: String(Number(d.date.slice(8, 10))), month: monthLabel(d.date),
      when: d.dateTo ? `${dayLabel(d.date)} to ${dayLabel(d.dateTo)}` : dayLabel(d.date), route: d.itinerary, routeLabel: routes.find((r) => r.name === d.itinerary)?.label ?? d.itinerary,
      nights: d.nights ?? s.itineraries.find((x) => x.name === d.itinerary)?.nights ?? null, status: st, prices: priced(d),
      plan: plan(`${undash(d.itinerary)}, ${s.name}`, d.dateTo ? `${d.date} to ${d.dateTo}` : d.date, st === "Full"),
    };
  });
  return { windows, sailings, routes, cabins, bands };
}
