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
