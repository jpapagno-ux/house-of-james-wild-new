// Stays, from the Ledger export (scripts/export-stays.py → stays.json).
// A stay gets its own page only when it has a hero photo and some content.
import data from "./stays.json";
import { HERO_OVERRIDE } from "./stay-media";

type Block = { paras: string[]; items: string[] };
export type StayData = {
  slug: string; name: string; ledgerId: string | null; country: string | null; countrySlug: string | null; regionSlug: string | null; misfiled: string | null;
  category: string | null; tagline: string | null; quote: string | null; hero: string | null; gallery: string[];
  bestMonths: string | null; bestMonthsNote: string | null; bestFor: string[]; status: string | null; statusDate: string | null;
  coords: { lat: number; lng: number } | null; airport: string | null; airportDirections: string | null; founderNote: string | null;
  rooms: Block; experiences: Block; features: Block; onlyHere: string[]; why: { title: string | null; body: string }[];
  facts: Record<string, string>; faqs: { q: string; a: string }[]; reviewed: boolean; reserveChild: boolean; parentSlug: string | null; engine: string | null;
  // Wild Pathways (Phase 2A): carried by the export once the library has the fields; absent or null until then.
  pathway?: { primary: string; secondary: string[]; setting: string | null; intentions: string[]; suitability: string[]; status: "draft" | "approved"; classifiedBy: string | null; classifiedAt: string | null } | null;
  volumes?: string[] | null;
};

const has = (b: Block) => b.paras.length > 0 || b.items.length > 0;
export const pageReady = (s: StayData) => !!s.hero && (has(s.rooms) || has(s.features) || s.why.length > 0 || s.onlyHere.length > 0);

// Webflow names carry display line breaks ("Leeu House \n South Africa"), which
// leaked into <title>, schema and alt text. Clean names here so every page,
// title and JSON-LD gets one line; the trailing country/tagline line is dropped.
const NAME_FIX: Record<string, string> = {
  "arenas-del-mar-resort": "Arenas del Mar Resort", "la-cle": "La Cle", "lalibela-reserve": "Lalibela Reserve",
  "le-quartier-francais": "Le Quartier Francais", "leeu-estates": "Leeu Estates", "leeu-house": "Leeu House",
  "lion-sands": "Lion Sands Reserve", "londolozi-reserve": "Londolozi Reserve", "morukuru-farm-house": "Morukuru Farm House",
  "nayara-gardens": "Nayara Gardens", "nayara-tented-camp": "Nayara Tented Camp", "noah-forest-by-tifakara": "Noah’s Forest by Tifakara",
  "pearl-resort-vahine-private-island": "Vahine Private Island", "senda-monteverde-lodge": "Senda Monteverde Lodge",
  "seseka-thornybush": "Seseke Tented Camp", "singita-ebony": "Singita Ebony Lodge", "sirai-house": "Sirai House",
  "tabacon-thermal-resort-spa": "Tabacón Thermal Resort & Spa", "tengile-mala-mala-kirkmans-kamp": "Kirkman's Kamp",
  "tengile-mala-mala-rattrays-lodge": "Rattray's Lodge", "tengile-mala-mala-sable-camp": "Sable Camp", "thornybush-reserve": "Thornybush Reserve",
};
const cleanName = (s: StayData) => NAME_FIX[s.slug] ?? s.name.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

// Live booking-engine property keys (book.wildearthstays.com, Tag Albie) the
// library export does not carry yet; read from the engine's property index on
// 1 Nov 2026. The Jimbaran key really does end in a hyphen. Set these on the
// library Stay records and this map can go.
export const ENGINE_OVERRIDE: Record<string, string> = {
  "kayumanis-nusa-dua": "kayumanis-nusa-dua",
  "kayumanis-ubud": "kayumanis-ubud",
  "kayumanis-jimbaran-private-estates": "kayumanis-jimbaran-private-estates-",
};

export const STAYS: StayData[] = (data.stays as StayData[]).map((s) => ({ ...s, name: cleanName(s), ...(HERO_OVERRIDE[s.slug] ? { hero: HERO_OVERRIDE[s.slug] } : {}), ...(!s.engine && ENGINE_OVERRIDE[s.slug] ? { engine: ENGINE_OVERRIDE[s.slug] } : {}) }));
export const STAY_PAGES = STAYS.filter(pageReady);
export const stayBySlug = (slug: string) => STAY_PAGES.find((s) => s.slug === slug);
export const staysIn = (countrySlug: string) => STAYS.filter((s) => s.countrySlug === countrySlug);
export const BEST_FOR: Record<string, string> = { honeymoon: "Honeymoons", family: "Families", adventure: "Adventure", luxury: "Luxury", solo: "Solo travel", wildlife_photography: "Wildlife photography", group_exclusive_use: "Groups and exclusive use", first_safari: "First safaris", wine: "Wine lovers" };

// Alt text from the photo's own file name, which in the library usually says
// what is in the frame ("Sossusvlei-Desert-Lodge-Room-Suite-lounge" -> "Suite
// lounge at & Beyond Sossusvlei Desert Lodge, Namibia"). Words that repeat the
// stay or country, upload ids and size notes are dropped; with too little left
// it falls back to the stay and country.
const ALT_DROP = /^(jpe?g|png|avif|webp|low|high|resolution|width|height|px|copy|final|edit|img|image|dsc|gettyimages|carousel|hero|general|guest|area|\d+|[a-f0-9]{6,})$/i;
export function altFor(url: string, name: string, country: string | null, i = 0): string {
  const where = `${name}${country ? `, ${country}` : ""}`;
  let file = url.split("?")[0].split("/").pop() ?? "";
  try { file = decodeURIComponent(file); } catch { /* keep raw */ }
  file = file.replace(/\.[a-z0-9]{3,4}$/i, "").replace(/^([a-z0-9]{9}_){1,2}[a-f0-9]{24}_/i, "").replace(/_20/g, " ");
  const own = new Set(`${name} ${country ?? ""}`.toLowerCase().replace(/[’']s\b/g, "").split(/[^a-z0-9]+/).filter(Boolean));
  const words = file.split(/[\s_\-.=%]+/).filter((w) => w && !ALT_DROP.test(w) && !own.has(w.toLowerCase().replace(/[’']s$/, "")));
  if (!words.length || (words.length === 1 && words[0].length < 4)) return i ? `${where}: photograph ${i + 1}` : where;
  const what = words.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
  return `${what.charAt(0).toUpperCase()}${what.slice(1)} at ${where}`;
}
