// Aqua Expeditions: builds each ship's file (lib/content/ships/<waters>/<slug>.json) from Aqua's own
// data (scripts/data/aqua/raw.json, written by aqua-fetch.mjs) and the editorial in aqua-ships.mjs.
// Every itinerary Aqua sells, its day by day, and every published departure with each suite category's
// fare, per person in US dollars, as Aqua's booking system lists it. Aria Amazon keeps her filed copy;
// only her routes, departures and film are refreshed. Run from the repo root:
//   node scripts/partners/aqua-build.mjs
// It also writes scripts/data/aqua/photos.json, the photographs for the Cloudinary upload
// (aqua-photos.mjs). Facts and photographs are Aqua's (partner agreement, James).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { pin } from "./aqua-places.mjs";
import { SHIPS, CLD } from "./aqua-ships.mjs";

const raw = JSON.parse(readFileSync("scripts/data/aqua/raw.json", "utf8"));
const PORTS = { PHNOM: "Phnom Penh", SIEMREAP: "Siem Reap", MYTHO: "Ho Chi Minh City", NAUTA: "Nauta", IQT: "Iquitos", AYO: "Santa Cruz (Puerto Ayora)", BALTRA: "Baltra", "RAJ-SOR": "Sorong", "KOM-LAB": "Labuan Bajo", "BALI-DEN": "Bali", "SPI-AMB": "Ambon", MAHE: "Mahé", ZANZI: "Zanzibar", LONG: "Longyearbyen", TROM: "Tromsø", GLAS: "Glasgow" };
const clean = (s) => String(s ?? "").replace(/[​*]/g, "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+-\s+/g, ", ").replace(/\s+/g, " ").replace(/\s+,/g, ",").trim();
const SMALL = new Set(["and", "of", "the", "to", "at", "in", "on", "de", "la", "del", "&"]);
const title = (s) => clean(s).toLowerCase().split(" ").map((w, i) => (i && SMALL.has(w) ? w : w.replace(/(^|[(/'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()))).join(" ").replace(/\s*\/\s*/g, ", ").replace(/ ,/g, ",");
const sentence = (s, n = 170) => {
  const t = clean(s).replace(/\s*\(\s*\)/g, "");
  const parts = t.split(/(?<=[.!?])\s+/);
  let out = parts[0];
  if (out.length < 70 && parts[1] && (out + " " + parts[1]).length <= n) out += " " + parts[1];
  if (out.length > n) out = out.slice(0, n).replace(/[,;:]?\s+\S*$/, "") + ".";
  return out.replace(/\.\.$/, ".");
};
const season = (name) => (/HIGH WATER/i.test(name) ? "High water" : /Dec-Feb/i.test(name) ? "Low water, December to February" : /LOW WATER/i.test(name) ? "Low water" : null);
const daysFrom = (it) => {
  const days = (it.schedules ?? []).map((s, i) => {
    const place = title(s.locations).replace(/\bEmbarkation\b,?\s*/i, "").replace(/^,\s*/, "") || title(s.locations);
    const p = pin(s.locations);
    const seg = p ? place.split(/,|&| and /i).find((x) => x.toLowerCase().includes(p.k.trim())) : null;
    return { day: i + 1, title: clean(seg || place.split(",")[0]).slice(0, 48), place, lat: p?.lat ?? null, lng: p?.lng ?? null, summary: sentence(s.details) };
  });
  // a day at sea takes the midpoint of its neighbours
  days.forEach((d, i) => {
    if (d.lat != null) return;
    const a = days.slice(0, i).reverse().find((x) => x.lat != null), b = days.slice(i + 1).find((x) => x.lat != null);
    if (a && b) { d.lat = +((a.lat + b.lat) / 2).toFixed(3); d.lng = +((a.lng + b.lng) / 2).toFixed(3); } else if (a || b) { d.lat = (a ?? b).lat; d.lng = (a ?? b).lng; }
    if (/^at sea$/i.test(d.title)) d.title = "At sea";
  });
  days[0].title = days[0].title || "Embark";
  return days;
};

const photos = [];
for (const ship of SHIPS) {
  const events = Object.values(raw.events).flat().filter((e) => e.FacilityCode === ship.code);
  const routes = new Map();
  const deps = [];
  for (const e of events) {
    const ext = /\(ext\)/i.test(e.Name) ? 1 : 0;
    const it = raw.itineraries[`${e.Name}|${e.BegLocation}|${e.EndLocation}|${e.Duration}|${ext}`];
    if (!it) continue;
    const nights = +e.Duration;
    const from = PORTS[e.BegLocation] ?? e.BegLocation, to = PORTS[e.EndLocation] ?? e.EndLocation;
    let direction = from === to ? `${from} round trip` : `${from} to ${to}`;
    if (ext || (ship.code === "MAQ" && e.BegLocation === "PHNOM" && e.EndLocation === "PHNOM" && /siem reap/i.test(e.Name))) direction = `${from} to Siem Reap (flight from Phnom Penh)`;
    const sea = season(it.name);
    const disp = clean(it.displayName).replace(/^BALI/, "Bali").replace(/EXPEDITION$/, "Expedition").replace(/NATIONAL PARK/, "National Park").replace(/KOMODO/, "Komodo").replace(/Galapagos/g, "Galápagos").replace(/Tromso/g, "Tromsø").replace(/Arctic Circles/g, "Arctic Circle").replace(/(\S) The /g, "$1 the ").replace(/, & /g, " and ").replace(/ & /g, " and ");
    const base = `${nights}-night ${disp.replace(/^(Aqua Mekong|Aqua Nera|Aria Amazon) /, "")}`;
    const key = `${it.name}|${direction}`;
    if (!routes.has(key)) routes.set(key, { base, direction, sea, nights, it, n: 0 });
    routes.get(key).n++;
    const cats = [].concat(e.CategoryList?.Category ?? []).filter((c) => !/TOUR ?ESCORT|^TE$/i.test(c.Code) && !/tour escort/i.test(c.Name));
    const prices = {}, left = {};
    for (const c of cats) {
      const name = ship.categories[c.Code.replace(/\*+$/, "")];
      if (!name) continue;
      const p = Math.round(+c.InfoPrice);
      if (!(p > 0)) continue;
      if (prices[name] == null || p < prices[name]) prices[name] = p;
      left[name] = (left[name] ?? 0) + +c.AvailUnits;
    }
    if (!Object.keys(prices).length) continue;
    const total = Object.values(left).reduce((a, b) => a + b, 0);
    const promos = [...(e.PromotionIds ?? [])];
    const note = promos.includes("founder-hosted-departure") ? "Founder-hosted departure" : promos.includes("chef-hosted-departure") ? "Chef-hosted departure" : promos.includes("explorer-club-departure") ? "Explorer Club departure" : null;
    deps.push({ date: e.BegDate, dateTo: e.EndDate, season: sea, key, direction, nights, status: total === 0 ? "full" : total <= 3 ? "few left" : "open", prices: Object.fromEntries(ship.order.filter((k) => k in prices).map((k) => [k, prices[k]])), cabinsLeft: left, note });
  }
  // name each route; where one name covers two seasons or two routes, the season or the route tells them apart
  const byBase = new Map();
  for (const r of routes.values()) byBase.set(r.base, [...(byBase.get(r.base) ?? []), r]);
  const itineraries = [];
  for (const [b, list] of byBase) for (const r of list.sort((x, y) => y.n - x.n)) {
    const sameDir = list.filter((x) => x.direction === r.direction);
    const dir = r.direction.replace(" (flight from Phnom Penh)", " by river and air");
    r.name = list.length === 1 ? b : sameDir.length > 1 && r.sea ? `${b}, ${dir}, ${r.sea[0].toLowerCase() + r.sea.slice(1)}` : `${b}, ${dir}`;
    if (itineraries.some((x) => x.name === r.name)) r.name += ` (${itineraries.filter((x) => x.name.startsWith(r.name)).length + 1})`;
    const pdf = (r.it.itineraryLink?.url ?? "").match(/name=([^&]+)/)?.[1];
    itineraries.push({ name: r.name, nights: r.nights, direction: r.direction, ...(r.sea ? { season: r.sea } : {}), days: daysFrom(r.it), ...(pdf ? { note: `Aqua's day by day: ${decodeURIComponent(pdf)}` } : {}) });
  }
  itineraries.sort((a, b) => a.nights - b.nights || a.name.localeCompare(b.name));
  const departures = deps.sort((a, b) => a.date.localeCompare(b.date) || a.nights - b.nights).map(({ key, ...d }) => ({ date: d.date, dateTo: d.dateTo, season: d.season, itinerary: routes.get(key).name, direction: d.direction, nights: d.nights, status: d.status, prices: d.prices, cabinsLeft: d.cabinsLeft, ...(d.note ? { note: d.note } : {}) }));
  for (const it of itineraries) delete it.note;

  const path = `lib/content/ships/${ship.folder}/${ship.slug}.json`;
  let rec;
  if (ship.keep && existsSync(path)) {
    rec = JSON.parse(readFileSync(path, "utf8"));
    Object.assign(rec, { itineraries, departures, film: ship.film ?? rec.film, pricesNote: ship.pricesNote ?? rec.pricesNote });
    if (ship.patch) Object.assign(rec, ship.patch);
  } else {
    rec = ship.record({ itineraries, departures });
  }
  writeFileSync(path, JSON.stringify(rec, null, 1) + "\n");
  const apiGallery = raw.ships.find((x) => x.Title.replace(/\s/g, "").toLowerCase() === ship.slug.replace(/-/g, ""))?.Gallery ?? [];
  for (const p of ship.photos ?? []) {
    const src = p.src.startsWith("api:") ? apiGallery.find((g) => g.Caption.trim() === p.src.slice(4))?.ImageSource : p.src;
    if (!src) throw new Error(`${ship.slug}: no photograph captioned ${p.src.slice(4)} in Aqua's ship data`);
    photos.push({ id: `${CLD}/${ship.slug}/${p.id}`, src });
  }
  console.log(ship.slug, itineraries.length, "routes,", departures.length, "departures");
}
writeFileSync("scripts/data/aqua/photos.json", JSON.stringify(photos, null, 1) + "\n");
console.log(photos.length, "photographs listed");
