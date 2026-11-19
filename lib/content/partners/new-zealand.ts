import type { Partner } from "./types";
import type { ShipImage } from "@/lib/content/ships/types";

// The Lindis Group, house partner (James, 16 Nov 2026: "we're an approved partner... rights for videos and photos...
// credit"). Facts from thelindisgroup.com (the lodge, villa and estate pages and the trade and media page, read 16 Nov
// 2026). Media from the group's trade and media page, credited to The Lindis Group. Never commission or net rates.
const C = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const img = (id: string, alt: string): ShipImage => ({ url: `${C}/${id}`, alt, credit: "The Lindis Group" });

export const THE_LINDIS_GROUP: Partner = {
  slug: "the-lindis-group",
  name: "The Lindis Group",
  kind: "Lodge and villa collection",
  seo: {
    title: "The Lindis Group: The Lindis Lodge, Mt Isthmus Villa and Paroa Bay, New Zealand",
    description: "The Lindis Group, a house partner in New Zealand: The Lindis in the Ahuriri Valley (Two MICHELIN Keys), Mt Isthmus Villa between Lake Wanaka and Lake Hawea, and Paroa Bay above the Bay of Islands, with Sage restaurant and Clos Ostler.",
    keywords: ["The Lindis", "The Lindis Lodge", "Ahuriri Valley lodge", "Mt Isthmus Villa", "Paroa Bay", "Tarapunga Villa", "Bay of Islands luxury villa", "New Zealand luxury lodge", "Clos Ostler"],
  },
  line: "High country, lake country and the Bay of Islands: a lodge, a villa and an estate, each a long way from anywhere else.",
  answer: "The Lindis Group is a New Zealand collection of three places to stay and two to eat and drink. The Lindis Lodge rests on the floor of the Ahuriri Valley on a 6,500 acre station near Omarama, with five suites and three mirrored Pods and Two MICHELIN Keys. Mt Isthmus Villa stands alone on the ridge between Lake Wanaka and Lake Hawea with its own chef and host. Paroa Bay is a vineyard estate above the Bay of Islands, with Tarapunga Villa and Sage, its one-hat restaurant. Clos Ostler makes wine in the Waitaki Valley. The house is a partner, and plans every stay through the group's own reservations team.",
  who: {
    facts: [
      ["South Island", "The Lindis Lodge, Ahuriri Valley, Omarama; Mt Isthmus Villa, Lake Hawea; Clos Ostler, Waitaki Valley"],
      ["North Island", "Paroa Bay and Sage Restaurant, Russell, Bay of Islands"],
      ["Recognition", "The Lindis: Two MICHELIN Keys from the MICHELIN Guide (per The Lindis Group)"],
      ["The house", "Partner (James, 16 Nov 2026)"],
    ],
  },
  how: {
    paragraphs: [
      "At The Lindis the valley does the talking. Two Master Suites and three Lodge Suites sit in the Main Lodge behind walls of glass; three Pods, walled in mirrored glass on three sides with an outdoor bath, sit out of sight a stone's throw away. Every stay includes pre-dinner drinks, a multi-course dinner each night and lunch at the lodge or in a pack for the hills. Fly fishing on the Ahuriri River starts a short walk from the door; horse treks leave from the lodge's own stables.",
      "Mt Isthmus Villa is taken whole, twenty minutes from Lake Wanaka, with a personal chef and a villa host: hiking and rafting, world-class wines and heli trips from the doorstep. Paroa Bay is a vineyard estate on a north-facing inlet near Russell, where Tarapunga, the three-bedroom villa, looks over its infinity pool to the Bay of Islands, and Sage serves the estate's coast and garden.",
      "The South Island pair link by road or helicopter; Paroa Bay is a 30 minute flight from Auckland to Kerikeri and a 40 minute drive. The house plans the order, the transfers and the helicopters with the group's reservations team.",
    ],
    facts: [
      ["The Lindis", "Queenstown 2 hours 15 by road; helipad on site; Christchurch about 4.5 hours"],
      ["Mt Isthmus", "20 minutes from Lake Wanaka; by road or helicopter"],
      ["Paroa Bay", "Auckland to Kerikeri 30 minutes by air, then 40 minutes; Russell 15 minutes"],
    ],
  },
  itineraries: {
    title: "The Lindis Group on the Ledger",
    items: [
      { name: "The Lindis", href: "/stays/lindis-lodge", eyebrow: "Ahuriri Valley · South Island", line: "Five suites and three mirrored Pods on a 6,500 acre high-country station. Two MICHELIN Keys.", image: img("jwco/stays/new-zealand/the-lindis/pod-stars", "A Lindis Pod glowing under the night sky") },
      { name: "Mt Isthmus Villa", href: "/stays/mt-isthmus-villa", eyebrow: "Lake Hawea · South Island", line: "One villa between two glacial lakes, with its own chef and host.", image: img("jwco/stays/new-zealand/mt-isthmus/aurora", "The aurora australis over Mt Isthmus Villa") },
      { name: "Paroa Bay", href: "/stays/paroa-bay", eyebrow: "Bay of Islands · North Island", line: "A vineyard estate above a quiet inlet, Tarapunga Villa and Sage restaurant.", image: img("jwco/stays/new-zealand/paroa-bay/hero", "Tarapunga Villa's infinity pool above the Bay of Islands") },
    ],
  },
  apart: [
    { claim: "Resting almost undetectably on the valley floor", attribution: "The Lindis Group, on The Lindis Lodge" },
    { claim: "Fly fishing on the Ahuriri River, rated among the top ten rivers in the world", attribution: "The Lindis Group" },
    { claim: "Stargazing beneath some of the world's darkest skies", attribution: "The Lindis Group" },
  ],
  why: [
    "Three very different New Zealands, valley, lakes and coast, under one reservations team, which keeps a two-island journey simple.",
    "Every stay at The Lindis includes dinner and drinks, so the price is the price.",
    "Helicopter access to the South Island pair, and a lodge for a couple or a villa for a family.",
  ],
  faqs: [
    ["Where is The Lindis?", "In the Ahuriri Valley near Omarama in New Zealand's South Island, on Ben Avon Station, about 2 hours 15 minutes by road from Queenstown, with its own helipad."],
    ["What are the Pods at The Lindis?", "Three architect-designed rooms a short walk from the Main Lodge, with mirrored glass walls on three sides, an outdoor bath and a king bed facing the valley."],
    ["Is food included at The Lindis?", "Yes: nightly pre-dinner drinks and canapes, a nightly multi-course dinner, and a daily lodge lunch or packed lunch on stayover days."],
    ["Where is Mt Isthmus Villa?", "On the isthmus between Lake Wanaka and Lake Hawea, 20 minutes from Wanaka, reached by road or helicopter."],
    ["How do you get to Paroa Bay?", "Fly Auckland to Kerikeri (30 minutes), then drive 40 minutes; Russell is 15 minutes away. Boat and helicopter arrivals can be arranged."],
  ],
  hero: img("jwco/stays/new-zealand/the-lindis/hero", "The Lindis Lodge lit at dusk on the floor of the snow-covered Ahuriri Valley"),
  gallery: [
    img("jwco/stays/new-zealand/the-lindis/ahuriri-aerial", "The braided Ahuriri River beneath snowy peaks"),
    img("jwco/stays/new-zealand/mt-isthmus/hero", "Mt Isthmus Villa's folded roofline above the lakes at sunset"),
    img("jwco/stays/new-zealand/the-lindis/horse-trek", "Riders crossing the river on a horse trek"),
    img("jwco/stays/new-zealand/paroa-bay/villa", "Tarapunga Villa in the bush above the inlet"),
  ],
  credit: "The Lindis Group",
  related: [{ label: "New Zealand", href: "/destinations/oceania/new-zealand" }, { label: "Central Otago and the Lakes", href: "/destinations/oceania/new-zealand/central-otago" }, { label: "Northland", href: "/destinations/oceania/new-zealand/northland" }],
  organization: { locality: "Omarama", country: "NZ" },
  sources: ["https://www.thelindisgroup.com/", "https://www.thelindisgroup.com/thelindislodge", "https://www.thelindisgroup.com/mtisthmus", "https://www.thelindisgroup.com/paroabay", "https://www.thelindisgroup.com/tradeandmedia"],
  checked: "2026-11-16",
};
