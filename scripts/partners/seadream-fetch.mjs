// SeaDream Yacht Club: read every voyage the brand publishes on seadream.com (partner agreement, James, 15 Nov 2026).
// The site is server-rendered. The voyages page carries one card per voyage (number, yacht, start date, nights, lead
// fare, ports, waitlist flag); each voyage page carries the voyage's name and overview, its ports-of-call table (date,
// port, country, arrive, depart, the brand's note and port picture) and a JSON block with every stateroom and suite
// category's published fare for that sailing. Also read: the terms page and the special offers page.
// Writes scripts/data/seadream/raw.json. Facts, fares and pictures are SeaDream's own.
// Run on a GitHub runner (the workflow seadream-fetch.yml): node scripts/partners/seadream-fetch.mjs
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const SITE = "https://seadream.com";
const UA = { "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)", "accept-language": "en" };
const get = async (url) => {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) return r.text();
    await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
  }
  return null;
};
const ent = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"');
const text = (h) => ent(h.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`${name}="([^"]*)"`)); return m ? ent(m[1]) : null; };

const listing = await get(`${SITE}/voyages`);
if (!listing) throw new Error("voyages page did not load");
const cards = [...listing.matchAll(/<div[^>]*data-voyage-number="[^"]+"[^>]*>/g)].map((m) => m[0]);
const seen = new Set();
const voyages = [];
for (const tag of cards) {
  const number = attr(tag, "data-voyage-number");
  if (!number || seen.has(number)) continue;
  seen.add(number);
  voyages.push({
    number, yacht: attr(tag, "data-yacht"), start: attr(tag, "data-start-date"), nights: Number(attr(tag, "data-duration")), region: attr(tag, "data-destination"),
    collection: attr(tag, "data-collection"), waitlisted: attr(tag, "data-waitlisted") === "1", leadFare: Number(attr(tag, "data-start-price")) || null,
    ports: (attr(tag, "data-ports") ?? "").split("|").filter(Boolean).map((p) => { const [slug, name] = p.split("::"); return { slug, name }; }),
    countries: (attr(tag, "data-countries") ?? "").split("|").filter(Boolean).map((p) => p.split("::")[1]),
  });
}
console.log("voyages listed", voyages.length);

const readVoyage = (html) => {
  const title = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  const hero = html.match(/header\.voyage-hero\{\s*background-image:url\(([^)]+)\)/)?.[1]?.replace(/cdn-cgi\/image\/[^/]+\//, "") ?? null;
  const map = html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? null;
  const tableAt = html.indexOf('id="ports-of-call-table"');
  const before = tableAt > 0 ? html.slice(Math.max(0, tableAt - 6000), tableAt) : "";
  const overview = [...before.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter((t) => t.length > 120).pop() ?? null;
  const table = tableAt > 0 ? html.slice(tableAt, html.indexOf("</table>", tableAt)) : "";
  const rows = table.split(/<tr class="js-port-row"/).slice(1);
  const days = rows.map((row) => {
    const tds = [...row.split(/<tr id="port-details/)[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    const [portHtml = "", countryHtml = ""] = (tds[1] ?? "").split(/<span[^>]*>/);
    const detail = row.split(/<tr id="port-details/)[1] ?? "";
    return {
      date: text(tds[0] ?? ""), port: text(portHtml).replace(/,\s*$/, ""), country: text(countryHtml), arrive: text(tds[2] ?? ""), depart: text(tds[3] ?? ""),
      note: text(detail.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "") || null, image: detail.match(/<img[^>]*src="([^"]+)"/)?.[1] ?? null,
      slug: detail.match(/href="\/destinations\/[^"]*\/([^"\/]+)"/)?.[1] ?? null,
    };
  });
  let suites = [];
  const sj = html.match(/<script id="suite-data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  if (sj) { try { suites = Object.values(JSON.parse(sj)).map((s) => ({ id: s.id, name: s.name, deck: s.deckLabel, size: s.sizeLabel, fromPrice: s.fromPrice ?? null, currency: s.currencyCode, description: s.description, photos: s.photos ?? [], video: s.videoUrl ?? null, plan: s.planImg ?? s.deckPlanImg ?? null })); } catch { suites = []; } }
  const note = text(html.match(/<p[^>]*>\s*Please Note:([\s\S]*?)<\/p>/)?.[1] ?? "") || null;
  return { title, overview, hero, map, days, suites, fareNote: note };
};

let done = 0;
const pool = async (items, n, fn) => { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); })); };
await pool(voyages, 4, async (v) => {
  const html = await get(`${SITE}/voyages/${v.number}`);
  if (!html) { v.error = "page did not load"; return; }
  Object.assign(v, readVoyage(html));
  if (++done % 25 === 0) console.log("read", done);
});

const strip = (h) => text((h ?? "").replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, " "));
const terms = strip(await get(`${SITE}/about/policies-terms-conditions`));
const offersHtml = (await get(`${SITE}/voyages/special-offers`)) ?? "";
const offerRows = [...offersHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)].map((c) => text(c[1]))).filter((r) => r.length > 3);
const offerScripts = [...offersHtml.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1].slice(0, 20000));

mkdirSync("scripts/data/seadream", { recursive: true });
rmSync("scripts/data/seadream/probe", { recursive: true, force: true });
writeFileSync("scripts/data/seadream/raw.json", JSON.stringify({ source: SITE, read: new Date().toISOString().slice(0, 10), voyages, terms: terms.slice(0, 60000), offers: { rows: offerRows, json: offerScripts } }, null, 1) + "\n");
console.log("voyages", voyages.length, "with days", voyages.filter((v) => v.days?.length).length, "with fares", voyages.filter((v) => v.suites?.some((s) => s.fromPrice)).length, "errors", voyages.filter((v) => v.error).length);
