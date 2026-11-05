// The instruments of the house (James, 3 Nov 2026: "must be very organised so it's not
// confusing"). One vocabulary, used by /how-the-house-works, the three-word strip on
// country, hub and stay pages, the advisor page and Iggi's opening line:
//   The Compass chooses · The Atlas shows · Iggi explains, and hands you over.
// None of the three books anything; each ends at a person. Copy approved by James, 3 Nov 2026.
import { PATHWAYS_INDEX_HREF } from "@/lib/content/pathways/flag";

export type Instrument = { key: "compass" | "atlas" | "iggi"; no: string; name: string; verb: string; strip: string; href: string; cta: string; lede: string; useWhen: string; advisor: string };

export const INSTRUMENTS: Instrument[] = [
  {
    key: "compass", no: "01", name: "The Compass", verb: "it chooses", strip: "Read the Compass", href: "/compass", cta: "Read the Compass",
    lede: "Five questions: who is travelling, what draws you, the season, the pace, the privacy you want. The Compass reads the Ledger and answers with the places that fit, each with its reason in plain words and its Ledger number. Nothing is suggested that James has not stood in.",
    useWhen: "Use it when you do not yet know where to go.",
    advisor: "The Compass reads a client, and the Human Compass tells you who on the roster fits them.",
  },
  {
    key: "atlas", no: "02", name: "The Atlas", verb: "it shows", strip: "Open the Atlas", href: "/voyages#voyages-atlas", cta: "Open the Atlas",
    lede: "Every route, ship and camp of a volume on one chart that flies. Pick a route and the globe follows it; pick a ship and her sailings appear. The Atlas is how you see a journey fit together before anyone writes it down.",
    useWhen: "Use it when you know roughly where, and want to see how.",
    advisor: "The Atlas builds the route in front of the client.",
  },
  {
    key: "iggi", no: "03", name: "Iggi", verb: "it explains, and hands you over", strip: "Ask Iggi", href: "/plan/iggi", cta: "Ask Iggi",
    lede: "Iggi is the house's Field Guide, on every page. Ask about the place you are reading. Iggi answers only from the Ledger, cites the number of every record it draws on, and names the advisor who should plan the journey. When the journey takes shape, Iggi opens it as a Folio and passes it, with what it learned, to that person.",
    useWhen: "Use it when you have a question, or want to be pointed to the right person.",
    advisor: "Iggi is research with the Ledger open: shortlists with numbers, who on the roster has walked a place, and a Folio opened for the client.",
  },
];

export const HANDOFFS: { from: string; to: string; line: string }[] = [
  { from: "Compass", to: "Atlas", line: "the places a reading chooses can be flown to on the Atlas." },
  { from: "Atlas", to: "Iggi", line: "every route and ship can be asked about." },
  { from: "Iggi", to: "Compass", line: "Iggi can take your reading in conversation and show the same fits." },
  { from: "Iggi", to: "Atlas", line: "the places Iggi names in a chat appear on the Atlas beneath it, flown to in order." },
  { from: "Everything", to: "a person", line: "prices, availability and bookings stay with James or the advisor who knows the place. No instrument books." },
];

export const HOW_PATH = "/how-the-house-works";
export const PATHWAYS_HREF = PATHWAYS_INDEX_HREF;
