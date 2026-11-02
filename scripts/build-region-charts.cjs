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
// Small islands (the Galápagos zoom) draw from the 1:10m stock.
const topo10 = require("world-atlas/countries-10m.json");
const FEATS10 = feature(topo10, topo10.objects.countries).features;
const stays = require("../lib/content/stays.json").stays;
const reserves = require("../lib/content/reserves.json");
// Library country pages (scripts/export-countries.py). A destination card (staysComing, no stays yet:
// Sri Lanka first, 1 Nov 2026) is inked on its region chart like a country with stays.
const LIB_COUNTRIES = require("../lib/content/countries-library.json").countries;

const WIDTH = 1000;
// Hand frames [w, s, e, n] and fixed focus countries where the stays alone would mislead.
const REGIONS = {
  africa: { seas: [["Atlantic Ocean", -22, 4], ["Indian Ocean", -22, 50], ["Mozambique Channel", -18, 40.5]] },
  asia: { seas: [["Indian Ocean", -6, 85], ["South China Sea", 12, 113], ["Java Sea", -5, 110], ["Andaman Sea", 10, 96]] },
  "usa-canada": { frame: [-125, 30, -100, 50], seas: [["Pacific Ocean", 36, -123.2]] },
  "caribbean-mexico": { seas: [["Gulf of Mexico", 24.5, -91], ["Caribbean Sea", 17, -82], ["Pacific Ocean", 16, -104]] },
  oceania: { wrap: true, seas: [["Coral Sea", -18, 155], ["Tasman Sea", -38, 162], ["South Pacific Ocean", -28, 195]] },
  "south-america": { minN: 2.4, seas: [["Pacific Ocean", -20, -88], ["Atlantic Ocean", -30, -40]], areas: [["Rapa Nui", -26.3, -109.4]] },
  // The Galápagos, closer (James, 30 Oct 2026: "a zoom into Galápagos, as these smaller islands may need
  // that effect"). Shown as an inset on the South America chart and as its own chart on Ecuador's page.
  galapagos: { country: "ecuador-galapagos", hires: true, frame: [-92.15, -1.55, -89.05, 1.75], focus: ["Ecuador"], seas: [["Pacific Ocean", -1.25, -91.7]],
    areas: [["Isabela", -0.75, -91.15], ["Fernandina", -0.37, -91.62], ["Santiago", -0.22, -90.72], ["Santa Cruz", -0.62, -90.36], ["Baltra ✈", -0.38, -90.24], ["San Cristóbal ✈", -0.85, -89.45], ["Española", -1.38, -89.68], ["Floreana", -1.30, -90.44], ["Genovesa", 0.32, -89.95], ["Darwin", 1.67, -92.0], ["Wolf", 1.38, -91.82], ["Marchena", 0.33, -90.48], ["Pinta", 0.58, -90.75]] },
  // Rapa Nui (Easter Island), closer: the Chile chart frames the mainland on purpose, so the island's
  // pins live here, as an inset on the Chile page and on the Rapa Nui guide. 1:10m stock, like Galápagos.
  "rapa-nui": { country: "chile", hires: true, frame: [-109.55, -27.27, -109.17, -27.0], focus: ["Chile"], seas: [["Pacific Ocean", -27.24, -109.5]],
    areas: [["Hanga Roa ✈", -27.15, -109.43], ["Rano Kau · Orongo", -27.19, -109.43], ["Rano Raraku", -27.105, -109.3], ["Ahu Tongariki", -27.15, -109.265], ["Anakena", -27.07, -109.32], ["Terevaka", -27.085, -109.38], ["Poike", -27.09, -109.24]],
    // The UNESCO layer (Rapa Nui National Park, 1995): shown on the inset and as the landing of the flyover.
    unesco: ["715"] },
  // The Atacama and Uyuni, closer (James, 1 Nov 2026): the landing chart of the South America flyover.
  // Chile and Bolivia in ink, the salt flats, the Eduardo Avaroa reserve, the classic crossing and the
  // UNESCO sites in the frame. Outlines of the salt flats and the reserve are indicative, drawn by hand.
  "atacama-uyuni": { country: "chile", hires: true, frame: [-70.9, -24.3, -64.9, -18.2], focus: ["Chile", "Bolivia"],
    seas: [["Pacific Ocean", -21.6, -70.55]],
    areas: [["Atacama Desert", -23.35, -69.75], ["Altiplano", -18.95, -67.35]],
    countries: [["CHILE", -21.3, -69.4], ["BOLIVIA", -18.75, -66.0], ["ARGENTINA", -23.7, -65.8]],
    salt: [
      ["Salar de Uyuni", [[-68.20,-20.00],[-67.95,-19.85],[-67.70,-19.82],[-67.45,-19.88],[-67.20,-19.95],[-67.00,-20.10],[-66.95,-20.30],[-67.05,-20.50],[-67.30,-20.62],[-67.65,-20.66],[-67.95,-20.55],[-68.15,-20.30]]],
      ["Salar de Coipasa", "ellipse", -68.2, -19.38, 0.3, 0.17],
      ["Salar de Atacama", "ellipse", -68.25, -23.5, 0.2, 0.45],
    ],
    reserves: [["Eduardo Avaroa Reserve", [[-68.0,-21.65],[-67.15,-21.6],[-66.8,-22.1],[-67.05,-22.7],[-67.6,-22.9],[-67.85,-22.8],[-68.1,-22.3]], [-67.3, -21.82]]],
    route: [[-68.20,-22.91],[-67.80,-22.86],[-67.82,-22.80],[-67.78,-22.20],[-67.88,-22.05],[-67.98,-21.27],[-67.62,-20.24],[-66.83,-20.46]],
    marks: [["San Pedro de Atacama", -22.91, -68.2, "town"], ["Uyuni ✈", -20.46, -66.83, "town"], ["Calama ✈", -22.498, -68.904, "airport"], ["Laguna Colorada", -22.2, -67.78, "water"], ["Licancabur", -22.83, -67.88, "peak"]],
    unesco: ["420", "566", "1178", "1634"] },
  // Portugal, closer (1 Nov 2026): the landing chart of the Europe flyover. The Douro wine region and Dark Sky
  // Alqueva as dashed outlines (indicative), the two places' towns, and the UNESCO sites in the frame.
  "portugal-close": { country: "portugal", hires: true, frame: [-10.6, 36.8, -4.9, 42.3], focus: ["Portugal"],
    seas: [["Atlantic Ocean", 39.6, -10.0]],
    countries: [["SPAIN", 40.1, -5.9]],
    reserves: [
      ["Douro wine region", [[-7.98,41.24],[-7.6,41.3],[-7.2,41.28],[-6.85,41.18],[-6.9,41.0],[-7.3,41.02],[-7.7,41.06],[-7.98,41.09]], [-7.45, 41.35]],
      ["Dark Sky Alqueva", [[-7.75,38.62],[-7.25,38.6],[-7.05,38.35],[-7.15,38.05],[-7.55,37.98],[-7.85,38.2]], [-7.45, 38.0]],
    ],
    marks: [["Lisbon ✈", 38.72, -9.14, "town"], ["Porto ✈", 41.15, -8.61, "town"], ["Estremoz", 38.844, -7.586, "town"], ["Pinhão", 41.19, -7.546, "town"], ["Alqueva", 38.25, -7.42, "water"]],
    unesco: ["263", "361", "723", "755", "866", "1046", "1367"],
    // Short labels on the chart (the full names are listed beside it); "" = the mark alone, a town names it.
    unescoLabels: { "263": "", "361": "Évora", "723": "Sintra", "755": "", "866": "Côa Valley", "1046": "Alto Douro", "1367": "Elvas" } },
  // Greece, closer (2 Nov 2026): the landing chart of the Europe flyover, from Zagori and Corfu to Crete,
  // Rhodes and Kastellorizo. The house's places named, and Greece's UNESCO sites in the frame.
  "greece-close": { country: "greece", frame: [19.0, 34.6, 30.0, 41.9], focus: ["Greece"],
    seas: [["Ionian Sea", 37.6, 20.0], ["Aegean Sea", 38.9, 25.0], ["Sea of Crete", 35.95, 25.0]],
    countries: [["TÜRKİYE", 38.8, 28.6]],
    areas: [["Peloponnese", 37.55, 22.1], ["Cyclades", 37.0, 25.9], ["Dodecanese", 36.75, 27.55], ["Crete", 35.05, 24.6], ["Zagori", 40.12, 20.95], ["Ionian Islands", 38.6, 20.15]],
    marks: [["Athens ✈", 37.9838, 23.7275, "town"]],
    unesco: ["392", "393", "404", "455", "491", "493", "511", "517", "530", "941", "978", "1695", "1733"],
    unescoLabels: { "392": "Bassae", "393": "Delphi", "404": "", "455": "Meteora", "491": "Epidaurus", "493": "Rhodes", "511": "Mystras", "517": "Olympia", "530": "Delos", "941": "Mycenae", "978": "Corfu", "1695": "", "1733": "Knossos" } },
  // Europe, wide (2 Nov 2026): the opening view of the Greece flyover only (the Europe region chart stays as it is).
  "europe-wide": { frame: [-12, 33.5, 33, 58.5], focus: ["Greece"], seas: [["Atlantic Ocean", 46, -9], ["Mediterranean Sea", 35.6, 17], ["Aegean Sea", 38.6, 25], ["Black Sea", 43.2, 31.5]] },
  europe: { frame: [-30, 35, 17, 57.5], seas: [["Atlantic Ocean", 50, -20], ["Mediterranean Sea", 37.5, 6], ["Bay of Biscay", 45.4, -4.8], ["Irish Sea", 53.6, -5.3]] },
  // Country guides without a library chart (Indonesia is told as a guide, by sea).
  indonesia: { country: "indonesia", frame: [102.5, -11.5, 135.5, 4.5], seas: [["Java Sea", -5.2, 111], ["Banda Sea", -5.6, 127.5], ["Indian Ocean", -10.4, 106], ["Pacific Ocean", 1.8, 134.5]] },
  // Indonesia's island chains, closer (James, 2 Nov 2026: "zoom in on the island chains with some textures").
  // 1:10m coastlines at a narrower width, so labels and pins read at phone size. The country guide opens on
  // Bali and Lombok and flies between these frames (components/destination/ChainChartMap.tsx).
  "indonesia-bali-lombok": { country: "indonesia", hires: true, width: 520, frame: [114.75, -9.12, 116.75, -7.95], focus: ["Indonesia"],
    seas: [["Bali Sea", -8.08, 115.6], ["Indian Ocean", -9.05, 115.75], ["Lombok Strait", -8.5, 115.8]],
    areas: [["Ubud", -8.27, 115.42], ["Bukit", -8.97, 115.02], ["Lombok", -8.6, 116.4]],
    marks: [["Lombok ✈", -8.757, 116.276, "airport"]] },
  "indonesia-sumba-flores": { country: "indonesia", hires: true, width: 520, frame: [116.9, -11.15, 123.9, -7.9], focus: ["Indonesia"],
    seas: [["Flores Sea", -8.05, 121.0], ["Savu Sea", -9.75, 121.6], ["Indian Ocean", -10.95, 118.4]],
    areas: [["Sumba", -9.72, 120.0], ["Flores", -8.43, 121.3], ["Sumbawa", -8.62, 117.65], ["Komodo", -8.9, 119.45], ["Rote", -11.08, 123.3]],
    marks: [["Labuan Bajo ✈", -8.486, 119.889, "airport"], ["Tambolaka ✈", -9.409, 119.244, "airport"], ["Kupang ✈", -10.171, 123.671, "airport"]] },
  "indonesia-raja-ampat": { country: "indonesia", hires: true, width: 520, frame: [129.0, -2.3, 131.9, 0.42], focus: ["Indonesia"],
    seas: [["Pacific Ocean", 0.22, 131.0], ["Seram Sea", -2.15, 130.9]],
    areas: [["Waigeo", -0.18, 130.75], ["Wayag", 0.2, 130.02], ["Misool", -1.72, 130.05], ["Batanta", -0.9, 130.6]],
    marks: [["Sorong ✈", -0.926, 131.121, "airport"], ["Waisai", -0.43, 130.82, "town"]] },
  "indonesia-sumatra-riau": { country: "indonesia", hires: true, width: 520, frame: [102.7, -0.25, 105.2, 1.75], focus: ["Indonesia"],
    seas: [["South China Sea", 1.45, 104.85], ["Strait of Malacca", 1.55, 103.0]],
    areas: [["Sumatra", 0.25, 103.05], ["Bintan", 1.05, 104.38], ["Riau Islands", 0.35, 104.4]],
    marks: [["Singapore ✈", 1.364, 103.991, "airport"]] },
  // Thailand's three coasts and the north, closer (James, 2 Nov 2026: region views "the way Indonesia was
  // just done"). Same 1:10m stock and narrow width; the library country page opens on the Andaman coast and
  // flies between these frames and the whole country (CHAINS in app/destinations/[region]/[country]/page.tsx).
  "thailand-andaman": { country: "thailand", hires: true, width: 520, frame: [97.75, 7.45, 99.35, 8.95], focus: ["Thailand"],
    seas: [["Andaman Sea", 7.62, 98.05], ["Phang Nga Bay", 8.2, 98.52]],
    areas: [["Phuket", 7.88, 98.36], ["Khao Lak", 8.7, 98.36], ["Krabi", 8.18, 99.08]],
    marks: [["Phuket ✈", 8.113, 98.317, "airport"], ["Krabi ✈", 8.099, 98.986, "airport"]] },
  "thailand-gulf": { country: "thailand", hires: true, width: 520, frame: [99.55, 9.2, 100.4, 9.98], focus: ["Thailand"],
    seas: [["Gulf of Thailand", 9.3, 100.2]],
    areas: [["Koh Samui", 9.47, 99.93], ["Koh Phangan", 9.78, 100.03]],
    marks: [["Samui ✈", 9.548, 100.062, "airport"]] },
  "thailand-north": { country: "thailand", hires: true, width: 520, frame: [98.45, 18.35, 100.75, 20.55], focus: ["Thailand"],
    areas: [["Chiang Mai", 18.92, 98.96], ["Golden Triangle", 20.47, 99.92]],
    countries: [["MYANMAR", 20.15, 98.75], ["LAOS", 19.55, 100.55]],
    marks: [["Chiang Mai ✈", 18.767, 98.963, "airport"], ["Chiang Rai ✈", 19.952, 99.883, "airport"]] },
  // The Philippines by island group (James, 2 Nov 2026: a rich map, island-group views and dive flags). Same 1:10m
  // stock and narrow width as Indonesia and Thailand. Dive flags ("dive") are one line each from the Department of
  // Tourism and sit at the named island or reef, approximate; Tubbataha and the Underground River are UNESCO points.
  "philippines-palawan": { country: "philippines", hires: true, width: 520, frame: [118.75, 10.0, 121.25, 12.45], focus: ["Philippines"],
    seas: [["South China Sea", 11.75, 119.3], ["Sulu Sea", 10.35, 120.55], ["Linapacan Strait", 11.62, 119.75]],
    areas: [["El Nido", 11.33, 119.33], ["Taytay", 10.86, 119.62], ["Calamian Islands", 12.3, 119.85], ["Linapacan", 11.45, 119.95], ["Cuyo Islands", 11.0, 120.95]],
    marks: [["El Nido ✈", 11.2027, 119.4166, "airport"], ["Busuanga ✈", 12.1215, 120.1, "airport"], ["Coron wrecks", 11.9, 120.1, "dive"]],
    unesco: ["652"], unescoLabels: { "652": "Underground River" } },
  "philippines-sulu": { country: "philippines", hires: true, width: 520, frame: [118.4, 8.4, 121.3, 10.6], focus: ["Philippines"],
    seas: [["Sulu Sea", 9.55, 120.6]],
    areas: [["Palawan", 9.55, 118.55]],
    marks: [["Puerto Princesa ✈", 9.7421, 118.759, "airport"], ["Tubbataha · UNESCO", 8.902705, 119.910237, "dive"]],
    unesco: ["652"], unescoLabels: { "652": "Underground River" } },
  "philippines-visayas": { country: "philippines", hires: true, width: 520, frame: [122.95, 8.9, 124.66, 10.55], focus: ["Philippines"],
    seas: [["Bohol Sea", 9.08, 124.1], ["Cebu Strait", 10.05, 123.82], ["Tañon Strait", 10.2, 123.2]],
    areas: [["Cebu", 10.42, 123.62], ["Bohol", 9.86, 124.18], ["Negros", 9.55, 123.05], ["Panglao", 9.64, 123.95], ["Anda", 9.82, 124.5]],
    marks: [["Mactan ✈", 10.3075, 123.9794, "airport"], ["Panglao ✈", 9.5664, 123.7706, "airport"], ["Dumaguete ✈", 9.3337, 123.3002, "airport"], ["Dauin", 9.19, 123.26, "town"],
      ["Apo Island", 9.0797, 123.2714, "dive"], ["Moalboal", 9.94, 123.37, "dive"], ["Balicasag", 9.517, 123.683, "dive"]] },
  "philippines-siargao": { country: "philippines", hires: true, width: 520, frame: [125.85, 9.6, 126.3, 10.1], focus: ["Philippines"],
    seas: [["Philippine Sea", 9.9, 126.24]],
    areas: [["Siargao", 9.95, 126.05], ["General Luna", 9.79, 126.11]],
    marks: [["Sayak ✈", 9.8591, 126.014, "airport"], ["Cloud 9", 9.811, 126.166, "town"]] },
  "philippines-camiguin": { country: "philippines", hires: true, width: 520, frame: [124.58, 9.06, 124.88, 9.31], focus: ["Philippines"],
    seas: [["Bohol Sea", 9.28, 124.62]],
    areas: [["Camiguin", 9.17, 124.73], ["Hibok-Hibok", 9.2, 124.67]],
    marks: [["Camiguin ✈", 9.2535, 124.707, "airport"], ["Mambajao", 9.25, 124.72, "town"], ["White Island", 9.26, 124.66, "water"]] },
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

// Chart overlays (the flyover landing charts): salt flats, reserves, a route, marks and UNESCO sites.
const UNESCO_SRC = require("fs").readFileSync(require("path").join(__dirname, "../lib/content/unesco.ts"), "utf8");
const UNESCO = [...UNESCO_SRC.matchAll(/\{ id: "(\d+)", name: "([^"]+)", country: "[^"]+", year: (\d+), lat: (-?[\d.]+|null), lng: (-?[\d.]+|null) \}/g)]
  .map((m) => ({ id: m[1], name: m[2], year: +m[3], lat: m[4] === "null" ? null : +m[4], lng: m[5] === "null" ? null : +m[5] }));
function overlays(cfg, P) {
  const path = (pts) => "M" + pts.map((p) => P(p).join(",")).join("L") + "Z";
  const ell = (cx, cy, rx, ry) => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * 2 * Math.PI; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const shape = (x) => (x[1] === "ellipse" ? { name: x[0], d: path(ell(x[2], x[3], x[4], x[5])), at: P([x[2], x[3]]) } : { name: x[0], d: path(x[1]), at: x[2] ? P(x[2]) : P(x[1].reduce((a, p) => [a[0] + p[0] / x[1].length, a[1] + p[1] / x[1].length], [0, 0])) });
  return {
    salt: (cfg.salt || []).map((x) => { const sh = shape(x); const pts = x[1] === "ellipse" ? ell(x[2], x[3], x[4], x[5]) : x[1]; const q = pts.map(P);
      const box = [Math.min(...q.map((p) => p[0])), Math.min(...q.map((p) => p[1])), Math.max(...q.map((p) => p[0])), Math.max(...q.map((p) => p[1]))].map((v) => +v.toFixed(1));
      return { name: sh.name, d: sh.d, x: sh.at[0], y: sh.at[1], box }; }),
    reserves: (cfg.reserves || []).map(shape).map(({ name, d, at }) => ({ name, d, x: at[0], y: at[1] })),
    route: cfg.route ? "M" + cfg.route.map((p) => P(p).join(",")).join("L") : null,
    marks: (cfg.marks || []).map(([text, lat, lng, kind]) => { const [x, y] = P([lng, lat]); return { text, x, y, kind }; }),
    countries: (cfg.countries || []).map(([text, lat, lng]) => { const [x, y] = P([lng, lat]); return { text, x, y }; }),
    unesco: (cfg.unesco || []).map((id) => UNESCO.find((u) => u.id === id)).filter((u) => u && u.lat != null).map((u) => { const [x, y] = P([u.lng, u.lat]); return { id: u.id, name: u.name, label: cfg.unescoLabels && u.id in cfg.unescoLabels ? cfg.unescoLabels[u.id] : u.name.replace(/^(City of |Historic City of |Historic Quarter of )/, "").split(/,| and /)[0].replace(/ Culture$/, ""), year: u.year, x, y }; }),
  };
}

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
  if (cfg.minN != null) B[3] = Math.max(B[3], cfg.minN); // keep Darwin and Wolf (Galápagos) on the chart
  const bounds = { w: +B[0].toFixed(3), s: +B[1].toFixed(3), e: +B[2].toFixed(3), n: +B[3].toFixed(3) };
  const W = cfg.width || WIDTH; // the island-chain charts draw narrower, so labels and pins read at phone size
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
  const cards = cfg.country || cfg.focus ? [] : LIB_COUNTRIES.filter((c) => c.region === slug && c.staysComing).map((c) => c.atlasName);
  const focusNames = new Set(cfg.focus || [...FEATS.filter((f) => raw.some((p) => inFeat(p, f))).map((f) => f.properties.name), ...cards]);
  let focus = ""; const neighbors = [], flabels = [], nlabels = [];
  for (const g of cfg.hires ? FEATS10 : FEATS) {
    const d = geomPath(g.geometry); if (!d) continue;
    const big = polysOf(g.geometry).map((p) => S(p[0])).filter((r) => inside(ringBox(r))).sort((a, b) => area(b) - area(a))[0];
    const lab = big ? (() => { const [x, y] = centroid(big); return x > bounds.w && x < bounds.e && y > bounds.s && y < bounds.n ? { a: area(big), x: P([x, y])[0], y: P([x, y])[1], text: g.properties.name.replace("United Republic of ", "").replace("Dem. Rep. Congo", "DR Congo").replace("United States of America", "United States").replace(/^Macedonia$/, "North Macedonia").toUpperCase() } : null; })() : null;
    if (focusNames.has(g.properties.name)) { focus += d; if (lab && !cfg.hires) flabels.push(lab); }
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
    ...(cfg.salt || cfg.unesco || cfg.reserves || cfg.marks ? { overlays: overlays(cfg, P) } : {}),
  };
  console.log(slug, W, H, "focus:", [...focusNames].join(", "), "points:", raw.length);
}
fs.writeFileSync("lib/charts/regions.json", JSON.stringify(out));
console.log((fs.statSync("lib/charts/regions.json").size / 1024).toFixed(0) + "KB");
