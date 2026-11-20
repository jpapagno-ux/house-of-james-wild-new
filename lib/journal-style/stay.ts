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

/** The stays that have the Modern Journal page (the pilot's sample pages). One list, read by next.config.ts too. */
export const JOURNAL_STAYS: string[] = PAGES.stays;

export type Photo = { url: string; alt: string; described: boolean };
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

const firstSentence = (t: string) => (t.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? t).trim();
const KIND: Record<string, string> = { hotel: "hotel", lodge: "lodge", villa: "private villa", camp: "camp", resort: "resort", residence: "residence" };

function rateCard(slug: string, photos: Photo[]): RateCard | null {
  const card = CAYUGA_ROOMS_MAY_2027[slug];
  if (!card?.rooms.length) return null;
  // the sample window the room rates were read for: the mid May 2027 search in the same file
  const w = CAYUGA_RATES.find((x) => x.id === "2027-05-11" && x.rates[slug]);
  const used = new Set<string>();
  const rooms = card.rooms.map((r) => {
    // a room photograph only when someone has described a filed photograph as that room (lib/content/photo-alts.json)
    const words = r.name.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((x) => x.length > 3 && !["room", "suite", "bedroom", "bungalow", "deluxe"].includes(x));
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

export function journalStay(slug: string) {
  const s: StayData | undefined = JOURNAL_STAYS.includes(slug) ? stayBySlug(slug) : undefined;
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
    roomData: rates ? null : roomsFor(s.slug),
    host, hostReady: host.state === "available" && !!host.host,
    credit: PHOTO_CREDIT[s.slug] ?? null,
    routes: routesThrough(s.slug).map((t) => ({ href: t.seo.path, title: t.h1 })),
    planHref: `/plan?trip=${encodeURIComponent(s.name)}`,
    whyShort: s.why.filter((w) => w.title).slice(0, 3).map((w) => ({ title: w.title as string, line: firstSentence(w.body) })),
    roomsLede: s.rooms.paras[0] ? firstSentence(s.rooms.paras[0]) : null,
  };
}
export type JournalStay = NonNullable<ReturnType<typeof journalStay>>;
