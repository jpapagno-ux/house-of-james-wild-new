// Monthly currency refresh (James, 30 Oct 2026). Pulls the European Central Bank
// reference rate for each currency in lib/content/rates/fx.json (via Frankfurter,
// a free public ECB feed, no key) and rewrites the file. Partner rate pages read
// their dollar conversion from that file, so the site shows the new rate on the
// next deploy. Guard: a move of more than MAX_MOVE in one month stops the run
// for a human to look, rather than repricing every page on a bad feed.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = new URL("../lib/content/rates/fx.json", import.meta.url);
const MAX_MOVE = 0.1;
const fx = JSON.parse(readFileSync(FILE, "utf8"));
const symbols = Object.keys(fx.rates).join(",");

let data;
for (const url of [
  `https://api.frankfurter.dev/v1/latest?base=${fx.base}&symbols=${symbols}`,
  `https://api.frankfurter.app/latest?from=${fx.base}&to=${symbols}`,
]) {
  try {
    const res = await fetch(url);
    if (res.ok) { data = await res.json(); break; }
    console.warn(`${url}: HTTP ${res.status}`);
  } catch (e) { console.warn(`${url}: ${e.message}`); }
}
if (!data?.rates) { console.error("No rate feed reachable; fx.json left as it was."); process.exit(1); }

const next = {};
for (const [cur, old] of Object.entries(fx.rates)) {
  const v = data.rates[cur];
  if (typeof v !== "number" || !(v > 0)) { console.error(`${cur}: no rate in the feed`); process.exit(1); }
  const move = Math.abs(v - old) / old;
  if (move > MAX_MOVE) { console.error(`${cur}: ${old} -> ${v} (${(move * 100).toFixed(1)}%) is over the ${MAX_MOVE * 100}% guard. Check and update fx.json by hand.`); process.exit(1); }
  next[cur] = Math.round(v * 100) / 100;
  console.log(`${cur}: ${old} -> ${next[cur]} (${(move * 100).toFixed(2)}%)`);
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync(FILE, JSON.stringify({ ...fx, date: today, source: `European Central Bank reference rate (${data.date})`, rates: next }, null, 2) + "\n");
