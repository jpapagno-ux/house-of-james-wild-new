// Builds a Ledger chart for every library country page (lib/content/countries-library.json)
// from Natural Earth 1:50m (world-atlas, public domain): the country, its neighbours, a
// graticule and labels, as plain SVG path data. Bounds fit the country, or for very large
// countries and US states the area around its stays. Run: node scripts/build-country-charts.cjs
const fs = require("fs");
const { feature } = require("topojson-client");
const topo = require("world-atlas/countries-50m.json");
const FEATS50 = feature(topo, topo.objects.countries).features;
// Small islands framed close (Ibiza) draw from the 1:10m stock, as the region insets do; at 1:50m the coast is a polygon.
const topo10 = require("world-atlas/countries-10m.json");
const FEATS10 = feature(topo10, topo10.objects.countries).features;
const FINE = new Set(["spain-ibiza"]);
const countries = require("../lib/content/countries-library.json").countries;
const stays = require("../lib/content/stays.json").stays;

const W = 1000;
// Hand-set frames where the stays sit in one corner of a scattered country (Society Islands, not the Marquesas).
// Ibiza: the island, not the whole of Spain.
const FRAME = { tahiti: [-152.4, -18.0, -147.4, -14.6], "spain-ibiza": [1.05, 38.75, 1.85, 39.2] };
// Place names drawn on a country's chart (lat, lng, text; the text starts at the point). Set by hand,
// sparingly, where the stays sit far apart (Guatemala, 1 Nov 2026: the Petén and the highlands).
const AREAS = {
  guatemala: [[16.45, -90.75, "Petén"], [17.24, -89.62, "Tikal"], [17.1, -89.98, "Lake Petén Itzá"],
    [14.45, -90.97, "Antigua"], [14.62, -91.42, "Lake Atitlán"], [14.66, -90.5, "Guatemala City"]],
};
const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);
const ringBox = (ring) => ring.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
const area = (ring) => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a / 2); };
const centroid = (ring) => { let x = 0, y = 0; ring.forEach(([a, b]) => { x += a; y += b; }); return [x / ring.length, y / ring.length]; };
const shift = (wrap) => (ring) => (wrap ? ring.map(([x, y]) => [x < 0 ? x + 360 : x, y]) : ring);

const out = {};
for (const c of countries) {
  const FEATS = FINE.has(c.slug) ? FEATS10 : FEATS50;
  const f = FEATS.find((x) => x.properties.name === c.atlasName);
  if (!f) { console.log("no geometry", c.slug, c.atlasName); continue; }
  let wrap = false;
  let polys = polysOf(f.geometry);
  const main = polys.reduce((m, p) => (area(p[0]) > area(m[0]) ? p : m), polys[0]);
  let box = ringBox(main[0]);
  // stays more than 3 degrees outside the country's own outline are mis-coded or offshore (Easter Island): left off the frame
  const fb = polysOf(f.geometry).map((p) => ringBox(p[0])).reduce((b, r) => [Math.min(b[0], r[0]), Math.min(b[1], r[1]), Math.max(b[2], r[2]), Math.max(b[3], r[3])]);
  const near = (x, y) => polysOf(f.geometry).some((p) => { const r = ringBox(p[0]); return x > r[0] - 3 && x < r[2] + 3 && y > r[1] - 3 && y < r[3] + 3; });
  const pts = stays.filter((s) => s.countrySlug === c.slug && s.coords && (c.useStays ? true : c.slug === "chile" ? s.coords.lng > -80 : near(s.coords.lng, s.coords.lat))).map((s) => [s.coords.lng, s.coords.lat]);
  if (c.slug === "chile") { /* frame the mainland */ }
  if (box[2] > 170 || pts.some(([x]) => x > 170)) wrap = true; // antimeridian (Fiji, NZ, Fr. Polynesia neighbours)
  const S = shift(wrap);
  box = ringBox(S(main[0]));
  const spanOf = (b) => Math.max(b[3] - b[1], (b[2] - b[0]) * Math.cos(((b[1] + b[3]) / 2) * Math.PI / 180));
  let B;
  if (FRAME[c.slug]) B = FRAME[c.slug].slice();
  const sp = pts.length ? ringBox(S(pts)) : null;
  if (B) { /* hand frame */ } else if (c.useStays || (spanOf(box) > 22 && sp)) {
    B = sp; const min = c.useStays ? 7 : 9;
    const cx = (B[0] + B[2]) / 2, cy = (B[1] + B[3]) / 2;
    const hw = Math.max((B[2] - B[0]) / 2, min / 2 / Math.cos(cy * Math.PI / 180)), hh = Math.max((B[3] - B[1]) / 2, min / 2);
    B = [cx - hw, cy - hh, cx + hw, cy + hh];
  } else {
    B = box;
    if (sp) B = [Math.min(B[0], sp[0]), Math.min(B[1], sp[1]), Math.max(B[2], sp[2]), Math.max(B[3], sp[3])];
    const cy = (B[1] + B[3]) / 2, minDeg = 1.2;
    if (B[3] - B[1] < minDeg) { B[1] = cy - minDeg / 2; B[3] = cy + minDeg / 2; }
    const cx = (B[0] + B[2]) / 2, minLng = minDeg / Math.cos(cy * Math.PI / 180);
    if (B[2] - B[0] < minLng) { B[0] = cx - minLng / 2; B[2] = cx + minLng / 2; }
  }
  // pad 8%, then keep the frame no taller than 1.35x its width
  let pw = (B[2] - B[0]) * 0.08, ph = (B[3] - B[1]) * 0.08;
  B = [B[0] - pw, B[1] - ph, B[2] + pw, B[3] + ph];
  const midLat = ((B[1] + B[3]) / 2) * Math.PI / 180;
  const lngSpanForH = (B[3] - B[1]) / Math.cos(midLat) / 1.35;
  if (B[2] - B[0] < lngSpanForH) { const cx = (B[0] + B[2]) / 2; B[0] = cx - lngSpanForH / 2; B[2] = cx + lngSpanForH / 2; }
  const latSpanForW = (B[2] - B[0]) * Math.cos(midLat) * 0.55; // and no flatter than 0.55
  if (B[3] - B[1] < latSpanForW) { const cy = (B[1] + B[3]) / 2; B[1] = cy - latSpanForW / 2; B[3] = cy + latSpanForW / 2; }
  const bounds = { w: +B[0].toFixed(3), s: +B[1].toFixed(3), e: +B[2].toFixed(3), n: +B[3].toFixed(3) };
  const kx = W / (bounds.e - bounds.w), ky = kx / Math.cos(((bounds.s + bounds.n) / 2) * Math.PI / 180);
  const H = Math.round((bounds.n - bounds.s) * ky);
  const P = ([x, y]) => [+((x - bounds.w) * kx).toFixed(1), +((bounds.n - y) * ky).toFixed(1)];
  const inside = (rb) => !(rb[2] < bounds.w || rb[0] > bounds.e || rb[3] < bounds.s || rb[1] > bounds.n);
  const ringPath = (ring) => {
    const r = S(ring); const rb = ringBox(r); if (!inside(rb) || rb[2] - rb[0] > 180) return "";
    let last = null; const pp = [];
    for (const pt of r) {
      let q = P(pt); q = [Math.max(-40, Math.min(W + 40, q[0])), Math.max(-40, Math.min(H + 40, q[1]))]; // clamp far-off outline to just outside the frame
      if (!last || Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) > 2.4) { pp.push(q); last = q; }
    }
    return pp.length > 2 ? "M" + pp.map((q) => q.join(",")).join("L") + "Z" : "";
  };
  const geomPath = (g) => polysOf(g).map((poly) => poly.map(ringPath).join("")).join("");
  const neighbors = [], nlabels = [];
  for (const g of FEATS) {
    if (g === f) continue;
    const d = geomPath(g.geometry); if (!d) continue;
    neighbors.push({ name: g.properties.name, d });
    const big = polysOf(g.geometry).map((p) => S(p[0])).filter((r) => inside(ringBox(r))).sort((a, b) => area(b) - area(a))[0];
    if (big) { const [x, y] = centroid(big); if (x > bounds.w && x < bounds.e && y > bounds.s && y < bounds.n) nlabels.push({ a: area(big), ...{ x: P([x, y])[0], y: P([x, y])[1], text: g.properties.name.replace("United Republic of ", "").replace("Dem. Rep. Congo", "DR Congo") } }); }
  }
  const mainIn = S(main[0]);
  let [lx, ly] = inside(ringBox(mainIn)) ? centroid(mainIn) : [(bounds.w + bounds.e) / 2, (bounds.s + bounds.n) / 2];
  if (!(lx > bounds.w && lx < bounds.e && ly > bounds.s && ly < bounds.n)) { lx = (bounds.w + bounds.e) / 2; ly = (bounds.s + bounds.n) / 2; }
  const span = bounds.n - bounds.s; const step = span > 20 ? 5 : span > 8 ? 2 : span > 3 ? 1 : 0.5;
  const lats = [], lngs = [];
  for (let v = Math.ceil(bounds.s / step) * step; v < bounds.n; v += step) lats.push({ v: +v.toFixed(2), y: P([bounds.w, v])[1] });
  for (let v = Math.ceil(bounds.w / step) * step; v < bounds.e; v += step) lngs.push({ v: +(v > 180 ? v - 360 : v).toFixed(2), x: P([v, bounds.n])[0] });
  out[c.slug] = {
    width: W, height: H, bounds, kx: +kx.toFixed(4), ky: +ky.toFixed(4), wrap,
    focus: geomPath(f.geometry),
    neighbors,
    labels: { country: { x: P([lx, ly])[0], y: P([lx, ly])[1], text: c.chartLabel || c.name }, neighbors: nlabels.sort((a, b) => b.a - a.a).slice(0, 5).map(({ a, ...l }) => l), seas: [], areas: (AREAS[c.slug] || []).map(([la, ln, text]) => ({ x: P([ln, la])[0], y: P([ln, la])[1], text })) },
    lats, lngs,
  };
}
fs.writeFileSync("lib/charts/countries.json", JSON.stringify(out));
console.log(Object.keys(out).length, "charts,", (fs.statSync("lib/charts/countries.json").size / 1024).toFixed(0) + "KB");
