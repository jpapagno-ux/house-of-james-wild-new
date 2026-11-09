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
import { CLASSIC_C, POLAR_CIRCLE_C, ORIGIN_C, polarNext } from "@/lib/content/preview/opening-c";
import { today } from "@/lib/dates";
import { smallWidth } from "./small-images";

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
type Cand = { img: ShipImage; interior: boolean; vessel: boolean; onboard: boolean; big: boolean };
const cand = (img: ShipImage, name: string): Cand => {
  const a = img.alt || "";
  const named = name && a.toLowerCase().includes(name.toLowerCase().split(" ")[0]);
  return { img, interior: INTERIOR.test(a) && !/\b(looking out|from the deck)\b/i.test(a), vessel: VESSEL.test(a) || !!named, onboard: ONBOARD.test(a), big: !smallWidth(img.url) };
};
let OPERATOR = "the operator";
const toOpening = (i: ShipImage, caption?: string): OpeningImage => ({ src: i.url, alt: i.alt, credit: i.credit ? (/^photo|courtesy|image/i.test(i.credit) ? i.credit : `Photograph courtesy of ${i.credit}`) : `Photograph courtesy of ${OPERATOR}`, caption });

/** frames (place, the way in, the vessel), three "why" photographs and the close, all distinct where the gallery allows. */
export function pickPhotos(hero: ShipImage, gallery: ShipImage[], name: string, also: string[] = []) {
  const seen = new Set<string>(); const all: Cand[] = [];
  for (const g of [hero, ...gallery]) { if (!g?.url || seen.has(g.url)) continue; seen.add(g.url); const c = cand(g, name); if (also.some((n) => g.alt.includes(n))) c.vessel = true; all.push(c); }
  const used = new Set<string>();
  const take = (pred: (c: Cand) => boolean) => { const pool = all.filter((c) => !used.has(c.img.url) && pred(c)); const c = pool.find((x) => x.big) ?? pool[0]; if (c) used.add(c.img.url); return c; };
  const outdoor = (c: Cand) => !c.interior;
  const vessel = (all[0] && outdoor(all[0]) ? (used.add(all[0].img.url), all[0]) : undefined) ?? take((c) => outdoor(c) && c.vessel) ?? take(outdoor) ?? all[0];
  const place = take((c) => outdoor(c) && !c.vessel && !c.onboard) ?? take((c) => outdoor(c) && !c.vessel) ?? take(outdoor);
  const wayIn = take((c) => outdoor(c) && (c.onboard || c.vessel)) ?? take(outdoor);   // never an interior full screen: two frames instead
  const close = take((c) => outdoor(c) && !c.vessel) ?? take(outdoor);
  // the "why" frames take what is left; when the gallery runs out they stand as words alone, never a repeated photograph
  const why = [take(() => true), take(() => true), take(() => true)];
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
const HAND: Record<string, OpeningBase> = { "ecoventura-origin-yacht": ORIGIN_C };

export function shipOpening(e: ShipEntry): Built | null {
  const d = e.data as ShipRecord;
  const plan = `/plan?trip=${encodeURIComponent(d.name)}`;
  const next = shipNext(d, plan);
  if (HAND[e.slug]) return { ...HAND[e.slug], next };
  if (!d.hero?.url) return null;
  OPERATOR = d.operator;
  const pathway = (d.pathway?.primary ?? "PATH-04") as PathwayId;
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
    palette: paletteFor(pathway, e.waters), pathway,
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
const POLAR_HAND: Record<string, OpeningBase> = { "classic-antarctica-air-cruise": CLASSIC_C, "polar-circle-air-cruise": POLAR_CIRCLE_C };
const SHIP_NAME: Record<string, string> = { "magellan-explorer": "Magellan Explorer", "magellan-discoverer": "Magellan Discoverer" };

export function polarOpening(v: PolarVoyage): Built | null {
  const plan = `/plan?trip=${encodeURIComponent(v.name)}`;
  const next = polarNext(v, plan);
  if (POLAR_HAND[v.slug]) return { ...POLAR_HAND[v.slug], next };
  if (!v.hero?.url) return null;
  OPERATOR = "Antarctica21";
  const pathway: PathwayId = v.style === "sail-both" ? "PATH-06" : "PATH-04";
  const a21 = (id: string, alt: string): ShipImage => ({ url: `https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/partners/antarctica21/${id}`, alt, credit: "Antarctica21" });
  const air = v.style === "sail-both" ? [] : [a21("aircraft-in-flight", "Antarctica21's four engine charter aircraft in flight"), a21("aircraft-landing-king-george-island", "Antarctica21 charter flight landing on King George Island")];
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
    designation: `Voyages · ${v.style === "sail-both" ? "Expedition voyage" : "Air-Cruise"} · Antarctica21`,
    title: v.name, place: v.route, line: short(firstSentence(v.answer), 240) ? firstSentence(v.answer) : v.tagline,
    frames: ph.frames.map((f) => toOpening(f)),
    glance: ([["Length", `${v.days} days, ${v.nights} nights`], ["Starts", v.start.place], ["Guests", v.guests], ["Ships", ships]] as [string, string][]).filter(([, x]) => x && short(x, 34)),
    why: w.why, whyLabel: w.label,
    close: { photo: toOpening(ph.close), line: v.tagline },
    planHref: plan, next,
  };
}
