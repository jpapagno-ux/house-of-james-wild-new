import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { routeFigureSvg, sailOf } from "../lib/maps/route-figure.ts";

const ink = { route: "navy", boat: "ink", river: "blue", ground: "white" };
const read = (id: string) => JSON.parse(fs.readFileSync(`public/maps/routes/${id}.json`, "utf8"));

test("every Nile itinerary figure has a boat sailing the river legs", () => {
  for (const f of fs.readdirSync("public/maps/routes").filter((x) => /^(nile-|sun-boat-|zein-)/.test(x))) {
    const r = read(f.replace(/\.json$/, ""));
    const svg = routeFigureSvg({ id: "t", routes: [r], ink, label: r.title });
    assert.match(svg, /<path id="t-sail" d="M[^"]+L/, f);
    assert.match(svg, /<g class="ship">.*<animateMotion[^>]*rotate="auto".*<mpath href="#t-sail"\/>/, f);
    assert.match(svg, /<g class="ship-park" transform="translate\(/, f);
    assert.match(svg, /prefers-reduced-motion: reduce\)\{#t \.ship\{display:none\}/, f);
  }
});
test("the boat only follows sailing legs, not flights or drives", () => {
  const r = read("sun-boat-iii-luxor-to-aswan-7n");
  const sail = sailOf(r);
  assert.ok(sail.length > 4);
  assert.ok(sail.every(([, lat]) => lat > 23.5), "Abu Simbel (by air) is not on the boat's course");
});
test("flown legs: a dashed arc with a plane on it, and the boat carries the crimson pennant", () => {
  const r = read("sun-boat-iii-luxor-to-aswan-7n");
  const svg = routeFigureSvg({ id: "t", routes: [r], ink, label: r.title });
  assert.match(svg, /<path d="M[\d. -]+Q[\d. -]+" fill="none"[^>]*stroke-dasharray="7 7"/);
  assert.match(svg, /<path id="t-fly" d="M[^"]+Q[^"]+"/);
  assert.match(svg, /<mpath href="#t-fly"\/>/);
  assert.match(svg, /path\.pn[^{]*\{fill:#8B2525/);
});
test("one source for the leg mode: the ship day, its route file and the 3D stop agree (Hermes flies Quito to Baltra and back)", () => {
  const ship = JSON.parse(fs.readFileSync("lib/content/ships/galapagos/hermes-galapagos.json", "utf8"));
  const days = ship.itineraries[0].days as { day: number; mode?: string }[];
  const route = read("hermes-galapagos-quito-to-baltra-then-back-to-quito-7n");
  assert.deepEqual(days.filter((d) => d.mode === "air").map((d) => d.day), [2, 9]);
  for (const s of route.stops.slice(1)) assert.equal(s.mode, days.find((d) => d.day === s.day)?.mode ?? "sea", `day ${s.day}`);
});
