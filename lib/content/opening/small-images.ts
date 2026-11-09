// Cloudinary originals narrower than 1,600px among the cruise records' photographs (read 9 Nov 2026 with fl_getinfo,
// the original's own width). The house opening (components/opening/Pic.tsx) runs these through Cloudinary's AI upscale
// (e_upscale) before sizing, so a frame filled from a brand's 750px photograph stays sharp; every other photograph is
// served as it is, never upscaled. Folder = path below the account, then name:width. Re-read when galleries change.
const RAW = `arcterra/vessels/si-datu-bua=si-datu-bua-first-light:640
arcterra/vessels/silolona/instagram=silolona-si-datu-bua-under-sail:640
A~antarctica-south-georgia-air-cruise=1:1366,2:1366
A~falklands-south-georgia-antarctica=2:1366
A~polar-circle-air-cruise=1:1084
jwco/partners/hx/antarctica=damoy-point-ms-fridtjof-nansen:1200,drake-passage-birds:900,expedition-suite-ma:689,fournier-bay-crabeater-seal:1200,hidden-bay:1200,humpback-whale:1200,orne-islands-ms-fridtjof-nansen:1200,petermann-island:900,weddell-sea-ms-roald-amundsen:1080
jwco/voyages/fiji/yasawa-princess-ii=g10:1441,g13:1440,g15:1440,g9:1440
~amandira=deck-sundown:760,deluxe-cabin:364,dinghy:760,exterior:760
~amazon-clipper-premium=cabin-outside:1356,g2:1356,g5:1356,g7:1356,hero:1356
~anakonda-amazon-cruise=cabin-deluxe:800,cabin-standard:800,g10:800,g11:1200,g12:1200,g7:800,g8:800,g9:800
~aria-amazon=g2:1125,g3:1125,g4:1125,g5:1125,g7:750
~calipso-yacht-galapagos=cabin-standard:750,g1:750,g10:900,g11:900,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~celestia-yacht=cabin-deluxe:1024,cabin-master:1024,g1:1500,g10:1500,g11:1500,g3:1500,g4:1500,g5:1000,g6:1000,g8:1500
~delfin-iii=g12:1000
~ecoventura-evolve-yacht=cabin-deluxe-stateroom:750,cabin-premium-suite:500,g1:900,g10:900,g11:900,g12:900,g2:900,g3:820,g4:820,g5:820,g6:500,g7:500,g8:900,g9:900
~ecoventura-origin-yacht=cabin-deluxe-stateroom:750,cabin-premium-suite:500,g1:900,g10:900,g11:900,g12:900,g3:820,g4:820,g5:820,g6:500,g7:500,g8:900,g9:900,hero:900
~ecoventura-theory-yacht=cabin-deluxe-stateroom:750,cabin-premium-suite:500,g1:900,g10:900,g11:900,g12:900,g3:820,g4:820,g5:500,g6:500,g7:900,g8:900,g9:900,hero:900
~el-aleph=g13:1368,g14:1367,g7:861
~galapagos-angel-yacht=cabin-standard:750,cabin-suite:750,g1:750,g10:750,g11:750,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~galapagos-horizon-trimaran=cabin-double:750,cabin-twin:750,g1:750,g10:750,g11:750,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~grand-majestic-yacht=cabin-master-suite:750,cabin-stateroom:750,g1:750,g10:750,g11:750,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~hermes-galapagos=cabin-king-twin-suite:1000,cabin-owner-suite:1000,cabin-single-suite:1000,g1:1000,g2:1000,g3:1000,g4:1000,g5:1000,g6:1000
~infinity-yacht-galapagos=cabin-stateroom:750,cabin-suite:750,g1:750,g10:750,g11:750,g12:800,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~magellan-explorer=cabin-deluxe-veranda:1200
~monserrat-yacht-galapagos=cabin-lower-deck:1000,cabin-upper-deck:1000,g1:1000,g10:1000,g2:1000,g3:1000,g4:1000,g5:1000,g6:1000,g7:1000,g8:1000,g9:1000,hero:600
~natural-paradise-yacht=cabin-junior-suite:750,cabin-standard:750,cabin-suite:750,g1:750,g10:750,g11:750,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~new-galapagos-sea-star=cabin-balcony-suite:750,cabin-galapagos-suite:750,cabin-sea-star-suite:750,g1:750,g10:750,g11:750,g2:750,g3:750,g4:750,g5:750,g6:750,g7:750,g8:750,g9:750,hero:750
~rascal=cabin-1:1499,cabin-3:1505,cabin-4:1505,cabin-master:1505,g1:1419,g10:1505,g11:1514,g12:912,g13:911,g14:1369,g4:1499,g5:1505,g6:847
~rebel=cabin-1:1499,cabin-2:1499,cabin-3:1499,cabin-4:1499,cabin-master:1499,g10:1505,g13:914,g14:914,g3:1505,g4:1506,g5:846
~si-datu-bua=cabin-king:1097,g1:1319,g2:1197,g5:1168,g6:751,g8:751
~silolona-sojourns=g1:1126,g11:697,g12:696,g2:1336,g3:1099,g4:751,g6:578,g7:1197,g9:751
jwco/voyages/tao-philippines=g5:790,hero:1500
wildco/voyages/vessels/aliikai=19LilyRose:1500,30LilyRose:1500,7U7A3749-scaled-1:1440,7U7A4261-scaled-1:1440,7U7A4287-scaled-1:1440,OCFAM2:800`;

const SMALL = new Map<string, number>();
for (const line of RAW.split("\n")) {
  const [dir, list] = line.split("=");
  const d = dir.replace(/^A~/, "jwco/partners/antarctica21/voyages/").replace(/^~/, "jwco/voyages/ships/");
  for (const it of list.split(",")) { const [n, w] = it.split(":"); SMALL.set(`${d}/${n}`, Number(w)); }
}

/** The Cloudinary public id inside a delivery URL (transformations and version stripped), or null. */
export function cloudinaryId(url: string): string | null {
  const m = url.match(/res\.cloudinary\.com\/jhlnq5h5\/image\/upload\/(.+)$/);
  if (!m) return null;
  const p = m[1].split("/");
  while (p.length > 1 && (/^([a-z]{1,3}_[^/]*|v\d+)$/.test(p[0]) || p[0].includes(","))) p.shift();
  return p.join("/");
}

/** The original's width when it is under 1,600px (the frames upscale it), else undefined. */
export const smallWidth = (url: string) => { const id = cloudinaryId(url); return id ? SMALL.get(id) : undefined; };
