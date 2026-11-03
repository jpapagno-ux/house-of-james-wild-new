// The grand entrances of the six volume landing pages (preview, 2 Nov 2026).
// One record per volume: the eyebrow and title come from lib/volumes.ts, the
// two-sentence summary from the volume's own copy (lib/content/home.ts volumes,
// lib/site.ts intros and each hub's answer block; nothing new is claimed), the
// pull quote from James's Voice Bank, and the media:
//   Stays     the house film (the homepage hero loop, Felix Studios)
//   Voyages   the Aliikai film (her own YouTube Short, as on her ship page)
//   the rest  a slow crossfade of licensed Getty images (Cloudinary, web and
//             marketing, no credit line) and brand photographs already used on
//             that volume's own pages.
// Quotes: a CHOSEN line (lib/content/voice/chosen.ts) shows everywhere. A line
// still proposed in bank.json ("entrances") shows only on previews, tagged
// "Draft for James"; production shows the approved fallback instead, so an
// unapproved quote never goes live. All six are chosen (James, 3 Nov 2026:
// Gatherings and Other Europe approved), so no draft tag shows today.
import { CHOSEN } from "@/lib/content/voice/chosen";
import { VOICE_BANK } from "@/lib/content/voice/james-voice";
import { HOME, HOUSE_LOOP } from "@/lib/content/home";
import { FILMS, type ShortFilm } from "@/lib/content/films";
import { REGION_DATA } from "@/lib/content/regions";
import { STAYS, altFor } from "@/lib/content/stays";
import { VOLUME_STYLES, volumeEyebrow, type VolumeKey } from "@/lib/volumes";

export type EntranceSlide = { url: string; alt: string };
export type EntranceMedia =
  | { kind: "film"; mp4: string; webm?: string; poster: string; alt: string; text: string }
  | { kind: "short"; film: ShortFilm; text: string }
  | { kind: "slides"; slides: EntranceSlide[] };

export type Entrance = {
  key: VolumeKey;
  eyebrow: string; // "Volume II · Safaris & Reserves" (volumeEyebrow)
  title: string; // the volume name, the page's h1
  summary: [string, string]; // what the volume is · why it is in the house
  quote: { text: string; status: "chosen" | "draft"; id: string };
  media: EntranceMedia;
  plan: string; // the Ledger column's href
};

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const GETTY = (id: string) => `${CLD}/c_limit,w_2560/q_auto:good/f_jpg/GettyImages-${id}`;
const CLDI = (publicId: string) => `${CLD}/c_limit,w_2560/q_auto:good/f_jpg/${publicId}`;
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";

/** True on previews and local builds; false only on the production deployment. */
export const IS_PREVIEW = process.env.VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production";

/** A Voice Bank line: CHOSEN wins; a proposed line shows only on previews, else the approved fallback. */
function voice(id: string, fallback: string): Entrance["quote"] {
  if (CHOSEN[id]) return { text: CHOSEN[id], status: "chosen", id };
  const draft = VOICE_BANK.find((s) => s.id === "entrances")?.items.find((i) => i.id === id)?.line;
  if (draft && IS_PREVIEW) return { text: draft, status: "draft", id };
  return { text: CHOSEN[fallback], status: "chosen", id: fallback };
}

const eyebrow = (k: VolumeKey) => volumeEyebrow(k, VOLUME_STYLES[k].label);
const stay = (slug: string) => STAYS.find((s) => s.slug === slug);
const stayPhoto = (slug: string): EntranceSlide[] => {
  const s = stay(slug);
  return s?.hero ? [{ url: s.hero, alt: altFor(s.hero, s.name, s.country) }] : [];
};
const shelf = (slug: string) => HOME.shelf.entries.find((s) => s.slug === slug)?.image;
const europeHero = REGION_DATA.find((r) => r.slug === "europe")?.hero ?? null;

export const ENTRANCES: Record<VolumeKey, Entrance> = {
  stays: {
    key: "stays",
    eyebrow: eyebrow("stays"),
    title: "Stays",
    summary: [
      "Lodges, camps, island hideaways and private houses, each vetted in person and bookable at live rates.",
      "Each one is filed in the Ledger under a permanent ID and a last fact-checked date before it is offered to you.",
    ],
    quote: voice("signoff-3", "signoff-3"),
    media: { kind: "film", mp4: HOUSE_LOOP.mp4, webm: HOUSE_LOOP.webm, poster: HOUSE_LOOP.poster, alt: HOUSE_LOOP.label, text: "The house film by Felix Studios: wild places by land and by water, the stays the house was built on." },
    plan: "/plan",
  },
  safaris: {
    key: "safaris",
    eyebrow: eyebrow("safaris"),
    title: "Safaris",
    summary: [
      "Africa only: camps by reserve, from the Sabi Sand to the Okavango, with the islands of the Indian Ocean as add-ons.",
      "James has designed safaris since 2011, and each one is booked through Wild & Co Safaris with partner guides on the ground.",
    ],
    quote: voice("signoff-5", "signoff-5"),
    media: {
      kind: "slides",
      slides: [
        { url: GETTY("578876890"), alt: "A hot-air balloon drifting over acacia savanna dotted with grazing herds at sunrise, Serengeti, Tanzania" },
        { url: GETTY("522040170"), alt: "A cheetah facing a gathering thunderstorm on the Serengeti plains, Tanzania" },
        ...(shelf("lion-sands") ? [shelf("lion-sands")!] : []),
        { url: GETTY("813447208"), alt: "A maned male lion resting in warm late light, Kruger National Park, South Africa" },
        ...(shelf("monwana-thornybush") ? [shelf("monwana-thornybush")!] : []),
      ],
    },
    plan: "/plan",
  },
  gatherings: {
    key: "gatherings",
    eyebrow: eyebrow("gatherings"),
    title: "Gatherings",
    summary: [
      "Generational travel: whole houses and resort residences where the family stays under one roof, with adventures planned for every age.",
      "Each residence is filed in the Ledger with its own ID and notes on who it suits, so nobody ends up on the sofa.",
    ],
    quote: voice("en-gatherings", "signoff-2"),
    media: {
      kind: "slides",
      slides: [
        { url: GETTY("1363882925"), alt: "Family and friends sharing breakfast on a shaded terrace above the sea" },
        ...(shelf("leeu-house") ? [shelf("leeu-house")!] : [{ url: `${B44}/ae294f982_cc67a2d17_6a230a0a714287d73d103c0e_5fdc91f8cde8e-Header.jpg`, alt: "The entrance garden at Leeu House, Franschhoek, with mountains above the village" }]),
        { url: GETTY("538264901"), alt: "A family group lying together on a beach near sunset, Poipu, Kauai" },
        // Added 3 Nov 2026 (James asked for six to eight): partner photographs from each brand's own
        // record in the Ledger, rights approved in Cloudinary, credited in photo-credits.json.
        // Getty 1205839281 (the homepage Stays card) is no longer repeated here.
        { url: CLDI("gatherings/fish-eagle-villa-lion-sands/outside-dining-fish-eagle-villa"), alt: "Supper laid on a long table outside Fish Eagle Residence, Lion Sands, Sabi Sand, South Africa (photograph courtesy of MORE)" },
        { url: CLDI("wildco/south-africa/thornybush/monwana-villa/monwana-villa-16"), alt: "Monwana Villa, an exclusive-use safari villa in the Thornybush Nature Reserve, South Africa (photograph courtesy of MORE)" },
        { url: CLDI("wildco/tanzania/serengeti-west/singita-serengeti-house/singita-serengeti-house-pool"), alt: "By the pool at Singita Serengeti House, Singita Grumeti, Serengeti, Tanzania (photograph courtesy of Singita)" },
        { url: CLDI("wildco/zimbabwe/malilangwe/singita-malilangwe-house/singita-malilangwe-house-breakfast"), alt: "Breakfast on the deck at Singita Malilangwe House, Malilangwe Wildlife Reserve, Zimbabwe (photograph courtesy of Singita)" },
      ],
    },
    plan: "/plan",
  },
  voyages: {
    key: "voyages",
    eyebrow: eyebrow("voyages"),
    title: "Voyages",
    summary: [
      "Small ships and sailing yachts, never the big ones: Nile riverboats, Galápagos yachts, Amazon river ships and phinisis in Indonesia.",
      "James has been sailing since 1989 and sailed Raja Ampat aboard Aliikai in November 2024; every ship page lists her cabins and every published fare.",
    ],
    quote: voice("signoff-6", "signoff-6"),
    media: { kind: "short", film: FILMS.aliikai, text: `${FILMS.aliikai.title}. ${FILMS.aliikai.description} ${FILMS.aliikai.credit}.` },
    plan: "/plan",
  },
  europe: {
    key: "europe",
    eyebrow: eyebrow("europe"),
    title: "Other Europe",
    summary: [
      "Not the capitals and the queues: the valleys, islands and river towns James keeps going back to.",
      "Country houses, quintas and alpine lodges, often paired with a river cruise, planned for three nights or more in each place.",
    ],
    quote: voice("en-europe", "signoff-7"),
    media: {
      kind: "slides",
      slides: [
        ...(europeHero ? [{ url: europeHero, alt: "Other Europe: a valley, an island or a river town away from the capitals" }] : []),
        { url: GETTY("1479784885"), alt: "Evening light on a cliff above the Atlantic, Madeira, Portugal, from the air" },
        { url: GETTY("699088407"), alt: "A young ibex on a steep slope in front of Mont Blanc, on the Tour du Mont Blanc above Chamonix, France" },
        ...stayPhoto("six-senses-douro-valley"),
        { url: GETTY("541411638"), alt: "The Markarfljót river braiding across black sand into a lake, Iceland, from the air" },
      ],
    },
    plan: "/plan",
  },
  overland: {
    key: "overland",
    eyebrow: eyebrow("overland"),
    title: "Overland",
    summary: [
      "Land routes James designed, stop by stop, with the drive times, what to expect and what to avoid.",
      "Every stay along the way is already vetted in the Ledger: take a route as filed, or let James reshape it around your dates.",
    ],
    quote: voice("signoff-4", "signoff-4"),
    media: {
      kind: "slides",
      slides: [
        { url: GETTY("906210770"), alt: "Two giraffes standing in golden grassland under a glowing sky, Serengeti, Tanzania" },
        { url: GETTY("1201436116"), alt: "Elephants walking among drowned trees above still water at last light" },
        { url: GETTY("1320314363"), alt: "A rafting team running white water on the Pacuare River, Costa Rica" },
        { url: `${CLD}/c_limit,w_2560/q_auto:good/f_jpg/wildco/south-africa/sabi-sand/londolozi/londolozi-leopard-cubs-in-tree`, alt: "Leopard cubs in a tree at Londolozi, Sabi Sand, South Africa (photograph courtesy of Londolozi)" },
        { url: GETTY("1169946098"), alt: "A red-eyed tree frog climbing a stem in the Costa Rican rainforest" },
      ],
    },
    plan: "/plan",
  },
};
