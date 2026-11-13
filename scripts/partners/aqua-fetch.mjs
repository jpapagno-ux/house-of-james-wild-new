// Aqua Expeditions: pull the public trip, ship, departure and day-by-day data that
// aquaexpeditions.com itself loads (api.aquaexpeditions.com and backend.book.aquaexpeditions.com).
// Writes the raw answers to scripts/data/aqua/raw.json; scripts/partners/aqua-build.mjs turns them
// into the ship files. Facts, prices and photos are Aqua's own (partner agreement, James).
import { mkdirSync, writeFileSync } from "node:fs";

const API = "https://api.aquaexpeditions.com/api/v0";
const BOOK = "https://backend.book.aquaexpeditions.com/api/v0";
const REGIONS = ["MEKONG", "AMAZON", "GALAP", "KOMODO", "RAJA", "SPICE", "ASMAT", "DUAL", "SEYCHELLES", "ARCTIC"];
const today = new Date().toISOString().slice(0, 10);
const end = `${new Date().getUTCFullYear() + 3}-12-31`;

const get = async (url) => {
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: { accept: "application/json", "user-agent": "Mozilla/5.0 (James Wild & Co partner sync)" } });
    if (r.ok) return r.json();
    await new Promise((s) => setTimeout(s, 1500 * (i + 1)));
  }
  throw new Error(`fetch failed: ${url}`);
};

const trips = await get(`${API}/trips`);
const ships = await get(`${API}/ships`);
const events = {};
for (const g of REGIONS) {
  const r = await get(`${API}/events?region=${g}&start_date[]=${today}&end_date[]=${end}&promo_cabin_check=false`);
  events[g] = r.EventList ?? [];
  console.log(g, events[g].length);
}
const promos = await get(`${API}/events/promos`).catch(() => null);

const itineraries = {};
const keyOf = (e) => {
  const ext = /\(ext\)/i.test(e.Name) ? 1 : 0;
  return { key: `${e.Name}|${e.BegLocation}|${e.EndLocation}|${e.Duration}|${ext}`, ext };
};
for (const e of Object.values(events).flat()) {
  const { key, ext } = keyOf(e);
  if (key in itineraries) continue;
  const q = new URLSearchParams({ eventName: e.Name, begin: e.BegLocation, end: e.EndLocation, length: e.Duration, ext: String(ext) });
  itineraries[key] = await get(`${BOOK}/itinerary?${q}`).catch(() => null);
}

// Aqua's YouTube channel (@AquaExpeditionsCruises): the video list its own page carries, for the ship films.
const youtube = [];
for (const tab of ["videos", "playlists"]) {
  const html = await fetch(`https://www.youtube.com/@AquaExpeditionsCruises/${tab}`, { headers: { "accept-language": "en", "user-agent": "Mozilla/5.0" } }).then((r) => r.text()).catch(() => "");
  const m = html.match(/ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) continue;
  const walk = (o) => {
    if (!o || typeof o !== "object") return;
    if (o.videoId && o.title) {
      const title = o.title.runs ? o.title.runs.map((r) => r.text).join("") : o.title.simpleText;
      youtube.push({ id: o.videoId, title, length: o.lengthText?.simpleText ?? null, published: o.publishedTimeText?.simpleText ?? null });
    }
    if (o.lockupViewModel) {
      const t = o.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content;
      if (o.lockupViewModel.contentId && t) youtube.push({ id: o.lockupViewModel.contentId, title: t, kind: o.lockupViewModel.contentType });
    }
    for (const k in o) walk(o[k]);
  };
  walk(JSON.parse(m[1]));
}
console.log("youtube", youtube.length);

// Photographs on Aqua's own ship and destination pages, as full-size originals (the site serves an
// "-optimized" webp copy beside each one), with the alt text the page gives them.
const PAGES = ["cruise-ships/aqua-blu", "cruise-ships/aqua-mekong", "cruise-ships/aqua-mare", "cruise-ships/aqua-nera", "cruise-ships/aqua-lares", "cruise-ships/aria-amazon", "destinations/mekong-river-cruise", "destinations/amazon-river-cruise", "destinations/galapagos-cruise", "destinations/seychelles-tanzania-cruise", "destinations/svalbard-arctic-cruise", "destinations/indonesia-cruise", "about-us"];
const photos = {};
for (const p of PAGES) {
  const html = (await fetch(`https://www.aquaexpeditions.com/${p}`, { headers: { "user-agent": "Mozilla/5.0" } }).then((r) => r.text()).catch(() => "")).replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
  const out = [];
  const re = /https:\/\/d20knvk822eu5a\.cloudfront\.net\/s3fs-public-optimized(?:-tablet|-mobile)?\/(?:styles\/manual_crop\/public\/)?([^"'\s)?\\]+?)\.webp/g;
  let m;
  while ((m = re.exec(html))) {
    const orig = `https://d20knvk822eu5a.cloudfront.net/s3fs-public/${m[1]}${/\.(jpe?g|png|webp)$/i.test(m[1]) ? "" : ".webp"}`;
    if (out.some((x) => x.src === orig) || /menu-|newsletter|logo|icon|placeholder/i.test(orig)) continue;
    const near = html.slice(Math.max(0, m.index - 600), m.index + 600);
    const alt = (near.match(/alt="([^"]{3,200})"/) || near.match(/\\"alt\\":\\"([^"\\]{3,200})/) || [])[1] ?? null;
    out.push({ src: orig, alt });
  }
  photos[p] = out;
  console.log(p, out.length);
}

mkdirSync("scripts/data/aqua", { recursive: true });
writeFileSync("scripts/data/aqua/raw.json", JSON.stringify({ fetched: today, trips: trips.TripList, ships: ships.ShipList, events, itineraries, promos, youtube, photos }, null, 1));
console.log("events", Object.values(events).flat().length, "itineraries", Object.keys(itineraries).length);
