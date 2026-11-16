// SeaDream Yacht Club (Preferred & Vetted partner; James, 15 and 16 Nov 2026: "their itineraries one by one").
// Turns the brand's own pages, as read by seadream-fetch.mjs and seadream-assets.mjs, into:
//   lib/content/ships/seadream/voyages.json   one record per published voyage (its own page: /voyages/ships/<yacht>/<voyage>)
//   lib/content/ships/caribbean/seadream-*.json   the three yacht records, every sailing a row that links to its voyage
//   public/maps/routes/seadream-<yacht>-<voyage>.json  each voyage's route for the house chart
// Facts, fares and photographs only from seadream.com. Port positions are OpenStreetMap's, by port name (the brand
// publishes none); the hand corrections sit in scripts/data/seadream/port-fixes.json. Fares are per person, double
// occupancy, in US dollars, as SeaDream publishes them. Editorial copy for the yachts lives in seadream-editorial.mjs.
// Run: node scripts/partners/seadream-build.mjs
import fs from "node:fs";
import { YACHTS, REGIONS, INCLUSIONS, EXCLUSIONS, TERMS, SOURCES, NOT_SOLD, REGION_PICTURE } from "./seadream-editorial.mjs";

const DIR = "scripts/data/seadream";
const J = (f, d) => (fs.existsSync(`${DIR}/${f}`) ? JSON.parse(fs.readFileSync(`${DIR}/${f}`, "utf8")) : d);
const raw = J("raw.json"), ports = J("ports.json", {}), fixes = J("port-fixes.json", {}), library = J("library.json", {});
const CLOUD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const READ = raw.read ?? "2026-11-15";

const undash = (s) => String(s ?? "").replace(/\s*[–—]\s*/g, ", ").replace(/\s+-\s+/g, " to ").replace(/\s+/g, " ").trim();
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
const iso = (s) => { const m = String(s).match(/([A-Z][a-z]{2})[a-z]* (\d{1,2}), (\d{4})/); return m ? `${m[3]}-${String(MON[m[1]]).padStart(2, "0")}-${m[2].padStart(2, "0")}` : null; };
// A day with no harbour of its own (at sea, crossing a named sea, an eclipse, a marina day at anchor between ports):
// it keeps the name SeaDream gives it and sits between the ports either side on the chart.
const isSea = (p) => /^(at sea|sailing the |solar eclipse|dream marina day|international date line)/i.test(p ?? "");
const seaName = (p) => (/^at sea/i.test(p) ? "At sea" : p.replace(/\s+-\s+.*$/, ""));
const short = (p) => p.split(",")[0].trim();
const first = (t, max = 240) => {
  const s = undash(t).match(/[^.!?]+[.!?]+/g) ?? [undash(t)];
  let out = "";
  // the house's struck words stay out, even in an operator's port note (docs: James's voice guide)
  for (const x of s) { if (/paradise|hidden gem|bucket list|unforgettable|bespoke|curated|seamless|breathtaking|once in a lifetime/i.test(x)) continue; if (out && (out + x).length > max) break; out += x; if (out.length > 90) break; }
  return out.trim();
};
const pos = (port, country) => { const k = `${port}|${country}`; const f = fixes[k] ?? ports[k]; return f && f.lat != null ? [f.lat, f.lng] : null; };
// A picture from the house Cloudinary library, by id (scripts/data/seadream/library.json: width and the caption written by
// looking at it). Small originals are upscaled and tone-corrected by Cloudinary, large ones lightly sharpened: enhance
// only, the house rule in components/opening/Pic.tsx. Nothing is generated.
const ROOT = "jwco/voyages/ships/seadream";
function image(id, altOverride) {
  const p = library[id];
  if (!p) return null;
  const tx = p[0] < 1600 ? "c_limit,w_1200,h_1200/e_upscale/e_improve/c_limit,w_2560/q_auto:good/f_jpg" : "e_sharpen:40/f_auto,q_auto";
  return { url: `${CLOUD}/${tx}/${ROOT}/${id}`, alt: altOverride ?? p[1], credit: "SeaDream Yacht Club" };
}
const when = (a, d) => {
  const t = (x) => { const y = undash(String(x ?? "").replace(/\((Embarkation|Disembarkation)\)/i, "").trim()); return /\d/.test(y) ? y : y.charAt(0) + y.slice(1).toLowerCase(); };
  const A = t(a), D = t(d);
  if (/Embarkation/i.test(a ?? "")) return `Embark ${A}${D ? `, sails ${D.toLowerCase()}` : ""}`;
  if (/Disembarkation/i.test(d ?? "")) return `Arrives ${A.toLowerCase()}, disembark ${D}`;
  if (A && D) return /overnight/i.test(D) ? `${A}, overnight` : `${A} to ${D.toLowerCase()}`;
  return A || (D ? `Until ${D.toLowerCase()}` : "");
};

const yachtSlug = (y) => y.replace(/-(\d)$/, (_, n) => `-${"i".repeat(+n)}`);
const out = [];
const unplaced = new Set();
const held = [];
for (const v of raw.voyages) {
  const ship = yachtSlug(v.yacht), Y = YACHTS[ship];
  const rows = v.days.map((d) => ({ ...d, iso: iso(d.date) })).filter((d) => d.iso && d.port);
  if (!rows.length) continue;
  if (v.countries.some((c) => NOT_SOLD.includes(c)) || rows.some((r) => NOT_SOLD.includes(r.country))) { held.push(`${v.number} ${v.title} (${v.start})`); continue; }
  const dates = [...new Set(rows.map((r) => r.iso))].sort();
  const days = dates.map((date, i) => {
    const calls = rows.filter((r) => r.iso === date).filter((r, k, a) => k === 0 || r.port !== a[k - 1].port);
    const last = calls[calls.length - 1];
    const p = isSea(last.port) ? null : pos(last.port, last.country);
    if (!isSea(last.port) && !p) unplaced.add(`${last.port}|${last.country}`);
    const names = calls.filter((c) => !isSea(c.port) || calls.length === 1).map((c) => (isSea(c.port) ? seaName(c.port) : short(c.port)));
    const place = isSea(last.port) ? seaName(last.port) : last.port.includes(last.country) || !last.country ? last.port : `${last.port}, ${last.country}`;
    const summary = calls.filter((c) => c.note && !isSea(c.port)).map((c) => first(c.note, calls.length > 1 ? 150 : 240)).join(" ");
    return { day: i + 1, date, title: [...new Set(names)].join(" and "), place: undash(place), lat: p ? p[0] : null, lng: p ? p[1] : null, summary, label: calls.map((c) => when(c.arrive, c.depart)).filter(Boolean).join("; ") || undefined };
  });
  // a day at sea sits between the ports either side of it
  days.forEach((d, i) => {
    if (d.lat != null) return;
    const a = days.slice(0, i).reverse().find((x) => x.lat != null), b = days.slice(i + 1).find((x) => x.lat != null);
    if (a && b) { const run = days.slice(days.indexOf(a) + 1, days.indexOf(b)); const k = (run.indexOf(d) + 1) / (run.length + 1); d.lat = +(a.lat + (b.lat - a.lat) * k).toFixed(3); d.lng = +(a.lng + (b.lng - a.lng) * k).toFixed(3); }
    else if (a || b) { d.lat = (a ?? b).lat; d.lng = (a ?? b).lng; }
  });
  const stops = [];
  for (const r of rows) {
    if (isSea(r.port)) continue;
    const p = pos(r.port, r.country);
    if (!p || stops[stops.length - 1]?.name === r.port) continue;
    stops.push({ day: dates.indexOf(r.iso) + 1, name: r.port, lat: p[0], lng: p[1] });
  }
  const a = rows[0], b = rows[rows.length - 1];
  const direction = a.port === b.port ? `${short(a.port)} round trip` : `${short(a.port)} to ${short(b.port)}`;
  const title = undash(v.title);
  const byName = new Map();
  for (const s of v.suites ?? []) byName.set(s.name, (byName.get(s.name) ?? 0) + 1);
  const prices = Object.fromEntries((v.suites ?? []).filter((s) => +s.fromPrice > 0).sort((x, y) => x.fromPrice - y.fromPrice).map((s) => [byName.get(s.name) > 1 ? `${s.name} (${s.deck})` : s.name, +s.fromPrice]));
  const lead = Object.values(prices).length ? Math.min(...Object.values(prices)) : +v.leadFare > 0 ? +v.leadFare : null;
  const countries = [...new Set(rows.map((r) => r.country).filter(Boolean))];
  const callNames = [...new Set(stops.map((s) => short(s.name)))];
  const id = `${slug(title)}-${dates[0]}`;
  out.push({
    slug: id, number: String(v.number), ship, shipName: Y.name, title, date: dates[0], dateTo: dates[dates.length - 1], nights: +v.nights || dates.length - 1,
    region: v.region, regionName: REGIONS[v.region] ?? v.region, from: undash(a.port), to: undash(b.port), direction, countries, bahamas: countries.includes("Bahamas") || countries.includes("The Bahamas"),
    collection: String(v.collection ?? "").split(",").filter(Boolean), waitlisted: !!v.waitlisted, calls: callNames,
    hero: image(ship === "seadream-iii" ? "site/sdiii-launch" : REGION_PICTURE[v.region] ?? "site/entire-ship"), days, stops, prices, from$: lead, maiden: ship === "seadream-iii" && dates[0] === "2029-07-10",
  });
}
out.sort((x, y) => x.date.localeCompare(y.date) || x.ship.localeCompare(y.ship));
const seen = new Set();
for (const v of out) { if (seen.has(`${v.ship}/${v.slug}`)) v.slug = `${v.slug}-${v.number}`; seen.add(`${v.ship}/${v.slug}`); }
fs.mkdirSync("lib/content/ships/seadream", { recursive: true });

// The route file of each voyage (jw-route v1, the shape scripts/build-ship-maps.py writes): legs join the ports in order.
// Courses and positions are approximate; no coastline is charted for these waters yet, so legs are drawn straight.
const LABELS = {
  caribbean: [{ text: "Caribbean Sea", lat: 15.5, lng: -64.5, kind: "sea" }, { text: "Atlantic Ocean", lat: 21.5, lng: -60.5, kind: "sea" }],
  mediterranean: [{ text: "Mediterranean Sea", lat: 36.5, lng: 17.5, kind: "sea" }, { text: "Aegean Sea", lat: 38.5, lng: 25.0, kind: "sea" }, { text: "Adriatic Sea", lat: 43.0, lng: 15.5, kind: "sea" }, { text: "Tyrrhenian Sea", lat: 40.0, lng: 12.0, kind: "sea" }],
  "trans-atlantic": [{ text: "Atlantic Ocean", lat: 25.0, lng: -40.0, kind: "sea" }],
  "scandinavia-northern-europe": [{ text: "North Sea", lat: 57.0, lng: 3.5, kind: "sea" }, { text: "Norwegian Sea", lat: 67.0, lng: 6.0, kind: "sea" }, { text: "Baltic Sea", lat: 57.5, lng: 19.5, kind: "sea" }],
  arctic: [{ text: "Arctic Ocean", lat: 79.5, lng: 8.0, kind: "sea" }, { text: "Norwegian Sea", lat: 68.0, lng: 6.0, kind: "sea" }],
};
for (const f of fs.readdirSync("public/maps/routes")) if (/^seadream-/.test(f)) fs.unlinkSync(`public/maps/routes/${f}`);
for (const v of out) {
  if (v.stops.length < 2) continue;
  const stops = v.stops.map((s, i, a) => ({ day: s.day, name: s.name, lat: s.lat, lng: s.lng, ...(i === 0 ? { kind: "port" } : { mode: "sea", path: [[a[i - 1].lng, a[i - 1].lat], [s.lng, s.lat]] }), ...(i === a.length - 1 && i > 0 ? { kind: "port" } : {}) }));
  v.route = `seadream-${v.ship.replace("seadream-", "")}-${v.slug}`;
  fs.writeFileSync(`public/maps/routes/${v.route}.json`, JSON.stringify({ id: v.route, type: "voyage", destination: v.region, title: `${v.title} aboard ${v.shipName}`, subtitle: `${v.nights} nights · ${v.direction} · ${v.shipName}`, days: Object.fromEntries(v.days.map((d) => [d.day, d.title])), stops, map_note: "Course and positions approximate, not a navigational chart", fallback: { labels: LABELS[v.region] ?? [] } }) + "\n");
}
fs.writeFileSync("lib/content/ships/seadream/voyages.json", JSON.stringify({ source: "seadream.com", read: READ, voyages: out.map(({ stops, ...v }) => v) }, null, 1) + "\n");

// The yacht records ------------------------------------------------------------
const usd = (n) => `US$${n.toLocaleString("en-US")}`;
for (const [ship, Y] of Object.entries(YACHTS)) {
  const mine = out.filter((v) => v.ship === ship);
  const departures = mine.map((v) => ({ date: v.date, dateTo: v.dateTo, itinerary: v.title, direction: v.direction, nights: v.nights, status: v.waitlisted ? "Full" : "open", prices: Object.keys(v.prices).length ? v.prices : v.from$ ? { From: v.from$ } : {}, voyage: v.number, href: `/voyages/ships/${ship}/${v.slug}` }));
  const low = Math.min(...mine.map((v) => v.from$ ?? Infinity));
  const regions = [...new Set(mine.map((v) => v.regionName))];
  const cabins = (Y.cabins ?? []).map(({ photo, ...c }) => ({ ...c, image: photo ? image(photo) : null }));
  const gallery = (Y.gallery ?? []).map((g) => image(g)).filter(Boolean);
  const hero = image(Y.hero);
  const bah = mine.filter((v) => v.bahamas);
  const bahamas = bah.length ? `Yes. SeaDream publishes ${bah.length} ${bah.length === 1 ? "voyage" : "voyages"} for her that call in the Bahamas, at ${[...new Set(bah.flatMap((v) => v.days.filter((d) => /Bahamas/.test(d.place)).map((d) => d.title)))].slice(0, 8).join(", ")}. Each has its own page here.` : "None of her published voyages call in the Bahamas at the moment. SeaDream's Bahamas voyages are listed on the SeaDream Yacht Club page.";
  const fill = (t) => t.replaceAll("{n}", String(mine.length)).replaceAll("{from}", Number.isFinite(low) ? usd(low) : "on request").replaceAll("{first}", mine[0]?.date ?? "").replaceAll("{last}", mine[mine.length - 1]?.dateTo ?? "").replaceAll("{bahamas}", bahamas).replaceAll("{regions}", regions.join(", ").replace(/, ([^,]+)$/, " and $1"));
  const deep = (x) => (typeof x === "string" ? fill(x) : Array.isArray(x) ? x.map(deep) : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deep(v)])) : x);
  const rec = deep({
    slug: ship, name: Y.name, ledgerId: Y.ledgerId, brandLine: Y.brandLine, operator: "SeaDream Yacht Club", type: "yacht", waters: Y.waters, country: Y.country, status: Y.status, ...(Y.launch ? { launch: Y.launch } : {}),
    seo: Y.seo, tagline: Y.tagline, answer: Y.answer, facts: Y.facts, glance: Y.glance, overview: Y.overview, why: Y.why, hero, gallery,
    cabins, deckPlans: (Y.decks ?? []).map((d) => ({ deck: d.deck, image: image(d.id, d.alt), cabins: d.cabins })).filter((d) => d.image),
    itineraries: [], departures,
    routesNote: `Every published ${Y.name} voyage has its own page, with its day by day, chart and fares. Open a year and a month below and pick a sailing.`,
    datesPublished: true, fareBasis: "per person, double occupancy, in USD, as published",
    pricesNote: Y.pricesNote, inclusions: Y.inclusions ?? INCLUSIONS, exclusions: Y.exclusions ?? EXCLUSIONS, children: Y.children, faqs: Y.faqs, suits: Y.suits, sources: SOURCES, film: null, terms: TERMS,
    pathway: Y.pathway,
  });
  fs.writeFileSync(`lib/content/ships/caribbean/${ship}.json`, JSON.stringify(rec, null, 1) + "\n");
  console.log(ship, mine.length, "voyages", Number.isFinite(low) ? `from ${usd(low)}` : "");
}
if (held.length) console.log("held (Middle East calls, not filed):\n " + held.join("\n "));
console.log(out.length, "voyages;", out.filter((v) => v.bahamas).length, "call in the Bahamas;", out.filter((v) => !v.hero).length, "without a captioned picture;", unplaced.size, "ports without a position");
if (unplaced.size) console.log([...unplaced].join("\n"));
