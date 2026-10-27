// The Journal: James's own stories, brought over from the Base44 library
// (Story records, "Wild Edit") one at a time and redesigned for the house.
// Each post carries its Ledger ID, the stays it is about (for cross-links
// both ways), its film when there is one, and the FAQs it answers on the
// page (and only those go into FAQPage schema).
//
// Body copy is James's library text, lightly edited for the site: library
// notes to the team are removed, and "James Wild & Co should" reads "we".
import { MONWANA_BODY } from "./monwana-couples-first-safari";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
// Full-resolution delivery: AI upscale for anything under ~2400px wide, then
// Cloudinary's best-quality JPEG. next/image takes the widths it needs.
const hi = (id: string, up = true) => `${CLD}/${up ? "e_upscale/" : ""}c_limit,w_3200/q_auto:best/f_jpg/${id}`;
const MON = "wildco/south-africa/monwana-thornybush";

export type JournalImage = { url: string; alt: string; w: number; h: number; caption?: string };
export type JournalFigure = { after: string; layout: "bleed" | "wide" | "pair" | "tall"; images: JournalImage[] };
export type JournalPost = {
  slug: string;
  ledgerId: string;
  shelf: "Captain's Log" | "Field notes";
  title: string;
  seoTitle: string;
  description: string;
  dek: string;
  answer: string;
  place: string;
  trip?: string;
  published: string;
  modified: string;
  readMinutes?: number;
  hero: JournalImage;
  film?: { id: string; title: string; description: string; uploadDate: string; after: string };
  body: string;
  figures: JournalFigure[];
  pull?: { text: string; after: string };
  close: string;
  faqs: { q: string; a: string }[];
  stays: { slug: string; name: string; line: string; image: JournalImage }[];
  links: { label: string; href: string; line: string }[];
  keywords: string[];
  about: string[];
  oldUrl?: string;
  approved?: boolean; // James's OK on the Proofs sheet; indexable once true
  youtube?: string;
};

export const POSTS: Record<string, JournalPost> = {
  "monwana-couples-first-safari": {
    slug: "monwana-couples-first-safari",
    ledgerId: "WED-2026-000013",
    shelf: "Captain's Log",
    title: "Wild Together: My Wife's First Safari at Monwana",
    seoTitle: "Monwana Safari Review: My Wife's First Safari in Thornybush",
    description: "Why intimate Monwana in Thornybush suited my wife's first safari, with practical advice for couples planning Greater Kruger: nights, seasons, flights and what to ask.",
    dek: "My wife's first safari reminded me that the wild becomes new when you share it. Why this small Thornybush lodge works so well for couples, and what first-timers should know.",
    answer: "Monwana suits a couple's first safari because it is small: six suites and a villa for 24 guests at most, open vehicles that carry no more than six, and twice-daily drives with a guide and tracker in Thornybush, on an unfenced boundary with Greater Kruger. Stay three nights at least; four is better. Hoedspruit is about 45 minutes away.",
    place: "Monwana · Thornybush · South Africa",
    trip: "May 2026",
    published: "2026-09-15",
    modified: "2026-10-27",
    hero: { url: hi(`jwco/journal/monwana-couples-first-safari/hero-deck-sunset`), alt: "Monwana's raised wooden dining deck over the river at sunset, Thornybush, South Africa", w: 1600, h: 900 },
    film: {
      id: "YR_8uiBObZ4",
      title: "Wild Together: My Wife's First Safari, Monwana, Thornybush",
      description: "My wife's first safari, filmed on location at Monwana in Thornybush Private Game Reserve, Greater Kruger: the intimate, guide-led stay we recommend to couples and honeymooners on a first safari.",
      uploadDate: "2026-09-23",
      after: "why-did-i-choose-monwana-for-my-wife-s-first-safari",
    },
    body: MONWANA_BODY,
    figures: [
      { after: "what-changes-when-you-share-a-safari-as-a-couple", layout: "bleed", images: [{ url: hi(`${MON}/monwana-safari-drive`), alt: "Guests in an open game vehicle watching wildlife at Monwana, Thornybush", w: 1500, h: 1000, caption: "Six to a vehicle, at most. Everyone gets the good seat." }] },
      { after: "what-is-monwana-actually-like", layout: "pair", images: [
        { url: hi(`${MON}/monwana-game-lodge`), alt: "A Monwana suite opening onto its private deck and plunge pool", w: 1311, h: 874, caption: "Six suites and a villa. Small enough to know your name by lunch." },
        { url: hi(`${MON}/monwana-villa-pool-elephants`), alt: "Elephants at the waterhole beyond the Monwana pool", w: 1920, h: 1280, caption: "The pool faces the waterhole. The elephants keep their own hours." },
      ] },
      { after: "does-a-quieter-private-reserve-mean-less-wildlife", layout: "tall", images: [
        { url: hi(`${MON}/leopard-thornybush-monwana`), alt: "A leopard watching through the long grass on Thornybush", w: 1080, h: 1920, caption: "Thornybush is known for its leopards. Known, not promised." },
        { url: hi(`${MON}/monwana-tracker-safari-vehicle`), alt: "A Monwana tracker on the front seat of the game vehicle", w: 2400, h: 3000, caption: "The tracker reads the road before anyone else sees a thing." },
      ] },
      { after: "what-should-first-time-safari-travelers-expect-each-day", layout: "bleed", images: [{ url: hi(`${MON}/monwana-dining-deck`), alt: "Dinner laid on the Monwana deck at dusk", w: 1920, h: 1280, caption: "Dinner is part of the day, because the day gave you something to talk about." }] },
      { after: "is-monwana-right-for-every-couple", layout: "wide", images: [{ url: hi(`${MON}/monwana-fire-pit`, false), alt: "Evening around the fire pit at Monwana under the night sky", w: 3600, h: 2400, caption: "After the night drive: the fire pit, and no one checking a phone." }] },
    ],
    pull: { text: "Safari had already taught me how to look at the wild. Watching my wife discover it taught me how much more we see when wonder is shared.", after: "what-did-my-wife-s-first-safari-teach-me" },
    close: "James Papagno",
    faqs: [
      { q: "Is Monwana good for a first safari?", a: "Yes. Its small guest capacity, vehicles limited to six guests and guided twice-daily drives can make the experience approachable and personal. Wildlife sightings can never be guaranteed." },
      { q: "How many nights should a couple spend at Monwana?", a: "Three nights is a practical minimum. Four nights offers a better balance of game drives, rest and flexibility." },
      { q: "Is Monwana inside Kruger National Park?", a: "No. Monwana is in Thornybush Nature Reserve, which shares an unfenced boundary with the Greater Kruger ecosystem." },
      { q: "Can couples request a private safari vehicle?", a: "Private vehicle arrangements may be available, and the exclusive-use villa includes a private safari setup according to current lodge information. Confirm availability and cost for the specific booking." },
      { q: "What is the best season for Monwana?", a: "The lodge operates year-round. May through September is generally drier with thinner vegetation; October through April is warmer, greener and particularly rewarding for birding." },
      { q: "How far is Monwana from Hoedspruit Airport?", a: "The lodge currently states approximately 45 minutes by road and provides complimentary airport transfers. Confirm this with the final flight itinerary." },
      { q: "Is Thornybush a malaria area?", a: "Yes. The lodge describes the area as low risk, but travelers should seek current advice from a qualified medical professional about prevention and medication." },
      { q: "Can children stay at Monwana?", a: "Current lodge guidance permits children aged ten and older in the lodge suites. The exclusive-use villa welcomes children of all ages. Reconfirm age policies before booking." },
    ],
    stays: [{ slug: "monwana-thornybush", name: "Monwana", line: "Thornybush, Greater Kruger · six suites and a villa", image: { url: hi(`${MON}/elephant-thornybush-monwana`), alt: "An elephant bull on the Thornybush reserve near Monwana", w: 1920, h: 1281 } }],
    links: [
      { label: "Monwana, the stay", href: "/stays/monwana-thornybush", line: "Suites, rates, the film and James's verdict." },
      { label: "South Africa", href: "/destinations/africa/south-africa", line: "Every stay and reserve the house has vetted in South Africa." },
      { label: "Wild & Co Safaris", href: "/safaris", line: "Private guided safaris, built around the right lodges." },
      { label: "Meet James", href: "/about/founder", line: "Forty-four years on the road, safaris since 2011." },
    ],
    keywords: ["Monwana safari review", "couples safari South Africa", "Thornybush safari", "first safari in South Africa", "Greater Kruger safari lodge", "private game reserve for couples", "luxury safari for couples", "Monwana Game Lodge", "South Africa honeymoon safari"],
    about: ["Monwana", "Thornybush Nature Reserve", "Greater Kruger", "Couples safari"],
    oldUrl: "/memoir/monwana-couples-first-safari",
    youtube: "https://www.youtube.com/watch?v=YR_8uiBObZ4",
  },
};

export const POST_LIST = Object.values(POSTS).sort((a, b) => b.published.localeCompare(a.published));
export const postsForStay = (slug: string) => POST_LIST.filter((p) => p.stays.some((s) => s.slug === slug));
export const journalPath = (slug: string) => `/journal/${slug}`;
