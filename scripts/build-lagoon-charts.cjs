// French Polynesia charts (James, 2 Nov 2026): the zoom-in lagoon views (Taha'a first, then Bora Bora, Tikehau,
// Fakarava, Rangiroa and Tahiti Iti) and the whole-country island-hopping chart. Land from Natural Earth 1:10m via
// world-atlas (public domain), the same stock as the country charts; at this scale the atolls are coarse, so each
// lagoon view also carries an indicative reef ring (drawn by hand from the island's shape, labelled indicative on
// the page). Every point on these maps lives in lib/content/french-polynesia.ts with its source.
// Output: lib/charts/lagoons.json. Run: node scripts/build-lagoon-charts.cjs
const fs = require("fs");
const { feature } = require("topojson-client");
const topo = require("world-atlas/countries-10m.json");
const FP = feature(topo, topo.objects.countries).features.find((f) => /Polyn/.test(f.properties.name));

// [w, s, e, n] frames. Keep in step with LAGOONS in lib/content/french-polynesia.ts.
const FRAMES = {
  tahaa: [-151.72, -16.98, -151.3, -16.52],
  "bora-bora": [-151.86, -16.58, -151.62, -16.4],
  tikehau: [-148.36, -15.13, -148.0, -14.92],
  fakarava: [-145.9, -16.6, -145.3, -16.0],
  rangiroa: [-148.0, -15.32, -147.1, -14.86],
  "tahiti-iti": [-149.65, -17.92, -149.12, -17.48],
  whole: [-154.2, -23.9, -134.2, -7.6],
};
const WIDTH = { whole: 1000 };
function chart(key, [w, s, e, n]) {
  const lat0 = ((s + n) / 2) * (Math.PI / 180);
  const width = WIDTH[key] ?? 900;
  const kx = width / (e - w);
  const ky = kx / Math.cos(lat0);
  const height = Math.round((n - s) * ky);
  const P = ([lng, lat]) => [+((lng - w) * kx).toFixed(1), +((n - lat) * ky).toFixed(1)];
  const inBox = ([lng, lat]) => lng >= w - 0.3 && lng <= e + 0.3 && lat >= s - 0.3 && lat <= n + 0.3;
  const polys = FP.geometry.coordinates.filter((p) => p[0].some(inBox));
  const d = polys.map((p) => p.map((ring) => "M" + ring.map(P).map((q) => q.join(",")).join("L") + "Z").join("")).join("");
  return { width, height, bounds: { w, s, e, n }, kx: +kx.toFixed(4), ky: +ky.toFixed(4), land: d };
}
const out = Object.fromEntries(Object.entries(FRAMES).map(([k, f]) => [k, chart(k, f)]));
fs.writeFileSync("lib/charts/lagoons.json", JSON.stringify(out));
console.log(Object.entries(out).map(([k, v]) => `${k} ${v.width}x${v.height} ${v.land.length}b`).join("\n"));
