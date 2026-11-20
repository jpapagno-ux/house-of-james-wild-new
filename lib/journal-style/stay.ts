import { undash } from "@/lib/content/ships/types";
// JWC-STYLE-01: everything the Modern Journal stay page prints, read from the site's existing loaders. Nothing is
// typed in here: no rate, date, offer, name or sentence about a property. A field the record does not hold comes
// back empty and the page shows the section's "to file" state (or drops the section).
import { altFor, stayBySlug, type StayData } from "@/lib/content/stays";
import { heroSlides } from "@/lib/content/hero-sets";
import { offersFor } from "@/lib/content/offers/offers";
import { CAYUGA_RATES, CAYUGA_ROOMS_MAY_2027, RATES_CHECKED } from "@/lib/content/rates/cayuga-rates";
import { momentsFor, rowsFrom } from "@/lib/content/stay-moments";
import { PHOTO_CREDIT } from "@/lib/content/stay-media";
import { hostFor, VIDEOS } from "@/lib/content/hosts";
import { STAY_FILMS } from "@/lib/content/stay-films";
import { roomsFor } from "@/lib/content/stay-rooms";
import { routesThrough } from "@/lib/content/trips";
import { suitedTo } from "@/lib/ledger/travel-types";
import { BEST_FOR } from "@/lib/content/stays";
import PAGES from "./pages.json";
import ROOM_PHOTOS from "./room-photos.json";
import RATE_HOLDS from "./rate-holds.json";
import PHOTO_NOTES from "./photo-notes.json";

const CLOUD = "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto";
const roomPhotos = ROOM_PHOTOS as unknown as Record<string, Record<string, { id: string; alt: string }> | string>;

/** The stays that have the Modern Journal page (the pilot's sample pages). One list, read by next.config.ts too. */
export const JOURNAL_STAYS: string[] = PAGES.stays;

export type Photo = { url: string; alt: string; described: boolean };
export type SectionKey = "rooms" | "pool" | "exterior" | "dining" | "experiences";
export const SECTION_LABEL: Record<SectionKey, string> = { rooms: "Rooms", pool: "Pool and beach", exterior: "Exterior and gardens", dining: "Dining", experiences: "Experiences" };
export const SECTION_ORDER: SectionKey[] = ["rooms", "pool", "exterior", "dining", "experiences"];
/** A photograph in the viewer: its section (null = All only) and, for a room photograph, the room it shows. */
export type ViewerPhoto = { url: string; alt: string; section: SectionKey | null; room?: string };
export type RoomRate = { name: string; sleeps: number; list: number; now: number; photo: Photo | null };
export type RateCard = {
  rooms: RoomRate[];
  /** The hotel's own promotion printed on the rate card, e.g. "Early Bird 10% off"; null when the card has none. */
  promo: string | null;
  tax: number;
  /** The dates the rates were read for, and the day they were read. */
  window: { from: string; to: string; nights: number } | null;
  checked: string;
  from: { list: number; now: number } | null;
  /** Where the figures are filed, for the price list every stage report carries. */
  source: string;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "2026-12-19" → "19 December 2026"; short: "19 Dec 2026". */
export function day(iso: string, short = false): string {
  const [y, m, d] = iso.split("-").map(Number);
  const mo = MONTHS[m - 1] ?? "";
  return `${d} ${short ? mo.slice(0, 3) : mo} ${y}`;
}
/** "11 to 14 May 2027" when both days share a month, else both in full. */
export function span(from: string, to: string): string {
  const [fy, fm] = from.split("-"), [ty, tm] = to.split("-");
  return fy === ty && fm === tm ? `${Number(from.split("-")[2])} to ${day(to)}` : `${day(from)} to ${day(to)}`;
}
/** US$360, US$445.50: two decimals only when the figure has cents. */
export function money(n: number): string {
  return `US$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
}
export const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;


type Note = { alt: string; section?: SectionKey };
type Notes = { describe: Record<string, Note>; extra: { id: string; alt: string; section?: SectionKey }[] };
const notesFor = (slug: string): Notes | null => { const n = (PHOTO_NOTES as unknown as Record<string, Notes | string>)[slug]; return n && typeof n === "object" ? n : null; };
const lastPart = (u: string) => (u.split("?")[0].split("/").pop() ?? "").replace(/\.[a-z0-9]{3,4}$/i, "");
/** The section a described photograph belongs to, read from its description: what is happening in it first (a meal,
 *  an activity), then water, then a room's interior, then the grounds. */
export function sectionOf(alt: string): SectionKey | null {
  const a = alt.toLowerCase();
  if (/\b(restaurant|dining|bar|breakfast|dinner|lunch|chef|kitchen|cocktail)\b/.test(a)) return "dining";
  if (/\b(yoga|snorkel|snorkeling|kayak|kayaks|sailing|hobie|surf|hike|spa|massage|national park|water slide|tennis|bicycle|bicycles|tour)\b/.test(a)) return "experiences";
  if (/\b(pool|beach|sundeck|sand|lagoon|reef|shore|cove)\b/.test(a)) return "pool";
  if (/\b(bedroom|suite|studio|penthouse|bungalow|king bed|balcony|bathroom|living room)\b/.test(a)) return "rooms";
  if (/\b(garden|gardens|exterior|house|villa|from the air|aerial|palms|lobby|grounds|entrance|terrace|pavilion|rainforest|jungle)\b/.test(a)) return "exterior";
  return null;
}

const firstSentence = (t: string) => (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();
const KIND: Record<string, string> = { hotel: "hotel", lodge: "lodge", villa: "private villa", camp: "camp", resort: "resort", residence: "residence" };

function rateCard(slug: string, photos: Photo[]): RateCard | null {
  const filed = CAYUGA_ROOMS_MAY_2027[slug];
  if (!filed?.rooms.length) return null;
  // a promotion on hold (rate-holds.json) is not displayed: every room shows its standard rate. The record is untouched.
  const held = Boolean((RATE_HOLDS as unknown as Record<string, { promo?: string } | string>)[slug] && typeof (RATE_HOLDS as unknown as Record<string, unknown>)[slug] === "object");
  const card = held ? { ...filed, promo: undefined, rooms: filed.rooms.map((r) => ({ ...r, now: r.list })) } : filed;
  // the sample window the room rates were read for: the mid May 2027 search in the same file
  const w = CAYUGA_RATES.find((x) => x.id === "2027-05-11" && x.rates[slug]);
  const used = new Set<string>();
  const rooms = card.rooms.map((r) => {
    // a room photograph only when someone has described a filed photograph as that room (lib/content/photo-alts.json)
    const words = r.name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((x) => x.length > 3 && !["room", "suite", "bedroom", "bungalow", "deluxe"].includes(x));
    const filedPhoto = typeof roomPhotos[slug] === "object" ? (roomPhotos[slug] as Record<string, { id: string; alt: string }>)[r.name] : undefined;
    if (filedPhoto) return { ...r, photo: { url: `${CLOUD}/${filedPhoto.id}`, alt: filedPhoto.alt, described: true } };
    const photo = words.length ? photos.find((p) => p.described && !used.has(p.url) && words.every((x) => p.alt.toLowerCase().includes(x))) ?? null : null;
    if (photo) used.add(photo.url);
    return { ...r, photo };
  });
  const lows = card.rooms.reduce((a, r) => (r.now < a.now ? r : a), card.rooms[0]);
  const discounted = card.rooms.some((r) => r.now < r.list);
  return {
    rooms, promo: discounted ? card.promo ?? null : null, tax: card.tax,
    window: w ? { from: w.from, to: w.to, nights: Math.round((Date.parse(w.to) - Date.parse(w.from)) / 86400000) } : null,
    checked: RATES_CHECKED, from: { list: lows.list, now: lows.now },
    source: "lib/content/rates/cayuga-rates.ts (CAYUGA_ROOMS_MAY_2027)",
  };
}

function clean<T>(x: T): T {
  if (typeof x === "string") return (/[\u2013\u2014]/.test(x) && !/^https?:/.test(x) ? undash(x) : x) as T;
  if (Array.isArray(x)) return x.map(clean) as T;
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, clean(v)])) as T;
  return x;
}

export function journalStay(slug: string) {
  // House rule: no em or en dashes in public copy. The filed record is untouched; this is the page's display copy.
  const filedStay: StayData | undefined = JOURNAL_STAYS.includes(slug) ? stayBySlug(slug) : undefined;
  const s: StayData | undefined = filedStay ? clean(filedStay) : undefined;
  if (!s || !s.hero) return null;
  const path = `/stays/${s.slug}`;
  const filed: Photo[] = [s.hero, ...s.gallery].filter(Boolean).map((u, i) => {
    const alt = altFor(u as string, s.name, s.country, i);
    return { url: u as string, alt, described: !alt.startsWith(s.name) };
  });
  const slides: Photo[] = heroSlides(`stay:${s.slug}`, s.name, s.country).map((x) => ({ url: x.url, alt: x.alt, described: false }));
  // six frames for the hero: the stay's own hero set first, then its filed photographs, no frame twice
  const frames = [...slides, ...filed].filter((x, k, l) => l.findIndex((y) => y.url === x.url) === k).slice(0, 6);
  const rates = rateCard(s.slug, filed);
  const roomData = rates ? null : roomsFor(s.slug);
  // Every photograph for the viewer: the hero set and the filed set, each with what it shows where someone has
  // described it; then room photographs (from the rate card's rooms or the house room record) and any others the
  // library holds for this stay. No photograph twice.
  const notes = notesFor(s.slug);
  const base: ViewerPhoto[] = [...slides, ...filed].filter((x, k, l) => l.findIndex((y) => y.url === x.url) === k).map((x) => {
    const n = notes?.describe[lastPart(x.url)];
    if (n) return { url: x.url, alt: n.alt, section: n.section ?? sectionOf(n.alt) };
    return { url: x.url, alt: x.alt, section: x.described ? sectionOf(x.alt) : null };
  });
  const roomShots: ViewerPhoto[] = [
    ...(rates?.rooms ?? []).filter((r) => r.photo).map((r) => ({ url: (r.photo as Photo).url, alt: (r.photo as Photo).alt, section: "rooms" as const, room: r.name })),
    ...(roomData?.rooms ?? []).filter((r) => r.image).map((r) => ({ url: `${CLOUD}/${r.image!.id}`, alt: `${r.image!.alt} at ${s.name}`, section: "rooms" as const, room: r.name })),
  ];
  const extras: ViewerPhoto[] = (notes?.extra ?? []).map((x) => ({ url: `${CLOUD}/${x.id}`, alt: x.alt, section: x.section ?? sectionOf(x.alt) }));
  const photos = [...base, ...roomShots, ...extras].filter((x, k, l) => l.findIndex((y) => lastPart(y.url) === lastPart(x.url)) === k);
  const offers = offersFor(s.slug);
  const features = momentsFor(s.slug, rowsFrom(s.features.items, s.features.paras), filed.slice(1));
  const experiences = momentsFor(s.slug, rowsFrom(s.experiences.items, s.experiences.paras), filed.slice(1), 3, features);
  const host = hostFor(`stay:${s.slug}`);
  const suited = suitedTo([s.tagline, s.quote, ...s.why.map((w) => `${w.title ?? ""} ${w.body}`), ...s.onlyHere, ...s.rooms.paras, ...s.experiences.paras, ...s.features.paras].filter(Boolean).join(" "), s.bestFor, 4, s.name);
  const bestFor = s.bestFor.map((b) => BEST_FOR[b] ?? b).slice(0, 4);
  const kind = (s.category && KIND[s.category]) || "stay";
  // the same answer-first paragraph the stay page has always opened with, for search and answer engines
  const answer = `${s.name} is a ${kind}${s.country ? ` in ${s.country}` : ""}, filed in the James Wild & Co Ledger${s.ledgerId ? ` under ${s.ledgerId}` : ""}.${s.tagline ? ` ${s.tagline.replace(/\.$/, "")}.` : ""}${s.bestMonths ? ` Best months: ${s.bestMonths}.` : ""}${suited.length ? ` Best suited to ${suited.join(", ").toLowerCase()}.` : bestFor.length ? ` Best for ${bestFor.join(", ").toLowerCase()}.` : ""}${s.airport ? ` Nearest airport: ${s.airport}.` : ""} Vetted for the Ledger by the house.`;
  return {
    s, path, filed, slides, frames, rates, offers, features, experiences, suited, answer, kind,
    // the stay's own films: a hero film (muted, looping) and a longer stay film for the Film section; either may be absent
    heroFilm: STAY_FILMS[s.slug]?.hero ? STAY_FILMS[s.slug] : null, video: VIDEOS[`stay:${s.slug}`] ?? null,
    // rooms filed with the house's own room record (shown with its own component, unchanged) where no rate card above applies
    roomData, photos,
    host, hostReady: host.state === "available" && !!host.host,
    credit: PHOTO_CREDIT[s.slug] ?? null,
    routes: routesThrough(s.slug).map((t) => ({ href: t.seo.path, title: t.h1 })),
    planHref: `/plan?trip=${encodeURIComponent(s.name)}`,
    whyShort: s.why.filter((w) => w.title).slice(0, 3).map((w) => ({ title: w.title as string, line: firstSentence(w.body) })),
    roomsLede: s.rooms.paras[0] ? firstSentence(s.rooms.paras[0]) : null,
  };
}
export type JournalStay = NonNullable<ReturnType<typeof journalStay>>;
