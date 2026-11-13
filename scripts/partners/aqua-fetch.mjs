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

mkdirSync("scripts/data/aqua", { recursive: true });
writeFileSync("scripts/data/aqua/raw.json", JSON.stringify({ fetched: today, trips: trips.TripList, ships: ships.ShipList, events, itineraries, promos }, null, 1));
console.log("events", Object.values(events).flat().length, "itineraries", Object.keys(itineraries).length);
