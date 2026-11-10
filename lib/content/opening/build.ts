import { isInteriorPhoto } from "./interior-photos";
// The house opening for every cruise record (James, 9 Nov 2026: "begin correcting and deploying all cruises with the new
// approved blend design"). Preview C (components/opening/HouseOpening.tsx) and the house tones (components/opening/
// Tones.tsx), filled from each record's own data, so nothing here is written fresh:
//   frames  three of the record's own photographs: a place, the way in, the vessel (chosen by their alt text, the
//           largest first; under-1,600px originals are upscaled by Pic)
//   words   title, operator and type from the record; the big line is the record's quote or the first sentence of its
//           approved answer; the glance is its short facts; the three "why" frames are its "who she suits" lines, or
//           three of its own itinerary days where it has fewer than three
//   colour  the record's pathway accent mixed with the tones of its waters (the photograph's darkest and lightest),
//           the same recipe as the three hand-set previews, checked for contrast (white on night 7:1 or better)
//   next    the next open dated departure and its lowest published fare
// The Exceptional Few keep their own entrance (protected). Hand-set openings (CLASSIC_C, POLAR_CIRCLE_C, ORIGIN_C)
// take precedence for their records.
import type { HouseOpeningProps, OpeningImage, OpeningPalette, NextSailing } from "@/components/opening/HouseOpening";
import { PATHWAYS, type PathwayId } from "@/lib/pathways";
import { SHIPS, type ShipEntry } from "@/lib/content/ships";
import { cruiseOnly, type ShipImage, type ShipRecord } from "@/lib/content/ships/types";
import type { PolarVoyage } from "@/lib/content/polar";
import { CLASSIC_C, POLAR_CIRCLE_C, ORIGIN_C, HX_CIRCLE_C, RA_C, STAY_HAND_C, polarNext } from "@/lib/content/preview/opening-c";
import { today } from "@/lib/dates";
import { smallWidth } from "./small-images";
import { VOLUME_STYLES } from "@/lib/volumes";

export type OpeningBase = Omit<HouseOpeningProps, "next" | "grain">;
export type Built = OpeningBase & { next: NextSailing };

/* ---------- colour ---------- */
const INK = "#1A1816";
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (...parts: [string, number][]) => { const t = parts.reduce((a, [, w]) => a + w, 0); const acc = [0, 0, 0]; for (const [h, w] of parts) hex(h).forEach((v, i) => (acc[i] += (v * w) / t)); return toHex(acc); };
const lum = (h: string) => { const [r, g, b] = hex(h).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** The darkest and lightest tones of each waters' photographs (sea, ice, sand, river, forest), read from the records'
 *  own galleries by eye: the polar blue-grey, the Galápagos lava and sand, the Nile's ochre, the Amazon's green. */
const WATERS: Record<string, { dark: string; light: string }> = {
  antarctica: { dark: "#1E2B38", light: "#E6ECF1" },
  galapagos: { dark: "#1F2F35", light: "#E4D9C4" },
  amazon: { dark: "#1E2A21", light: "#DDE3D1" },
  nile: { dark: "#3A2B1E", light: "#EADDC7" },
  indonesia: { dark: "#15313A", light: "#D8E6E3" },
  philippines: { dark: "#15333A", light: "#D6E8E5" },
  tahiti: { dark: "#123844", light: "#D5EAE8" },
  fiji: { dark: "#133744", light: "#D7E9E6" },
};

export function paletteFor(pathway: PathwayId, waters: string): OpeningPalette {
  const accent = PATHWAYS[pathway]?.accent ?? "#2E2B28";
  const w = WATERS[waters] ?? WATERS.indonesia;
  let night = mix([accent, 45], [w.dark, 25], [INK, 30]);
  for (let i = 0; i < 6 && contrast("#FFFFFF", night) < 7; i++) night = mix([night, 80], [INK, 20]);
  const deep = mix([night, 60], [INK, 40]);
  const day = mix(["#FFFFFF", 93], [w.light, 4], [accent, 3]);
  let hi = mix([w.light, 85], ["#FFFFFF", 15]);
  if (contrast(hi, night) < 4.5) hi = mix([hi, 70], ["#FFFFFF", 30]);
  return { night, deep, day, hi };
}

/* ---------- photographs ---------- */
const INTERIOR = /\b(cabins?|suites?|staterooms?|bathrooms?|bedrooms?|beds?|lounges?|restaurant|dining|dinner|bar|spa|massage|library|interior|salon|saloon|gym|plans?|menu|food|dish|meals?|breakfast|lunch|chef|living|rooms?|corridor|reception|lobby|shower|wardrobe|desk|kitchen|galley|cocktails?|wine|common areas?|social spaces?|boutique|sauna|reading|cinema|observation|indoors?)\b/i;
const VESSEL = /\b(ship|yacht|boat|vessel|dahabiya|dahabeya|catamaran|trimaran|schooner|phinisi|pinisi|riverboat|cruiser|hull|bow|stern|at anchor|under sail|sails?|sailing|exterior|aerial)\b/i;
const ONBOARD = /\b(deck|sundeck|pool|jacuzzi|hot tub|terrace|bridge|skiff|tender|zodiac|panga|dinghy|kayak)\b/i;
// No room shots in the entrance (James, 10 Nov 2026: "we don't want views of inside the rooms on the hero page ... a rule
// for stays and gatherings ... more experience, scenery, overhead, more dramatic"). A photograph is read by its alt text
// AND its file name (library files are often named "suite-3" or "bedroom"), so a room shot is caught either way. The
// arrival frames and the close take scenery first (aerials, landscapes, water, wildlife, the way in), then photographs
// that say nothing either way, and never an interior; the "why" frames take interiors only when nothing else is left.
const INTERIOR_FILE = /(^|[-_ ])(suites?|rooms?|bedrooms?|bathrooms?|baths?|beds?|interiors?|lounges?|dining|restaurant|spa|living|library|lobby|reception|bar|kitchen|tent-interior|villa-interior)([-_ .]|\d|$)/i;
const SCENIC = /\b(aerial|drone|overhead|view|views|vista|landscape|panorama|horizon|beach|shore|coast|lagoon|lake|river|ocean|sea|bay|reef|island|islands|mountains?|peaks?|valley|volcano|glacier|forest|jungle|rainforest|canopy|desert|dunes?|savann?ah|plains?|bush|delta|waterfall|sunset|sunrise|dusk|dawn|stars?|wildlife|elephants?|lions?|leopards?|cheetahs?|gorillas?|whales?|birds?|game drive|safari|hike|hiking|trail|walk|kayak|canoe|boat|sail|dive|snorkel|surf|horse|ride|vineyard|garden|exterior|from the air|above)\b/i;
type Cand = { img: ShipImage; interior: boolean; scenic: boolean; vessel: boolean; onboard: boolean; big: boolean };
const cand = (img: ShipImage, name: string): Cand => {
  const a = img.alt || "";
  const file = decodeURIComponent((img.url.split("?")[0].split("/").pop() ?? "").replace(/\.[a-z0-9]+$/i, "")).replace(/_20/g, " ");
  const named = name && a.toLowerCase().includes(name.toLowerCase().split(" ")[0]);
  const onboard = ONBOARD.test(a) || /(^|[-_ ])(deck|pool|terrace|veranda|balcony)([-_ .]|\d|$)/i.test(file);
  const interior = isInteriorPhoto(img.url) || ((INTERIOR.test(a) && !/\b(looking out|from the deck)\b/i.test(a)) || (INTERIOR_FILE.test(file) && !onboard && !SCENIC.test(a)));
  return { img, interior, scenic: !interior && (SCENIC.test(a) || SCENIC.test(file.replace(/[-_]/g, " "))), vessel: VESSEL.test(a) || !!named, onboard, big: !smallWidth(img.url) };
};
let OPERATOR = "the operator";
const toOpening = (i: ShipImage, caption?: string): OpeningImage => ({ src: i.url, alt: i.alt, credit: i.credit ? (/^photo|courtesy|image/i.test(i.credit) ? i.credit : `Photograph courtesy of ${i.credit}`) : `Photograph courtesy of ${OPERATOR}`, caption });

/** frames (place, the way in, the vessel), three "why" photographs and the close, all distinct where the gallery allows. */
export function pickPhotos(hero: ShipImage, gallery: ShipImage[], name: string, also: string[] = []) {
  const seen = new Set<string>(); const all: Cand[] = [];
  for (const g of [hero, ...gallery]) { if (!g?.url || seen.has(g.url)) continue; seen.add(g.url); const c = cand(g, name); if (also.some((n) => g.alt.includes(n))) c.vessel = true; all.push(c); }
  const used = new Set<string>();
  // scenery first, large before small; then the rest of the pool, large before small
  const take = (pred: (c: Cand) => boolean) => { const pool = all.filter((c) => !used.has(c.img.url) && pred(c)); const c = pool.find((x) => x.scenic && x.big) ?? pool.find((x) => x.scenic) ?? pool.find((x) => x.big) ?? pool[0]; if (c) used.add(c.img.url); return c; };
  const outdoor = (c: Cand) => !c.interior;
  const vessel = (all[0] && outdoor(all[0]) && (all[0].scenic || !all.some((c) => c.scenic && c.vessel)) ? (used.add(all[0].img.url), all[0]) : undefined) ?? take((c) => outdoor(c) && c.vessel) ?? take(outdoor) ?? all.find(outdoor) ?? all[0];
  const place = take((c) => outdoor(c) && !c.vessel && !c.onboard) ?? take((c) => outdoor(c) && !c.vessel) ?? take(outdoor);
  const wayIn = take((c) => outdoor(c) && (c.onboard || c.vessel)) ?? take(outdoor);   // never an interior full screen: two frames instead
  const close = take((c) => outdoor(c) && !c.vessel) ?? take(outdoor);
  // the "why" frames take what is left; when the gallery runs out they stand as words alone, never a repeated photograph
  const whyOne = () => take(outdoor) ?? take(() => true);
  const why = [whyOne(), whyOne(), whyOne()];
  const fill = (c?: Cand) => c ?? vessel;
  const frames = [place, wayIn, vessel].filter((c, i, l): c is Cand => !!c && l.findIndex((x) => x?.img.url === c.img.url) === i);
  return { frames: frames.map((c) => c.img), why: why.map((c) => c?.img), close: fill(close).img };
}

/* ---------- words ---------- */
const firstSentence = (s: string) => (s.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? s).trim();
const short = (s: string, n: number) => s.length <= n;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const dm = (x: number, pos: string, neg: string) => { const a = Math.abs(x); let d = Math.floor(a); let m = Math.round((a - d) * 60); if (m === 60) { d++; m = 0; } return `${d}° ${String(m).padStart(2, "0")}′ ${x >= 0 ? pos : neg}`; };
const placeName = (p: string) => p.split(/,| to | and /)[0].replace(/\s*\(.*?\)\s*/g, "").trim();
const fmt = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
const nightsLine = (ns: number[]) => { const u = [...new Set(ns)].sort((a, b) => a - b); if (!u.length) return ""; return u.length === 1 ? `${u[0]}-night` : `${u.slice(0, -1).join(", ")} and ${u[u.length - 1]}-night`; };

function shipNext(d: ShipRecord, plan: string): NextSailing {
  const t = today();
  const dep = cruiseOnly(d).filter((x) => x.date >= t && !/sold|full|closed/i.test(x.status ?? "")).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!dep) return null;
  const fares = Object.values(dep.prices).filter((n): n is number => typeof n === "number" && n > 0);
  return { date: fmt(dep.date), from: fares.length ? usd(Math.min(...fares)) : undefined, href: `${plan}&date=${encodeURIComponent(dep.date)}` };
}

/** Why frames: the record's "who she suits" lines, or three of its own days (the fuller ones, away from embarkation). */
function whyFrom(suits: { who: string; line: string }[], days: { title: string; summary: string }[], photos: (ShipImage | undefined)[]) {
  if (suits.length >= 3) return { label: "Who she suits", why: suits.slice(0, 3).map((s, i) => ({ title: s.who, line: s.line, photo: photos[i] ? toOpening(photos[i]!) : undefined })) };
  const mid = days.slice(1, -1).filter((x) => x.summary).sort((a, b) => b.summary.length - a.summary.length).slice(0, 3);
  const pick = (mid.length >= 3 ? mid : days.filter((x) => x.summary).slice(0, 3)).sort((a, b) => days.indexOf(a) - days.indexOf(b));
  if (pick.length < 3) return null;
  return { label: "Days aboard", why: pick.map((x, i) => ({ title: x.title, line: firstSentence(x.summary), photo: photos[i] ? toOpening(photos[i]!) : undefined })) };
}

/* ---------- ships ---------- */
const HAND: Record<string, OpeningBase> = { "ecoventura-origin-yacht": ORIGIN_C, "ms-roald-amundsen": RA_C };

export function shipOpening(e: ShipEntry): Built | null {
  const d = e.data as ShipRecord;
  const plan = `/plan?trip=${encodeURIComponent(d.name)}`;
  const next = shipNext(d, plan);
  if (HAND[e.slug]) return { ...HAND[e.slug], next };
  if (!d.hero?.url) return null;
  OPERATOR = d.operator;
  const pws = d.pathway ?? (e.reg as { pathway?: { primary: string; secondary: string[] } | null }).pathway ?? null;
  const pathway = (pws?.primary ?? "PATH-04") as PathwayId;
  const ph = pickPhotos(d.hero, d.gallery ?? [], d.name);
  const days = (d.itineraries ?? []).flatMap((i) => i.days.length ? [i] : []);
  const first = days[0]?.days[0];
  const w = whyFrom(d.suits ?? [], days[0]?.days ?? [], ph.why);
  if (!w) return null;
  const nights = (d.itineraries ?? []).map((i) => i.nights).filter((n): n is number => typeof n === "number" && n > 0);
  const route = nights.length && first ? `${nightsLine(nights)} voyages from ${placeName(first.place)}` : "";
  const line = d.quote ?? (short(firstSentence(d.answer), 240) ? firstSentence(d.answer) : d.tagline);
  const glance = (d.facts ?? []).filter(([k, v]) => short(v, 26) && short(k, 18) && !/not published|not accessible|no details|unknown/i.test(v)).slice(0, 4);
  return {
    palette: paletteFor(pathway, e.waters), pathway, also: (pws?.secondary ?? []) as PathwayId[],
    marker: first ? `${dm(first.lat, "N", "S")} · ${placeName(first.place)}` : cap(e.waters),
    designation: `Voyages · ${cap(d.type)} · ${d.operator}`,
    title: d.name, place: route || d.tagline, line,
    frames: ph.frames.map((f) => toOpening(f)),
    glance: glance.length >= 2 ? glance : [["Operator", d.operator], ["Waters", cap(e.waters)]],
    why: w.why, whyLabel: w.label,
    close: { photo: toOpening(ph.close), line: route ? d.tagline : `Plan ${d.name} with James.` },
    planHref: plan, next,
  };
}

/* ---------- polar voyages ---------- */
const POLAR_HAND: Record<string, OpeningBase> = { "classic-antarctica-air-cruise": CLASSIC_C, "polar-circle-air-cruise": POLAR_CIRCLE_C, "hx-antarctic-circle-expedition": HX_CIRCLE_C };
const SHIP_NAME: Record<string, string> = { "magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer", "ms-roald-amundsen": "MS Roald Amundsen", "ms-fridtjof-nansen": "MS Fridtjof Nansen" };

export function polarOpening(v: PolarVoyage): Built | null {
  const plan = `/plan?trip=${encodeURIComponent(v.name)}`;
  const next = polarNext(v, plan);
  if (POLAR_HAND[v.slug]) return { ...POLAR_HAND[v.slug], next };
  if (!v.hero?.url) return null;
  OPERATOR = v.operator;
  const a21op = v.operator === "Antarctica21";
  const pathway: PathwayId = !a21op ? v.pathway.primary : v.style === "sail-both" ? "PATH-06" : "PATH-04";
  const a21 = (id: string, alt: string): ShipImage => ({ url: `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/partners/antarctica21/${id}`, alt, credit: "Antarctica21" });
  const air = v.style === "sail-both" || !a21op ? [] : [a21("aircraft-in-flight", "Antarctica21's four engine charter aircraft in flight"), a21("aircraft-landing-king-george-island", "Antarctica21 charter flight landing on King George Island")];
  // a voyage that never reaches Antarctica (the Falklands, South Georgia, the fjords) takes none of the ship's ice photographs
  const antarctic = /antarctic|peninsula|shetland/i.test([v.name, v.route, ...(v.regions ?? [])].join(" "));
  const icy = (g: ShipImage) => !antarctic && /\b(antarctic\w*|ice|icy|iceberg|glacier|pack)\b/i.test(g.alt);
  const shipPhotos = v.ships.flatMap((s) => { const e = SHIPS.find((x) => x.slug === s); const d = e?.data as ShipRecord | undefined; return d ? [d.hero, ...(d.gallery ?? [])].filter((g) => !icy(g)) : []; });
  const ph = pickPhotos(v.hero, [...(v.gallery ?? []), ...air, ...shipPhotos.filter((g) => !INTERIOR.test(g.alt)), ...shipPhotos.filter((g) => INTERIOR.test(g.alt))], v.name, v.ships.map((s) => SHIP_NAME[s] ?? s));
  const days = v.itinerary.map((x) => ({ title: x.title, summary: x.summary }));
  const w = whyFrom([], days, ph.why);
  if (!w) return null;
  const south = [...v.itinerary].sort((a, b) => a.lat - b.lat)[0];
  const ships = v.ships.map((s) => SHIP_NAME[s] ?? s).join(" or ");
  return {
    palette: paletteFor(pathway, "antarctica"), pathway,
    marker: south ? `${dm(south.lat, "N", "S")} · ${placeName(south.place)}` : "Antarctica",
    designation: `Voyages · ${v.style === "sail-both" ? "Expedition voyage" : "Air-Cruise"} · ${v.operator}`,
    title: v.name, place: v.route, line: short(firstSentence(v.answer), 240) ? firstSentence(v.answer) : v.tagline,
    frames: ph.frames.map((f) => toOpening(f)),
    glance: ([["Length", `${v.days} days, ${v.nights} nights`], ["Starts", v.start.place], ["Guests", v.guests], ["Ships", ships]] as [string, string][]).filter(([, x]) => x && short(x, 34)),
    why: w.why, whyLabel: w.label,
    close: { photo: toOpening(ph.close), line: v.tagline },
    planHref: plan, next,
  };
}

/* ---------- stays (James, 9 Nov 2026: "make the stays similar to the exceptional few entrance and pathway colors,
   volume colors and tints") ---------- */
/** Photograph tones by region, with countries whose ground differs from their region's (the red centre, the canyon
 *  country, Patagonia's steppe): the darkest and lightest tones of the stays' own photographs. */
const GROUND: Record<string, { dark: string; light: string }> = {
  africa: { dark: "#2E2519", light: "#EADFCB" },
  europe: { dark: "#2B2724", light: "#ECE6DC" },
  "central-america": { dark: "#1C2B22", light: "#DCE6D6" },
  "south-america": { dark: "#22292D", light: "#E6E1D8" },
  "usa-canada": { dark: "#2A2622", light: "#E9E1D4" },
  asia: { dark: "#16302E", light: "#DCE8E2" },
  "caribbean-mexico": { dark: "#123A44", light: "#DDEDEA" },
  oceania: { dark: "#133744", light: "#D7E9E6" },
  "polar-arctic": { dark: "#1E2B38", light: "#E6ECF1" },
  // countries whose ground is not their region's
  Australia: { dark: "#3A2219", light: "#EFD9C6" },
  Utah: { dark: "#3A2420", light: "#EFDCC9" },
  "New Mexico": { dark: "#3A2722", light: "#EEDDCB" },
  "Chile & Easter Island": { dark: "#2A2A2E", light: "#E8E2DA" },
  "Ecuador & Galapagos": { dark: "#1F2F35", light: "#E4D9C4" },
};

/** The safari taupe (James, 10 Nov 2026, from the Wilderness DumaTau page he sent): the taupe itself, its deep for the
 *  night, warmed toward brown (white 11.5:1, the taupe on it 4.7:1) and a mid for words and rules on paper (AA, 6:1). */
const SAFARI = { light: VOLUME_STYLES.safaris.leather, deep: "#43372B", text: "#6B5D4C" };

/** A stay's own tones, read from its photographs with Cloudinary's colour analysis (10 Nov 2026): the darkest strong
 *  tone, the light ground, and a mid "sand" like The Exceptional Few's. Add a stay here when its entrance is hand-set. */
const STAY_TONES: Record<string, { dark: string; light: string; sand: string }> = {
  // the Linyanti from the river: dark earth and channel water, pale lagoon sky, the gold of the reeds
  "wilderness-dumatau": { dark: "#332A15", light: "#DCE5E6", sand: "#D6A35A" },
  // the Grumeti from the lodge: olive bush, pale stone, dry-season grass
  "singita-faru-faru-lodge": { dark: "#2C321A", light: "#E2DCD1", sand: "#C2BC86" },
  // Bantry Bay from the air: warm rock and roofs, limestone white, sandstone
  "ellerman-house": { dark: "#3A2820", light: "#EDE3DA", sand: "#D9A98C" },
};

export type StayInput = {
  slug: string; name: string; country: string | null; regionSlug?: string | null; kind: string; place?: string | null;
  pathway?: string | null;   // pathway key ("where-the-wild-lives")
  /** the volumes the stay is filed in; a stay filed under Safaris & Reserves takes the safari earth */
  volumes?: string[] | null;
  /** set by the page when the stay counts as a safari (filed under Safaris, or African on Where the Wild Lives) */
  safari?: boolean;
  images: { url: string; alt: string }[];
  quote?: string | null; tagline?: string | null; bestMonths?: string | null; airport?: string | null; ledgerId?: string | null;
  suited: string[]; coords?: { lat: number; lng: number } | null;
  why: { title?: string | null; body: string }[];
  moments: { title: string; note?: string; image?: { url: string; alt: string } | null }[];
  planHref: string;
};

/** Hand-set photograph order where a stay's gallery leads with a detail (James's review, 9 Nov 2026): the names, in the
 *  order the opening should use them (hero first, then the place, the way in, the close, the "why" photographs). Any
 *  photograph not named follows in its own order. */
/** Hand-set photographs where a stay's gallery leads with a detail or its file names mislead (James's review, 9 Nov
 *  2026): the arrival frames in order (the last is the stay itself), then "|", then the close and the three "why"
 *  photographs. Names are the end of the Cloudinary id. */
const STAY_ORDER: Record<string, string[]> = {
  // the hotel itself first (James, 10 Nov 2026: "the picture of the lodge ... Put that on the homepage as the landing")
  "aguas-claras": ["1_hac_hero", "Beach_0060", "Beach_0030", "|", "Beach_0025", "4_hac_carousel-3", "aguas-claras/hero", "aguas-claras/g1"],
  "como-shambhala-estate": ["/g4", "/g5", "/hero", "|", "/g6", "/g2", "/g10", "/g7"],
  // two outdoor photographs only: the house with its pool, then the house at dusk among the olives
  "da-licenca": ["/suite-my-pool", "/hero", "|", "/suite-moon-cube", "/suite-sunset", "/suite-sky-pool", "/suite-the-loft"],
};

export function stayOpening(s: StayInput): Built | null {
  if (!s.images.length) return null;
  const order = STAY_ORDER[s.slug];
  const byName = (n: string) => s.images.find((i) => i.url.split("?")[0].replace(/\.(jpe?g|png|webp)$/i, "").endsWith(n));
  OPERATOR = s.name;
  // the pathway may arrive as its key ("rooted-in-place") or its id ("PATH-08"); never fall back silently on a known one
  const pid = ((s.pathway && (PATHWAYS as Record<string, { id: string }>)[s.pathway]?.id) ?? Object.values(PATHWAYS).find((p) => p.key === s.pathway)?.id ?? "PATH-04") as PathwayId;
  // Stay colour (James, 10 Nov 2026: "the pathways have unique colors" and each stay its own, as The Exceptional Few):
  // the pathway's accent leads the night (55%), the property's own dark tone from its photographs follows (30%), Ink
  // only 15%, darkened just enough for white at 7:1. The light tone and the "sand" come from the property's photographs
  // (STAY_TONES, read with Cloudinary's colour analysis) or, until a stay is read, its country's or region's ground.
  const tone = STAY_TONES[s.slug];
  const ground = tone ?? GROUND[s.country ?? ""] ?? GROUND[s.regionSlug ?? ""] ?? GROUND.africa;
  const accent = PATHWAYS[pid]?.accent ?? "#2E2B28";
  // Safari taupe (James, 10 Nov 2026: "I'd like to change the color tone to this particular color ... for Safaris ...
  // the dark, this more tone, tan, brown is a better fit"; the Wilderness DumaTau ground he sent, now the Safaris volume leather). A stay filed
  // under Safaris & Reserves takes one khaki family: the night is that taupe taken deep (a touch of the property's own
  // dark), the stamps and night eyebrows print in the taupe itself, rules, numbers and prices in a darker taupe that
  // reads on paper, and the paper takes a faint taupe wash. The pathway keeps its own colour only on its chip dot.
  // Superseded the same morning's Burnt Ochre earth.
  const safari = s.safari ?? !!s.volumes?.includes("safaris");
  let night = safari ? mix([SAFARI.deep, 85], [ground.dark, 15]) : mix([accent, 55], [ground.dark, 30], [INK, 15]);
  for (let i = 0; i < 8 && contrast("#FFFFFF", night) < 7; i++) night = mix([night, 85], [INK, 15]);
  let hi = safari ? mix([SAFARI.light, 45], ["#FFFFFF", 55]) : mix([ground.light, 85], ["#FFFFFF", 15]);
  if (contrast(hi, night) < 4.5) hi = mix([hi, 70], ["#FFFFFF", 30]);
  let sand = safari ? SAFARI.light : tone?.sand ?? mix([ground.light, 70], [accent, 30]);
  for (let i = 0; i < 6 && contrast(sand, night) < 4.5; i++) sand = mix([sand, 75], ["#FFFFFF", 25]);
  const palette = { night, deep: mix([night, 60], [INK, 40]), day: safari ? mix(["#FFFFFF", 90], [SAFARI.light, 10]) : mix(["#FFFFFF", 92], [ground.light, 5], [accent, 3]), hi, path: safari ? SAFARI.text : accent, sand };
  // hand-set stays (James, 10 Nov 2026): brand photographs chosen and ordered by hand; the palette stays the record's
  const handSet = STAY_HAND_C[s.slug];
  if (handSet) return { ...handSet, palette, pathway: pid, planHref: s.planHref, next: null };
  const img = (i: { url: string; alt: string }): ShipImage => ({ url: i.url, alt: i.alt });
  // frames: a place, then the way in, then the stay itself (its own hero), as The Exceptional Few arrive
  const hand = order ? (() => { const cut = order.indexOf("|"); const get = (xs: string[]) => xs.map(byName).filter((x): x is { url: string; alt: string } => !!x).map(img);
    const frames = get(order.slice(0, cut)), rest = get(order.slice(cut + 1)); return frames.length >= 2 && rest.length ? { frames, close: rest[0], why: [rest[1], rest[2], rest[3]] as (ShipImage | undefined)[] } : null; })() : null;
  const ph = hand ?? pickPhotos(img(s.images[0]), s.images.slice(1).map(img), s.name);
  const inFrames = new Set([...ph.frames.map((f) => f.url), ph.close.url]);
  // a moment's own photograph, unless the arrival or the close already shows it
  // a moment keeps its photograph only when it was chosen for it (a curated moment carries a note) and the arrival or
  // the close does not already show it; the rest take unused gallery photographs, never a repeat
  s = { ...s, moments: s.moments.map((m) => (m.image && m.note && !inFrames.has(m.image.url) ? m : { ...m, image: null })) };
  const titled = s.why.filter((w) => w.title && w.body);
  const withPhotos = (xs: { title: string; line: string }[], label: string) => ({ label, why: xs.slice(0, 3).map((x, i) => ({ ...x, photo: ph.why[i] ? toOpening(ph.why[i]!) : undefined })) });
  const w = titled.length >= 3 ? withPhotos(titled.map((x) => ({ title: x.title!, line: firstSentence(x.body) })), "Why it's here")
    : s.moments.length >= 3 ? (() => {
        const ms = (s.moments.filter((m) => m.note).length >= 3 ? s.moments.filter((m) => m.note) : s.moments).slice(0, 3);
        const spare = ph.why.filter(Boolean) as ShipImage[]; let k = 0;
        return { label: "What sets it apart", why: ms.map((m) => ({ title: m.title, line: m.note ? firstSentence(m.note) : "", photo: m.image ? toOpening(img(m.image)) : spare[k] ? toOpening(spare[k++]) : undefined })) };
      })()
    : null;
  if (!w) return null;
  const line = s.quote ?? s.tagline ?? (s.why[0] ? firstSentence(s.why[0].body) : "");
  if (!line) return null;
  const where = [s.place, s.country].filter(Boolean).join(", ");
  // "Best suited to" is left out: the site's suitedTo() reads it from the copy and can misfire (DumaTau read "Beach & ocean")
  const glance = ([["Best months", s.bestMonths], ["Country", s.country], ["Airport", s.airport], ["Ledger ID", s.ledgerId]] as [string, string | null | undefined][])
    .filter((x): x is [string, string] => !!x[1] && short(x[1], 34));
  return {
    palette, pathway: pid,
    marker: s.coords ? `${dm(s.coords.lat, "N", "S")} · ${s.place ?? s.country ?? ""}` : (s.country ?? "The Ledger"),
    designation: `Stays · ${cap(s.kind)}${s.country ? ` · ${s.country}` : ""}`,
    title: s.name, place: where || (s.tagline ?? ""), line,
    frames: ph.frames.map((f) => toOpening(f)),
    glance: glance.length >= 2 ? glance : [["Country", s.country ?? "The Ledger"], ["Ledger ID", s.ledgerId ?? "Being filed"]],
    why: w.why, whyLabel: w.label,
    close: { photo: toOpening(ph.close), line: s.quote && s.tagline ? s.tagline : s.bestMonths ? `Best months: ${s.bestMonths}.` : `Plan ${s.name} with James.` },
    planHref: s.planHref, next: null,
  };
}
