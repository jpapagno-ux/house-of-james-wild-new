// Four Seasons I: builds her itineraries (day by day, with positions) and every published sailing
// (each suite's fare for the whole voyage, in US dollars, as published, and what is left) into
// lib/content/ships/caribbean/four-seasons-i.json from scripts/data/fsy/raw.json (fsy-fetch.mjs).
// The rest of her record (facts, suites, photographs, FAQs) is editorial and kept. Run from the repo root:
//   node scripts/partners/fsy-build.mjs && python3 scripts/build-ship-maps.py .
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "lib/content/ships/caribbean/four-seasons-i.json";
const rec = JSON.parse(readFileSync(PATH, "utf8"));
const raw = JSON.parse(readFileSync("scripts/data/fsy/raw.json", "utf8"));

// the brand's suite names on the booking system, to the names on her suites page (and in her record)
const SUITE = { "Seaview Suite": "Seaview Suite", "Seaview Suite w/Studio": "Seaview Suite with Studio", "Seaview Suite Midship": "Seaview Mid Suite", "Superior Seaview Suite": "Superior Seaview Suite", "Ocean Suite": "Ocean Suite", "Ocean Suite w/Studio": "Ocean Suite with Studio", "Grand Ocean Mid Suite": "Grand Ocean Mid Suite", "St Barths Suite": "Saint Barths Suite", "Milos Suite": "Milos Suite", "Saint-Tropez Suite": "Saint-Tropez Suite", "Málaga Suite": "Málaga Suite", "Portofino Suite": "Portofino Suite", "Loft Suite": "Loft Suite", "Funnel Suite": "Funnel Suite" };
const ORDER = rec.cabins.map((c) => c.type);
// ports the brand's pages leave without a position (approximate, the harbour itself)
const PIN = { "Kos": [36.893, 27.288], "Vela Luka": [42.963, 16.72], "Ostia": [41.733, 12.283], "Dubrovnik": [42.65, 18.09], "Milna": [43.327, 16.451], "Marina Day (Dalmatian Coast)": [43.25, 16.6], "Opatija": [45.337, 14.305], "Rab": [44.756, 14.76], "Rimini": [44.064, 12.574], "Fusina": [45.419, 12.256] };
const pinFor = (port) => { const k = Object.keys(PIN).find((x) => port.startsWith(x)); return k ? PIN[k] : null; };

const clean = (s) => String(s ?? "").replace(/&nbsp;/g, " ").replace(/[*\u200b\u200c\u200d\ufeff]/g, "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+-\s+/g, ", ").replace(/\s+/g, " ").trim();
const shortPort = (p) => clean(p).replace(/^Marina Day \((.+)\)$/, "Marina day, $1").replace(/^At Sea \((.+)\)$/, "At sea").replace(/^Cruising the Bahamas$/, "Sailing the Bahamas").replace(/,\s*Otok .+$/, "").replace(/\s*\((.+)\)$/, " ($1)");
const isSea = (d) => d.type === "At Sea" || /^At Sea|^Cruising /i.test(d.port);
const town = (d) => clean(d.port).replace(/^Marina Day \(.+\)$/, "").replace(/,\s*Otok .+$/, "").replace(/^Ostia \(Rome\).*/, "Ostia (Rome)").split(",")[0].trim().replace(/^\p{Ll}/u, (c) => c.toUpperCase());
const nightsOf = (s) => Math.round((Date.parse(s.to.slice(0, 10)) - Date.parse(s.from.slice(0, 10))) / 864e5);

// labels the house already filed for a sailing (Festive, Chef-in-Residence, back-to-back), kept by date
const oldLabel = new Map(rec.departures.map((d) => [d.date, (d.itinerary.match(/\(([^)]+)\)$/) || [])[1] ?? null]));
const oldNote = new Map(rec.departures.filter((d) => d.note).map((d) => [d.date, d.note]));

const daysOf = (s) => {
  const days = s.days.map((d) => {
    const p = d.lat != null ? [d.lat, d.lon] : isSea(d) ? null : pinFor(d.port);
    const time = d.note && !/^(Embark|Disembark|Sailing)$/i.test(d.note) ? d.note : null;
    return { day: d.day, title: shortPort(d.port), place: isSea(d) ? clean(d.title ?? d.port).replace(/^At Sea, /, "") : clean(d.title ?? d.port), lat: p ? +(+p[0]).toFixed(4) : null, lng: p ? +(+p[1]).toFixed(4) : null, summary: clean(d.excerpt ?? ""), ...(time ? { label: time } : {}) };
  });
  days.forEach((d, i) => { // a day at sea takes the midpoint of its neighbours
    if (d.lat != null) return;
    const a = days.slice(0, i).reverse().find((x) => x.lat != null), b = days.slice(i + 1).find((x) => x.lat != null);
    if (a && b) { d.lat = +((a.lat + b.lat) / 2).toFixed(3); d.lng = +((a.lng + b.lng) / 2).toFixed(3); } else if (a || b) { d.lat = (a ?? b).lat; d.lng = (a ?? b).lng; }
  });
  return days;
};

const sailings = raw.sailings.filter((s) => s.days.length).sort((a, b) => a.from.localeCompare(b.from));
const routes = new Map();
for (const s of sailings) {
  const ports = s.days.map((d) => d.code).join(">");
  const key = `${clean(s.title)}|${ports}`;
  if (!routes.has(key)) {
    const first = s.days[0], last = s.days[s.days.length - 1];
    const from = town(first), to = town(last);
    routes.set(key, { title: clean(s.title), nights: nightsOf(s), direction: from === to ? `${from} round trip` : `${from} to ${to}`, days: daysOf(s), first: s.from, n: 0 });
  }
  routes.get(key).n++;
  s.key = key;
}
// names and directions unique, so each route keeps its own chart file (route id = direction + nights)
const byName = new Map(), byDir = new Map();
for (const r of routes.values()) { byName.set(r.title, [...(byName.get(r.title) ?? []), r]); const k = `${r.direction}|${r.nights}`; byDir.set(k, [...(byDir.get(k) ?? []), r]); }
for (const list of byName.values()) if (list.length > 1 && new Set(list.map((r) => r.direction)).size > 1) for (const r of list) r.name = `${r.title}, ${r.direction}`;
for (const r of routes.values()) r.name ??= r.title;
const named = new Map();
for (const r of routes.values()) { const n = (named.get(r.name) ?? 0) + 1; named.set(r.name, n); if (n > 1) r.name += ` (${r.first.slice(0, 4)})`; }
for (const list of byDir.values()) if (list.length > 1) for (const r of list) { const tag = /featuring /i.test(r.title) ? r.title.replace(/^.*?featuring /i, "") : r.title.includes(":") ? r.title.split(":").slice(1).join(":").trim() : null; if (tag) r.direction = `${r.direction} (${tag})`; }
const seen = new Map();
for (const r of routes.values()) { const k = `${r.direction}|${r.nights}`; const n = (seen.get(k) ?? 0) + 1; seen.set(k, n); if (n > 1) r.direction = r.direction.endsWith(")") ? r.direction.replace(/\)$/, `, ${r.first.slice(0, 4)})`) : `${r.direction} (${r.first.slice(0, 4)})`; }

const itineraries = [...routes.values()].sort((a, b) => a.first.localeCompare(b.first)).map((r) => ({ name: r.name, nights: r.nights, direction: r.direction, days: r.days }));
const departures = sailings.map((s) => {
  const r = routes.get(s.key), date = s.from.slice(0, 10);
  const prices = {}, left = {};
  for (const c of s.suites) {
    const name = SUITE[clean(c.name)];
    if (!name || !(c.fare > 0)) continue;
    prices[name] = Math.round(c.fare);
    left[name] = c.status === "WTL" ? 0 : Math.max(0, c.available ?? 0);
  }
  const open = Object.values(left).reduce((a, b) => a + b, 0);
  const label = oldLabel.get(date);
  return { date, dateTo: s.to.slice(0, 10), itinerary: r.name, direction: r.direction, nights: nightsOf(s), status: s.waitlisted === "true" || open === 0 ? "full" : open <= 3 ? "few left" : "open", prices: Object.fromEntries(ORDER.filter((k) => k in prices).map((k) => [k, prices[k]])), cabinsLeft: Object.fromEntries(ORDER.filter((k) => k in left).map((k) => [k, left[k]])), ...(Object.keys(prices).length === 0 ? { note: "Waitlist only" } : oldNote.get(date) || label ? { note: oldNote.get(date) ?? label } : {}), voyage: s.id };
});

const unmapped = [...new Set(raw.sailings.flatMap((s) => s.suites.map((c) => clean(c.name))))].filter((n) => !SUITE[n]);
if (unmapped.length) throw new Error(`suites without a name on her suites page: ${unmapped.join(", ")}`);
const read = new Date(raw.fetched + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
Object.assign(rec, {
  itineraries, departures,
  routesNote: `Every voyage day by day, as Four Seasons Yachts publishes it, read on ${read}. Courses and positions are approximate.`,
  pricesNote: `Four Seasons Yachts prices each voyage per suite, for the whole voyage, in US dollars. Each sailing shows every suite's published fare, read on ${read}, with what is left; James confirms the fare for your suite and dates.`,
});
writeFileSync(PATH, JSON.stringify(rec, null, 2) + "\n");
console.log(itineraries.length, "itineraries,", departures.length, "sailings,", departures.at(-1).date);
