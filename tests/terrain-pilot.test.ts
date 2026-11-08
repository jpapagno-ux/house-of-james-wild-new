import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { boundsOf, bearingOf, clampSeabed, legsOf, partOf } from "../components/maps/terrain/geo.ts";
import { ATTRIBUTION, houseLayer, houseStyle, groundStyle, redact } from "../components/maps/terrain/style.ts";
import { TERRAIN } from "../lib/palette.ts";

// The 3D terrain pilot (components/maps/terrain): the restyle keeps to the house tones and stays sparse, the route
// maths hold, the seabed flattens to sea level, the key never prints, and the pilot pages read real repo coordinates.

test("the restyle paints land, water and labels in the house tones and hides the clutter", () => {
  const base = {
    version: 8 as const, glyphs: "https://example.org/{fontstack}/{range}.pbf",
    sources: { openmaptiles: { type: "vector" as const, url: "https://example.org/tiles" } },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#f8f4f0" } },
      { id: "water", type: "fill", source: "openmaptiles", "source-layer": "water", paint: { "fill-color": "#c4d3e6" } },
      { id: "building", type: "fill", source: "openmaptiles", "source-layer": "building" },
      { id: "highway_minor", type: "line", source: "openmaptiles", "source-layer": "transportation" },
      { id: "highway_major_inner", type: "line", source: "openmaptiles", "source-layer": "transportation" },
      { id: "poi_label", type: "symbol", source: "openmaptiles", "source-layer": "poi", layout: { "text-font": ["Noto Sans Regular"] } },
      { id: "place_village", type: "symbol", source: "openmaptiles", "source-layer": "place" },
      { id: "place_city", type: "symbol", source: "openmaptiles", "source-layer": "place", layout: { "icon-image": "dot", "text-font": ["Noto Sans Regular"] } },
    ],
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s = houseStyle(base as any, { demSource: "dem", attribution: `${ATTRIBUTION.ofm} ${ATTRIBUTION.osm}` });
  const by = Object.fromEntries(s.layers.map((l) => [l.id, l as { layout?: Record<string, unknown>; paint?: Record<string, unknown> }]));
  assert.equal(by.background.paint?.["background-color"], TERRAIN.ground);
  assert.equal(by.water.paint?.["fill-color"], TERRAIN.water);
  for (const id of ["building", "highway_minor", "poi_label", "place_village"]) assert.equal(by[id].layout?.visibility, "none", `${id} should be hidden`);
  assert.notEqual(by.highway_major_inner.layout?.visibility, "none");
  assert.equal(by.place_city.paint?.["text-color"], TERRAIN.label);
  assert.equal(by.place_city.layout?.["icon-image"], undefined);
  // the hillshade sits under the first line, the sky is warm mist, attribution names OSM and OpenFreeMap
  const ix = s.layers.findIndex((l) => l.id === "jw-hillshade");
  assert.ok(ix > 0 && ix < s.layers.findIndex((l) => l.id === "highway_minor"));
  assert.equal(s.sky?.["fog-color"], TERRAIN.fog);
  const attr = String((s.sources.openmaptiles as { attribution?: string }).attribution);
  assert.match(attr, /OpenStreetMap contributors/);
  assert.match(attr, /OpenFreeMap/);
  assert.match(ATTRIBUTION.aws, /Mapzen, AWS Terrain Tiles/);
  assert.equal(groundStyle("dem").layers.length, 2);
  // an unknown layer type passes through untouched
  assert.equal(houseLayer({ id: "x", type: "sky" } as never).id, "x");
});

test("route maths: bounds, legs along sea paths, partial lines and bearings", () => {
  const stops = [{ name: "A", lat: 0, lng: 0 }, { name: "B", lat: 0, lng: 2, path: [[0, 0], [1, 1], [2, 0]] as [number, number][] }, { name: "C", lat: 1, lng: 2 }];
  assert.deepEqual(boundsOf(stops), [[0, 0], [2, 1]]);
  const legs = legsOf(stops);
  assert.equal(legs.length, 2);
  assert.deepEqual(legs[0], [[0, 0], [1, 1], [2, 0]]);
  assert.deepEqual(legs[1], [[2, 0], [2, 1]]);
  const half = partOf(legs[0], 0.5);
  assert.deepEqual(half.at(-1), [1, 1]);
  assert.deepEqual(partOf(legs[0], 1), legs[0]);
  assert.equal(Math.round(bearingOf([0, 0], [0, 1])), 0);
  assert.equal(Math.round(bearingOf([0, 0], [1, 0])), 90);
});

test("the seabed flattens to sea level and land is left alone", () => {
  // Terrarium: (100, 0, 0) is -7168 m, (130, 10, 0) is +522 m
  const t = new Uint8ClampedArray([100, 0, 0, 255, 130, 10, 0, 255]);
  clampSeabed(t, "terrarium");
  assert.deepEqual([...t], [128, 0, 0, 255, 130, 10, 0, 255]);
  // Mapbox: (1, 0, 0) is -3446 m, (1, 140, 0) is +154 m
  const m = new Uint8ClampedArray([1, 0, 0, 255, 1, 140, 0, 255]);
  clampSeabed(m, "mapbox");
  assert.deepEqual([...m], [1, 134, 160, 255, 1, 140, 0, 255]);
});

test("a MapTiler key never prints", () => {
  assert.equal(redact("https://api.maptiler.com/tiles/x/tiles.json?key=abc123&v=2"), "https://api.maptiler.com/tiles/x/tiles.json?key=***&v=2");
  const src = readFileSync(new URL("../components/maps/terrain/TerrainMap.tsx", import.meta.url), "utf8");
  for (const m of src.matchAll(/console\.(log|warn|error)\(([^;]*)\)/g)) assert.match(m[2], /redact\(|^"\[terrain pilot\]"$/, `unredacted log: ${m[0]}`);
});

test("3D terrain shows only on the allow-listed pages", async () => {
  const { TERRAIN_PAGES, terrainOn } = await import("../components/maps/terrain/flag.ts");
  assert.deepEqual([...TERRAIN_PAGES].sort(), ["destinations/oceania/fiji/beqa-lagoon-and-pacific-harbour", "destinations/oceania/fiji/yasawa-islands", "destinations/oceania/tahiti#tahaa", "stays/ulum-moab", "voyages/indonesia/komodo-and-flores-charter", "voyages/ships/natural-paradise-yacht"]);
  for (const p of TERRAIN_PAGES) assert.equal(terrainOn(p), true);
  assert.equal(terrainOn("voyages/indonesia/raja-ampat-and-misool-charter"), false);
  assert.equal(terrainOn("stays/some-other-stay"), false);
  assert.doesNotMatch(readFileSync(new URL("../next.config.ts", import.meta.url), "utf8"), /NEXT_PUBLIC_TERRAIN_PILOT:/);
});

test("flown legs arc along a great circle and the vehicle heads along the line", async () => {
  const { arcOf, headingAt, isAir } = await import("../components/maps/terrain/geo.ts");
  const arc = arcOf([115.17, -8.75], [119.89, -8.49], 20);
  assert.equal(arc.length, 21);
  assert.deepEqual(arc[0], [115.17, -8.75]);
  assert.deepEqual(arc[20], [119.89, -8.49]);
  assert.ok(isAir({ mode: "air" }) && isAir({ mode: "Flight" }) && !isAir({ mode: "sea" }) && !isAir({}));
  const air = legsOf([{ lat: 0, lng: 0, name: "a" }, { lat: 0, lng: 10, name: "b", mode: "air" }]);
  assert.ok(air[0].length > 2, "a flown leg is an arc, not a straight pair");
  const h = headingAt([[0, 0], [0, 1], [1, 1]], 0.25);
  assert.ok(Math.abs(h.bearing) < 0.5 && Math.abs(h.at[1] - 0.5) < 1e-3, "heading north on the first segment");
  assert.ok(Math.abs(headingAt([[0, 0], [0, 1], [1, 1]], 1).bearing - 90) < 1, "heading east at the end");
});

test("the pilot pages read real coordinates from the repo", () => {
  const j = JSON.parse(readFileSync(new URL("../lib/content/ships/journeys.json", import.meta.url), "utf8"));
  const komodo = (j.journeys ?? j).find((x: { slug: string }) => x.slug === "komodo-and-flores-charter");
  assert.ok(komodo.days.length >= 5 && komodo.days.every((d: { lat: number; lng: number }) => Number.isFinite(d.lat) && Number.isFinite(d.lng)));
  const np = JSON.parse(readFileSync(new URL("../lib/content/ships/galapagos/natural-paradise-yacht.json", import.meta.url), "utf8"));
  const weeks = np.itineraries.filter((i: { nights: number }) => i.nights === 7);
  assert.equal(weeks.length, 2);
  for (const w of weeks) assert.ok(w.days.every((d: { lat: number; lng: number }) => d.lat < 1 && d.lat > -2 && d.lng < -89 && d.lng > -92));
  const stays = JSON.parse(readFileSync(new URL("../lib/content/stays.json", import.meta.url), "utf8")).stays;
  const ulum = stays.find((s: { slug: string }) => s.slug === "ulum-moab");
  assert.ok(ulum?.coords, "Ulum Moab keeps its own coordinates");
});

test("satellite tiles never fade in from white, and the ground under them is not Paper", async () => {
  const { satelliteLayer, groundOf, SKY_SATELLITE, TILE_CACHE, pixelRatioFor } = await import("../components/maps/terrain/style.ts");
  const l = satelliteLayer() as { paint?: Record<string, unknown> };
  assert.equal(l.paint?.["raster-fade-duration"], 0);
  assert.notEqual(groundOf(true).toUpperCase(), "#FFFFFF");
  assert.equal(groundOf(false), TERRAIN.ground);
  for (const k of ["sky-color", "horizon-color", "fog-color"] as const) assert.notEqual(String(SKY_SATELLITE[k]).toUpperCase(), "#FFFFFF");
  assert.ok(TILE_CACHE.maxTileCacheZoomLevels > 5);
  assert.equal(pixelRatioFor(3, 390), 1.5);
  assert.equal(pixelRatioFor(3, 1440), 2);
  assert.equal(pixelRatioFor(1, 1440), 1);
});

test("in Satellite the imagery covers sea and land, with an earth and an ocean tone under loading tiles", async () => {
  const { viewOps, satelliteIndex, SATELLITE } = await import("../components/maps/terrain/style.ts");
  const base = [
    { id: "background", type: "background" },
    { id: "landcover", type: "fill", "source-layer": "landcover" },
    { id: "river", type: "line", "source-layer": "waterway" },
    { id: "water", type: "fill", "source-layer": "water" },
    { id: "jw-hillshade", type: "hillshade" },
    { id: "jw-satellite", type: "raster", layout: { visibility: "none" } },
    { id: "road_minor", type: "line", "source-layer": "transportation", layout: { visibility: "none" } },
    { id: "place_city", type: "symbol", "source-layer": "place" },
  ];
  assert.equal(satelliteIndex(base.filter((l) => l.id !== "jw-satellite")), 6);
  const on = Object.fromEntries(viewOps(base, true, "terrain").map((o) => [`${o.id}.${o.prop}`, o.value]));
  assert.equal(on["jw-satellite.visibility"], "visible");
  assert.equal(on["background.background-color"], SATELLITE.ground);
  assert.equal(on["water.fill-color"], SATELLITE.sea);
  assert.equal(on["landcover.visibility"], "none");
  assert.equal(on["river.visibility"], "none");
  assert.equal(on["jw-hillshade.visibility"], "none");
  assert.equal(on["place_city.visibility"], undefined); // labels stay
  const off = Object.fromEntries(viewOps(base, false, "terrain").map((o) => [`${o.id}.${o.prop}`, o.value]));
  assert.equal(off["landcover.visibility"], "visible");
  assert.equal(off["road_minor.visibility"], "none"); // a layer hidden by the chart restyle stays hidden
  assert.equal(off["water.fill-color"], TERRAIN.water);
  assert.equal(off["jw-hillshade.visibility"], "visible");
  assert.equal(viewOps(base, false, "flat").find((o) => o.id === "jw-hillshade")?.value, "none");
});
