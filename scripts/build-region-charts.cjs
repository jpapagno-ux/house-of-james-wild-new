// Builds a Ledger chart for every region page (lib/content/regions.json) from
// Natural Earth 1:50m (world-atlas, public domain): the region's countries as
// the focus, their neighbours in paper, a graticule and labels, as plain SVG
// path data. The frame fits the region's live countries plus every stay in
// the region with a position on file. Run: node scripts/build-region-charts.cjs
const fs = require("fs");
const { feature } = require("topojson-client");
const topo = require("world-atlas/countries-50m.json");
const FEATS = feature(topo, topo.objects.countries).features;
const regions = require("../lib/content/regions.json").regions;
const library = require("../lib/content/countries-library.json").countries;
const stays = require("../lib/content/stays.json").stays;

const W = 1000;
// Country slugs the library doesn't carry an atlas name for
const ATLAS = { "south-africa": "South Africa", indonesia: "Indonesia", greece: "Greece", "costa-rica": "Costa Rica", "spain-isla-mallorca": "Spain", chile: "Chile" };
// Hand frames [w, s, e, n] where the stays alone would mislead
const FRAME = {
  "polar-antarctica": [-75, -72, -50, -58], // the Peninsula
  "polar-arctic": [-30, 60, 35, 82],
  oceania: [110, -48, 215, -8], // wraps the antimeridian: Australia to Tahiti
  "usa-canada": [-128, 24, -92, 52], // the mountain west and the coast; Hawaii has its own chart
  "caribbean-mexico": [-112, 12, -60, 32],
  "south-america": [-94, -57, -33, 14], // the Galápagos in, Easter Island on its own chart
  asia: [78, -12, 128, 24],
};
const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);
const ringBox = (ring) => ring.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
const area = (ring) => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a / 2); };
const centroid = (ring) => { let x = 0, y = 0; ring.forEach(([a, b]) => { x += a; y += b; }); return [x / ring.length, y / ring.length]; };
const shift = (wrap) => (ring) => (wrap ? ring.map(([x, y]) => [x < 0 ? x + 360 : x, y]) : ring);

const out = {};
for (const r of regions) {
  const slugs = r.countries.map((c) => c.slug).filter(Boolean);
  const names = new Set(slugs.map((s) => ATLAS[s] || (library.find((c) => c.slug === s) || {}).atlasName).filter(Boolean));
  const focus = FEATS.filter((f) => names.has(f.properties.name));
  const pts = stays.filter((s) => s.regionSlug === r.slug && s.coords).map((s) => [s.coords.lng, s.coords.lat]);
  if (!focus.length && !pts.length && !FRAME[r.slug]) { console.log("skip", r.slug); continue; }

  let B = FRAME[r.slug] ? FRAME[r.slug].slice() : null;
  const wrap = !!(B && B[2] > 180) || r.slug === "oceania";
  const S = shift(wrap);
  if (!B) {
    // the main outline of each focus country, plus the stays
    const boxes = focus.map((f) => { const main = polysOf(f.geometry).reduce((m, p) => (area(p[0]) > area(m[0]) ? p : m), polysOf(f.geometry)[0]); return ringBox(S(main[0])); });
    if (pts.length) boxes.push(ringBox(S(pts)));
    B = boxes.reduce((b, x) => [Math.min(b[0], x[0]), Math.min(b[1], x[1]), Math.max(b[2], x[2]), Math.max(b[3], x[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    // never wider than 75° of longitude: trim to where the stays are
    if (B[2] - B[0] > 75 && pts.length) { const sb = ringBox(S(pts)); B = [sb[0] - 4, sb[1] - 3, sb[2] + 4, sb[3] + 3]; }
  }
  let pw = (B[2] - B[0]) * 0.06, ph = (B[3] - B[1]) * 0.06;
  B = [B[0] - pw, B[1] - ph, B[2] + pw, B[3] + ph];
  const midLat = ((B[1] + B[3]) / 2) * Math.PI / 180;
  // keep the frame between 0.55 and 1.1 tall-to-wide
  const lngSpanForH = (B[3] - B[1]) / Math.cos(midLat) / 1.1;
  if (B[2] - B[0] < lngSpanForH) { const cx = (B[0] + B[2]) / 2; B[0] = cx - lngSpanForH / 2; B[2] = cx + lngSpanForH / 2; }
  const latSpanForW = (B[2] - B[0]) * Math.cos(midLat) * 0.55;
  if (B[3] - B[1] < latSpanForW) { const cy = (B[1] + B[3]) / 2; B[1] = cy - latSpanForW / 2; B[3] = cy + latSpanForW / 2; }
  const bounds = { w: +B[0].toFixed(3), s: +B[1].toFixed(3), e: +B[2].toFixed(3), n: +B[3].toFixed(3) };
  const kx = W / (bounds.e - bounds.w), ky = kx / Math.cos(((bounds.s + bounds.n) / 2) * Math.PI / 180);
  const H = Math.round((bounds.n - bounds.s) * ky);
  const P = ([x, y]) => [+((x - bounds.w) * kx).toFixed(1), +((bounds.n - y) * ky).toFixed(1)];
  const inside = (rb) => !(rb[2] < bounds.w || rb[0] > bounds.e || rb[3] < bounds.s || rb[1] > bounds.n);
  const ringPath = (ring) => {
    const rr = S(ring); const rb = ringBox(rr); if (!inside(rb) || rb[2] - rb[0] > 180) return "";
    let last = null; const pp = [];
    for (const pt of rr) {
      let q = P(pt); q = [Math.max(-40, Math.min(W + 40, q[0])), Math.max(-40, Math.min(H + 40, q[1]))];
      if (!last || Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) > 2.4) { pp.push(q); last = q; }
    }
    return pp.length > 2 ? "M" + pp.map((q) => q.join(",")).join("L") + "Z" : "";
  };
  const geomPath = (g) => polysOf(g).map((poly) => poly.map(ringPath).join("")).join("");
  const neighbors = [], nlabels = [], flabels = [];
  for (const g of FEATS) {
    const d = geomPath(g.geometry); if (!d) continue;
    const isFocus = focus.includes(g);
    if (!isFocus) neighbors.push({ name: g.properties.name, d });
    const big = polysOf(g.geometry).map((p) => S(p[0])).filter((rr) => inside(ringBox(rr))).sort((a, b) => area(b) - area(a))[0];
    if (big) {
      const [x, y] = centroid(big);
      if (x > bounds.w && x < bounds.e && y > bounds.s && y < bounds.n) {
        const l = { a: area(big), x: P([x, y])[0], y: P([x, y])[1], text: g.properties.name.toUpperCase() };
        (isFocus ? flabels : nlabels).push(l);
      }
    }
  }
  const span = bounds.n - bounds.s; const step = span > 30 ? 10 : span > 12 ? 5 : 2;
  const lats = [], lngs = [];
  for (let v = Math.ceil(bounds.s / step) * step; v < bounds.n; v += step) lats.push({ v: +v.toFixed(2), y: P([bounds.w, v])[1] });
  for (let v = Math.ceil(bounds.w / step) * step; v < bounds.e; v += step) lngs.push({ v: +(v > 180 ? v - 360 : v).toFixed(2), x: P([v, bounds.n])[0] });
  const cx = (bounds.w + bounds.e) / 2, cy = (bounds.s + bounds.n) / 2;
  out[r.slug] = {
    width: W, height: H, bounds, kx: +kx.toFixed(4), ky: +ky.toFixed(4), wrap,
    focus: focus.map((f) => geomPath(f.geometry)).join(""),
    neighbors,
    labels: { country: { x: P([cx, cy])[0], y: 28, text: r.name }, neighbors: [...flabels.sort((a, b) => b.a - a.a).slice(0, 8), ...nlabels.sort((a, b) => b.a - a.a).slice(0, 4)].map(({ a, ...l }) => l), seas: [], areas: [] },
    lats, lngs,
  };
  console.log(r.slug, focus.length, "countries,", pts.length, "stays, frame", bounds);
}
fs.writeFileSync("lib/charts/regions.json", JSON.stringify(out));
console.log(Object.keys(out).length, "region charts,", (fs.statSync("lib/charts/regions.json").size / 1024).toFixed(0) + "KB");
