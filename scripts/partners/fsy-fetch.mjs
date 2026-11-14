// Four Seasons Yachts: read every Four Seasons I voyage the brand publishes on fourseasonsyachts.com.
// The site is server-rendered (Next.js), so each voyage page carries its own data: the day-by-day
// (port, arrival and departure times, coordinates, the brand's one-line note) and every suite
// category's published fare and availability for that sailing. The sitemap lists every voyage page;
// each voyage page lists every dated sailing (id FS-I-yymmdd-nnn); each sailing page is read once.
// Writes scripts/data/fsy/raw.json. Facts and fares are Four Seasons Yachts' own (partner agreement, James).
// Run on a GitHub runner (the workflow fsy-fetch.yml): node scripts/partners/fsy-fetch.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://www.fourseasonsyachts.com";
const UA = { "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)", "accept-language": "en" };
const get = async (url) => {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) return r.text();
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
};
// the page's React Server Components payload, unescaped into one string
const payload = (html) => [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/g)].map((m) => JSON.parse(`"${m[1]}"`)).join("");
// the JSON value (array or object) that follows `key` in the payload
const jsonAt = (text, key) => {
  const k = text.indexOf(key);
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
const param = (text, name) => text.match(new RegExp(`"${name}":\\{"type":"[a-z]+","value":"((?:[^"\\\\]|\\\\.)*)"`))?.[1] ?? null;

const sitemap = await get(`${SITE}/sitemap.xml`);
const slugs = [...new Set([...sitemap.matchAll(/<loc>https:\/\/www\.fourseasonsyachts\.com\/voyages\/([^<?/]+)<\/loc>/g)].map((m) => m[1]))];
console.log("voyage pages", slugs.length);

// the brand's own "Find a Voyage" list (scripts/data/fsy/seed.txt), one card per voyage; the sitemap misses some voyages
const seed = readFileSync("scripts/data/fsy/seed.txt", "utf8").split("\n").filter((l) => /^FS-I-/.test(l)).map((l) => l.trim().split(/\s+/));
const ids = new Map(seed); // id -> slug
for (const [, s] of seed) if (!slugs.includes(s)) slugs.push(s);
for (const slug of slugs) {
  let t;
  try { t = payload(await get(`${SITE}/voyages/${slug}`)); } catch { console.log("skip page", slug); continue; }
  // the voyage's own sailings: the "Voyage Dates" block lists one package per dated sailing
  const list = jsonAt(t, '"voyageData":{"type":"json","value":') ?? [];
  for (const v of list) { const code = v?.pkg?.code; if (/^FS-I-\d{6}-\d{3}$/.test(code ?? "") && !ids.has(code)) ids.set(code, slug); }
}
console.log("sailing ids", ids.size);

const sailings = [];
for (const [id, slug] of [...ids].sort()) {
  let t;
  try { t = payload(await get(`${SITE}/voyages/${slug}?id=${id}`)); } catch { console.log("skip", id); continue; }
  if (param(t, "itineraryId") !== id) { console.log("mismatch", id); continue; }
  const acts = jsonAt(t, '"itineraryActivities":{"type":"json","value":') ?? [];
  const cats = jsonAt(t, '"availableCategories":') ?? [];
  sailings.push({
    id, slug,
    title: param(t, "pageTitle"),
    eyebrow: param(t, "eyebrow"),
    body: param(t, "body"),
    from: param(t, "fromDate"), to: param(t, "toDate"),
    voyageCode: param(t, "voyageId"),
    waitlisted: param(t, "isWaitlisted"),
    days: acts.map((a) => ({ day: +a.day, code: a.portCode, port: a.portName, type: a.type, note: a.scheduleNote, arrive: a.arrivalDateTime, depart: a.departureDateTime, title: a.portContent?.title ?? null, lat: a.portContent?.coordinates?.lat ?? null, lon: a.portContent?.coordinates?.lon ?? null, excerpt: a.portContent?.itineraryExcerpt || a.portContent?.excerpt || null })),
    suites: cats.map((c) => ({ code: c.cabinCategory?.key?.split(",")[1] ?? null, name: c.cabinCategory?.description ?? null, decks: (c.cabinCategory?.decks ?? []).map((d) => d.code), status: c.availability?.result ?? null, total: c.availability?.totalCabins ?? null, available: c.availability?.totalAvailableAbsolute ?? null, fare: c.price?.total ?? null, currency: c.price?.currency?.code ?? null })),
  });
  if (sailings.length % 10 === 0) console.log(sailings.length);
}
mkdirSync("scripts/data/fsy", { recursive: true });
writeFileSync("scripts/data/fsy/raw.json", JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), slugs: slugs.length, sailings }, null, 1));
console.log("sailings", sailings.length);
