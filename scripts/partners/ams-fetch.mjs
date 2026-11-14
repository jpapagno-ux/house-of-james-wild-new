// Aman at Sea (Amangati): read every published voyage from amanatsea.com's own server-rendered pages. Each voyage page
// carries its day by day (port, times, coordinates where given, at sea, tender) and every suite category's published
// fare (USD, EUR, GBP) and availability. The sitemap lists every voyage page. Also keeps the yacht pages and the FAQ as
// text for the editorial. Writes scripts/data/ams/raw.json. Facts and fares are Aman's own (partner agreement, James).
// Run on a GitHub runner (workflow ams-fetch.yml): node scripts/partners/ams-fetch.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const SITE = "https://www.amanatsea.com";
const UA = { "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)", "accept-language": "en" };
const get = async (url) => {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) return r.text();
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
};
const payload = (html) => [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)].map((m) => JSON.parse(`"${m[1]}"`)).join("");
const jsonAt = (text, key, from = 0) => {
  const k = text.indexOf(key, from);
  if (k < 0) return null;
  let i = k + key.length;
  while (i < text.length && text[i] !== "[" && text[i] !== "{") i++;
  let depth = 0, inStr = false;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (inStr) { if (c === "\\") j++; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") { depth--; if (depth === 0) { try { return JSON.parse(text.slice(i, j + 1)); } catch { return null; } } }
  }
  return null;
};
const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === "string" && v.startsWith("$D") ? v.slice(2) : v)));
// every readable string on a page (the FAQ and the yacht pages), in order, without duplicates
const texts = (t) => [...new Set([...t.matchAll(/"(?:value|description|title|text|eyebrow)":"((?:[^"\\]|\\.){3,})"/g)].map((m) => JSON.parse(`"${m[1]}"`)).filter((s) => !/^\$|^https?:|\.(jpg|png|webp)$/i.test(s)))];

const sm = await get(`${SITE}/sitemap.xml`);
let locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const sub of locs.filter((u) => /sitemap.*\.xml$/.test(u))) locs = locs.concat([...(await get(sub)).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const paths = [...new Set(locs.map((u) => u.replace(/^https?:\/\/[^/]+/, "")).filter((p) => /^\/voyages\/[^/]+\/AG\d{6}$/.test(p)))].sort((a, b) => a.slice(-8).localeCompare(b.slice(-8)));
console.log("voyage pages", paths.length);

const voyages = [];
for (const p of paths) {
  const t = payload(await get(SITE + p));
  const code = p.slice(-8);
  const at = t.indexOf(`"voyage_code":"${code}"`);
  const v = at >= 0 ? jsonAt(t, "{", t.lastIndexOf('"code":', at) - 1) : null;
  const days = jsonAt(t, '"mapboxItineraries":', at) ?? [];
  const ports = jsonAt(t, '"ports":[', 0);
  const suites = jsonAt(t, '"suitesDataWithCMS":') ?? [];
  const head = (() => { const m = t.match(new RegExp(`"voyage_name":"((?:[^"\\\\]|\\\\.)*)"`)); return m ? JSON.parse(`"${m[1]}"`) : null; })();
  voyages.push(strip({
    code, path: p, name: head,
    departure: t.match(new RegExp(`"voyage_code":"${code}"[\\s\\S]{0,1500}?"departure_date":"\\$D([^"]+)"`))?.[1] ?? null,
    arrival: t.match(new RegExp(`"voyage_code":"${code}"[\\s\\S]{0,1800}?"arrival_date":"\\$D([^"]+)"`))?.[1] ?? null,
    nights: +(t.match(new RegExp(`"voyage_code":"${code}"[\\s\\S]{0,1500}?"cruise_length":(\\d+)`))?.[1] ?? 0),
    from: t.match(/"departure_port_name":"([^"]+)"/)?.[1] ?? null, to: t.match(/"arrival_port_name":"([^"]+)"/)?.[1] ?? null,
    subregion: t.match(/"subregion_name":"([^"]+)"/)?.[1] ?? null, status: t.match(/"cruise_status":"([^"]+)"/)?.[1] ?? null,
    days: days.map((d) => ({ day: d.day_number, seq: d.sequence_number, port: d.port_name, code: d.cms_port_code, date: d.itinerary_date, atSea: d.at_sea, arrive: d.arrival_time, depart: d.departure_time, tender: d.tender_port })),
    ports: Array.isArray(ports) ? ports.map((x) => ({ port: x.port ?? x.port_name ?? null, lat: x.latitude ?? null, lng: x.longitude ?? null, arrival: x.arrival ?? null, departure: x.departure ?? null })) : [],
    suites: suites.map((s) => ({ code: s.category_code, name: s.category_name, usd: s.total_gross_rate_usd, eur: s.total_gross_rate_eur, gbp: s.total_gross_rate_gbp, available: s.real_availability, title: s.title ?? null, eyebrow: s.eyebrow ?? null, description: s.description ?? null, images: (s.images ?? []).map((i) => ({ url: i.file?.url, alt: i.description || i.title || null, w: i.file?.details?.image?.width ?? null })) })),
    images: [...new Set([...t.matchAll(/https:\/\/images\.ctfassets\.net\/[^"\\]+?\.(?:jpe?g|png|webp)/g)].map((m) => m[0]))],
  }));
  console.log(code, voyages.at(-1).days.length, "days", voyages.at(-1).suites.length, "suites");
}

const pages = {};
for (const p of ["/amangati", "/amangati/accommodation", "/amangati/dining", "/amangati/wellness", "/amangati/marina", "/amangati/deck-plans", "/destinations", "/experiences/at-sea", "/experiences/on-shore", "/faqs", "/charter",
  "/amangati/accommodation/aman-suite", "/amangati/accommodation/grand-suite", "/amangati/accommodation/signature-suite", "/amangati/accommodation/premier-suite", "/amangati/accommodation/premier-fore-suite", "/amangati/accommodation/deluxe-suite"]) {
  try { const t = payload(await get(SITE + p)); pages[p] = { texts: texts(t), images: [...new Set([...t.matchAll(/https:\/\/images\.ctfassets\.net\/[^"\\]+?\.(?:jpe?g|png|webp)/g)].map((m) => m[0]))] }; } catch { pages[p] = null; }
}
mkdirSync("scripts/data/ams", { recursive: true });
writeFileSync("scripts/data/ams/raw.json", JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), voyages, pages }, null, 1));
console.log("voyages", voyages.length);
