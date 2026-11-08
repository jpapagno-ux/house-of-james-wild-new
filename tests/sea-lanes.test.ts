import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { cutFor, legsOf, smoothLine, type LngLat, type TerrainStop } from "../components/maps/terrain/geo.ts";

// Sea lanes (James, 3 Nov 2026: the line must go round the islands, never across them). Every sailed leg of every route
// file (public/maps/routes, the one source the engraved chart, its SVG figure and the 3D terrain map all draw) must stay
// off the land the chart itself draws (public/maps/data/<dest>/base.geojson, the coastline scripts/sealanes.py routes
// round). The only land a leg may touch is its own landing: within 3 km of an anchorage, or, where the chart puts the
// stop inland, as far as the nearest charted water plus 1.5 km. River charts (a river overlay: the Nile) are not seas.

type Ring = LngLat[];
type Poly = { box: [number, number, number, number]; rings: Ring[] };
const KM = 111.32;
const SEA = new Set(["sea", "ship", "vessel", "boat", "zodiac", "kayak"]);
const MAPS = "public/maps";
const lands = new Map<string, Poly[]>();

function landOf(dest: string): Poly[] {
  if (lands.has(dest)) return lands.get(dest)!;
  // The OSM coastline the MapTiler 3D map draws (scripts/data/coast, James, 8 Nov 2026), else the chart's own land.
  const coast = `scripts/data/coast/${dest === "antarctica" ? "polar" : dest}.geojson`;
  const f = dest && existsSync(coast) ? coast : `${MAPS}/data/${dest}/base.geojson`;
  const out: Poly[] = [];
  if (dest && existsSync(f) && !existsSync(`${MAPS}/data/${dest}/overlay.geojson`)) {
    for (const ft of JSON.parse(readFileSync(f, "utf8")).features as { properties?: { layer?: string }; geometry: { type: string; coordinates: unknown } }[]) {
      if ((ft.properties?.layer ?? "land") !== "land") continue;
      const polys = (ft.geometry.type === "MultiPolygon" ? ft.geometry.coordinates : ft.geometry.type === "Polygon" ? [ft.geometry.coordinates] : []) as Ring[][];
      for (const rings of polys) {
        const xs = rings[0].map((p) => p[0]), ys = rings[0].map((p) => p[1]);
        out.push({ box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], rings });
      }
    }
  }
  lands.set(dest, out);
  return out;
}

const inRing = (p: LngLat, r: Ring) => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    if ((r[i][1] > p[1]) !== (r[j][1] > p[1]) && p[0] < ((r[j][0] - r[i][0]) * (p[1] - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) c = !c;
  }
  return c;
};
const onLand = (p: LngLat, land: Poly[]) => land.some((q) => p[0] >= q.box[0] && p[0] <= q.box[2] && p[1] >= q.box[1] && p[1] <= q.box[3] && inRing(p, q.rings[0]) && !q.rings.slice(1).some((h) => inRing(p, h)));
const km = (a: LngLat, b: LngLat) => Math.hypot((b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * Math.PI / 180) * KM, (b[1] - a[1]) * KM);
/** km from a point to the nearest charted coast (any ring edge). */
function toCoast(p: LngLat, land: Poly[]) {
  let best = Infinity;
  const k = Math.cos(p[1] * Math.PI / 180);
  for (const q of land) for (const r of q.rings) for (let i = 1; i < r.length; i++) {
    const ax = (r[i - 1][0] - p[0]) * k * KM, ay = (r[i - 1][1] - p[1]) * KM, bx = (r[i][0] - p[0]) * k * KM, by = (r[i][1] - p[1]) * KM;
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return best;
}
const reach = (p: LngLat, land: Poly[]) => (onLand(p, land) ? toCoast(p, land) + 1.5 : 3); // an inland pin: 1.5 km past the shore (James, 8 Nov 2026), as scripts/sealanes.py INLAND_KM

/** The first point of a leg's polyline that crosses charted land outside the two landings, or null. */
function crossing(line: LngLat[], land: Poly[]): LngLat | null {
  const a = line[0], b = line[line.length - 1], ra = reach(a, land), rb = reach(b, land);
  for (let i = 1; i < line.length; i++) {
    const n = Math.max(2, Math.ceil(km(line[i - 1], line[i]) / 0.1));
    for (let s = 0; s <= n; s++) {
      const p: LngLat = [line[i - 1][0] + ((line[i][0] - line[i - 1][0]) * s) / n, line[i - 1][1] + ((line[i][1] - line[i - 1][1]) * s) / n];
      if (km(p, a) > ra && km(p, b) > rb && onLand(p, land)) return p;
    }
  }
  return null;
}

type RouteFile = { id: string; destination?: string; type?: string; stops: (TerrainStop & { lane?: string })[] };
const ROUTES = readdirSync(`${MAPS}/routes`).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(`${MAPS}/routes/${f}`, "utf8")) as RouteFile);
const sailed = (r: RouteFile) => r.type !== "overland" && landOf(r.destination ?? "").length > 0;

test("no sailed leg in any route file crosses the land the chart draws", () => {
  const bad: string[] = [];
  let legs = 0;
  for (const r of ROUTES.filter(sailed)) {
    const land = landOf(r.destination!);
    r.stops.slice(1).forEach((s, i) => {
      if (!SEA.has(String(s.mode ?? "sea").toLowerCase())) return;
      legs++;
      const line = (s.path && s.path.length > 1 ? s.path : [[r.stops[i].lng, r.stops[i].lat], [s.lng, s.lat]]) as LngLat[];
      const hit = crossing(line, land);
      if (hit) bad.push(`${r.id}: ${r.stops[i].name} > ${s.name} crosses land at ${hit[1].toFixed(3)}, ${hit[0].toFixed(3)}`);
    });
  }
  assert.ok(legs > 300, `only ${legs} sailed legs checked`);
  assert.deepEqual(bad, []);
});

test("the 3D map draws the routed lanes, rounded, and they still keep off the land", () => {
  for (const id of ["komodo-and-flores-charter-6n", "natural-paradise-yacht-baltra-to-san-cristobal-tuesday-to-tuesday-7n", "natural-paradise-yacht-san-cristobal-to-baltra-tuesday-to-tuesday-7n"]) {
    const r = ROUTES.find((x) => x.id === id)!;
    assert.ok(r, id);
    const land = landOf(r.destination!);
    const legs = legsOf(r.stops);
    assert.ok(r.stops.some((s) => s.lane === "sea"), `${id}: no leg routed round land`);
    legs.forEach((leg, i) => {
      const s = r.stops[i + 1];
      if (s.path && s.path.length > 2) assert.ok(leg.length >= s.path.length, `${id} leg ${i + 1}: the 3D leg is not the routed path`);
      const round = smoothLine(leg, cutFor(s));
      assert.deepEqual(round[0], leg[0]); assert.deepEqual(round[round.length - 1], leg[leg.length - 1]);
      if (SEA.has(String(s.mode ?? "sea"))) assert.equal(crossing(round, land), null, `${id}: ${r.stops[i].name} > ${s.name} (rounded) crosses land`);
    });
  }
});

test("Komodo: the first leg sails round the north of Komodo Island, not over its mountains", () => {
  const r = ROUTES.find((x) => x.id === "komodo-and-flores-charter-6n")!;
  const leg = r.stops[1];
  assert.equal(leg.name, "Sape Bay");
  assert.ok(leg.path!.length > 2);
  // Komodo's northern tip is about 8.43 S: the lane passes north of it.
  assert.ok(Math.max(...leg.path!.map((p) => p[1])) > -8.45);
  const straight: LngLat[] = [[r.stops[0].lng, r.stops[0].lat], [leg.lng, leg.lat]];
  assert.notEqual(crossing(straight, landOf("komodo")), null, "the straight line would cross Komodo (the bug this guards)");
});

test("every sailed line the 3D map draws (the routed lane, rounded) keeps off the OSM coast, site wide", () => {
  // James, 8 Nov 2026: "you don't want them going through the islands": all waters, not just the pilots.
  const bad: string[] = [];
  for (const r of ROUTES.filter(sailed)) {
    const land = landOf(r.destination!);
    legsOf(r.stops).forEach((leg, i) => {
      const s = r.stops[i + 1];
      if (!SEA.has(String(s.mode ?? "sea").toLowerCase())) return;
      const hit = crossing(smoothLine(leg, cutFor(s)), land);
      if (hit) bad.push(`${r.id}: ${r.stops[i].name} > ${s.name} (rounded) at ${hit[1].toFixed(3)}, ${hit[0].toFixed(3)}`);
    });
  }
  assert.deepEqual(bad, []);
});

test("the waters James named have OSM coastlines to route round: Galapagos, Antarctica and the polar seas, Fiji", () => {
  for (const d of ["galapagos", "antarctica", "polar", "fiji"]) assert.ok(landOf(d).length > 20, `${d}: no coastline`);
});
