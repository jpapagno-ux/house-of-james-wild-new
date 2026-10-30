// Ledger charts for every region page (James, 30 Oct 2026: "pin all locations", Europe and the
// polar regions included). Natural Earth 1:50m via world-atlas (public domain), the same stock and
// projection as the country charts: the countries that hold Ledger records in ink, their
// neighbours faint, a graticule, sea and country labels. Frames fit the region's stays unless set
// by hand (the polar charts, mainland USA). Output: lib/charts/regions.json.
// Run: node scripts/build-region-charts.cjs
const fs = require("fs");
const { feature } = require("topojson-client");
const topo = require("world-atlas/countries-50m.json");
const FEATS = feature(topo, topo.objects.countries).features;
const stays = require("../lib/content/stays.json").stays;
const reserves = require("../lib/content/reserves.json");

const W = 1000;
// Hand frames [w, s, e, n] and fixed focus countries where the stays alone would mislead.
const REGIONS = {
  africa: { seas: [["Atlantic Ocean", -22, 4], ["Indian Ocean", -22, 50], ["Mozambique Channel", -18, 40.5]] },
  asia: { seas: [["Indian Ocean", -6, 85], ["South China Sea", 12, 113], ["Java Sea", -5, 110], ["Andaman Sea", 10, 96]] },
  "usa-canada": { frame: [-125, 30, -100, 50], seas: [["Pacific Ocean", 36, -123.2]] },
  "caribbean-mexico": { seas: [["Gulf of Mexico", 24.5, -91], ["Caribbean Sea", 17, -82], ["Pacific Ocean", 16, -104]] },
  oceania: { wrap: true, seas: [["Coral Sea", -18, 155], ["Tasman Sea", -38, 162], ["South Pacific Ocean", -28, 195]] },
  "south-america": { seas: [["Pacific Ocean", -20, -88], ["Atlantic Ocean", -30, -40]] },
  europe: { frame: [-30, 35, 17, 57.5], seas: [["Atlantic Ocean", 50, -20], ["Mediterranean Sea", 37.5, 6], ["Bay of Biscay", 45.4, -4.8], ["Irish Sea", 53.6, -5.3]] },
  // Country guides without a library chart (Indonesia is told as a guide, by sea).
  indonesia: { country: "indonesia", frame: [102.5, -11.5, 135.5, 4.5], seas: [["Java Sea", -5.2, 111], ["Banda Sea", -5.6, 127.5], ["Indian Ocean", -10.4, 106], ["Pacific Ocean", 1.8, 134.5]] },
  "polar-antarctica": { frame: [-82, -72, -44, -50], focus: ["Antarctica"], seas: [["Drake Passage", -58.5, -64], ["Weddell Sea", -68, -50], ["Bellingshausen Sea", -69.5, -79], ["Scotia Sea", -56.5, -50]], areas: [["Antarctic Peninsula", -66.2, -64.6], ["Ushuaia", -55.3, -67.6], ["Punta Arenas", -52.7, -71.6], ["South Shetland Islands", -61.6, -57.4]] },
  "polar-arctic": { frame: [-62, 58, 34, 82], focus: ["Greenland", "Iceland", "Norway"], seas: [["Greenland Sea", 75, -8], ["Norwegian Sea", 68, 3], ["Baffin Bay", 72.5, -63], ["Denmark Strait", 67, -26], ["Barents Sea", 74.5, 31]], areas: [["Svalbard", 80.3, 20], ["Reykjavík", 63.6, -21.94]] },
};

const polysOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);
const ringBox = (ring) => ring.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [Infinity, Infinity, -Infinity, -Infinity]);
const area = (ring) => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a / 2); };
const centroid = (ring) => { let x = 0, y = 0; ring.forEach(([a, b]) => { x += a; y += b; }); return [x / ring.length, y / ring.length]; };
const pip = ([x, y], ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const inFeat = (pt, f) => polysOf(f.geometry).some((p) => pip(pt, p[0]));

const points = (slug) => {
  const only = REGIONS[slug].country;
  const pts = stays.filter((s) => (only ? s.countrySlug === only : s.regionSlug === slug) && s.coords).map((s) => [s.coords.lng, s.coords.lat]);
  for (const r of reserves.reserves || reserves) if (!only && r.stay && r.stay.regionSlug === slug && r.stay.coords) pts.push([r.stay.coords.lng, r.stay.coords.lat]);
  return pts;
};

const out = {};
for (const [slug, cfg] of Object.entries(REGIONS)) {
  const wrap = !!cfg.wrap;
  const S = (ring) => (wrap ? ring.map(([x, y]) => [x < 0 ? x + 360 : x, y]) : ring);
  const pts = S(points(slug));
  let B;
  if (cfg.frame) B = cfg.frame.slice();
  else {
    if (!pts.length) { console.log("no points", slug); continue; }
    B = ringBox(pts);
    const pw = Math.max((B[2] - B[0]) * 0.1, 1.5), ph = Math.max((B[3] - B[1]) * 0.1, 1.5);
    B = [B[0] - pw, B[1] - ph, B[2] + pw, B[3] + ph];
    // keep the frame between 0.55 and 1.2 times as tall as it is wide
    const mid = ((B[1] + B[3]) / 2) * Math.PI / 180;
    const wdeg = (B[2] - B[0]) * Math.cos(mid), hdeg = B[3] - B[1];
    if (hdeg < wdeg * 0.55) { const cy = (B[1] + B[3]) / 2, h = wdeg * 0.55; B[1] = cy - h / 2; B[3] = cy + h / 2; }
    if (hdeg > wdeg * 1.2) { const cx = (B[0] + B[2]) / 2, w = hdeg / 1.2 / Math.cos(mid); B[0] = cx - w / 2; B[2] = cx + w / 2; }
  }
  const bounds = { w: +B[0].toFixed(3), s: +B[1].toFixed(3), e: +B[2].toFixed(3), n: +B[3].toFixed(3) };
  const kx = W / (bounds.e - bounds.w), ky = kx / Math.cos(((bounds.s + bounds.n) / 2) * Math.PI / 180);
  const H = Math.round((bounds.n - bounds.s) * ky);
  const P = ([x, y]) => [+((x - bounds.w) * kx).toFixed(1), +((bounds.n - y) * ky).toFixed(1)];
  const inside = (rb) => !(rb[2] < bounds.w || rb[0] > bounds.e || rb[3] < bounds.s || rb[1] > bounds.n);
  const ringPath = (ring) => {
    const r = S(ring); const rb = ringBox(r); if (!inside(rb) || (rb[2] - rb[0] > 300 && rb[1] > -60)) return ""; // the Antarctic ring circles the pole: kept, clamped to the frame
    let last = null; const pp = [];
    for (const pt of r) {
      let q = P(pt); q = [Math.max(-40, Math.min(W + 40, q[0])), Math.max(-40, Math.min(H + 40, q[1]))];
      if (!last || Math.abs(q[0] - last[0]) + Math.abs(q[1] - last[1]) > 1.6) { pp.push(q); last = q; }
    }
    return pp.length > 2 ? "M" + pp.map((q) => q.join(",")).join("L") + "Z" : "";
  };
  const geomPath = (g) => polysOf(g).map((poly) => poly.map(ringPath).join("")).join("");
  // focus: countries holding a Ledger record (or set by hand for the polar charts)
  const raw = points(slug);
  const focusNames = new Set(cfg.focus || FEATS.filter((f) => raw.some((p) => inFeat(p, f))).map((f) => f.properties.name));
  let focus = ""; const neighbors = [], flabels = [], nlabels = [];
  for (const g of FEATS) {
    const d = geomPath(g.geometry); if (!d) continue;
    const big = polysOf(g.geometry).map((p) => S(p[0])).filter((r) => inside(ringBox(r))).sort((a, b) => area(b) - area(a))[0];
    const lab = big ? (() => { const [x, y] = centroid(big); return x > bounds.w && x < bounds.e && y > bounds.s && y < bounds.n ? { a: area(big), x: P([x, y])[0], y: P([x, y])[1], text: g.properties.name.replace("United Republic of ", "").replace("Dem. Rep. Congo", "DR Congo").replace("United States of America", "United States").toUpperCase() } : null; })() : null;
    if (focusNames.has(g.properties.name)) { focus += d; if (lab) flabels.push(lab); }
    else { neighbors.push({ name: g.properties.name, d }); if (lab) nlabels.push(lab); }
  }
  const span = bounds.n - bounds.s; const step = span > 40 ? 10 : span > 20 ? 5 : span > 8 ? 2 : 1;
  const lats = [], lngs = [];
  for (let v = Math.ceil(bounds.s / step) * step; v < bounds.n; v += step) lats.push({ v: +v.toFixed(2), y: P([bounds.w, v])[1] });
  for (let v = Math.ceil(bounds.w / step) * step; v < bounds.e; v += step) lngs.push({ v: +(v > 180 ? v - 360 : v).toFixed(2), x: P([v, bounds.n])[0] });
  const L = ([text, lat, lng]) => { const [x, y] = P(S([[lng, lat]])[0]); return { x, y, text }; };
  const fl = flabels.sort((a, b) => b.a - a.a).slice(0, 12).map(({ a, ...l }) => l);
  out[slug] = {
    width: W, height: H, bounds, kx: +kx.toFixed(4), ky: +ky.toFixed(4), wrap,
    focus, neighbors,
    labels: {
      country: { x: -999, y: -999, text: "" },
      neighbors: [...fl, ...nlabels.sort((a, b) => b.a - a.a).slice(0, 6).map(({ a, ...l }) => l)],
      seas: (cfg.seas || []).map(L),
      areas: (cfg.areas || []).map(L),
    },
    lats, lngs,
  };
  console.log(slug, W, H, "focus:", [...focusNames].join(", "), "points:", raw.length);
}
fs.writeFileSync("lib/charts/regions.json", JSON.stringify(out));
console.log((fs.statSync("lib/charts/regions.json").size / 1024).toFixed(0) + "KB");
