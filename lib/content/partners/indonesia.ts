import type { Partner } from "./types";
import type { ShipImage } from "@/lib/content/ships/types";
import Rascal from "@/lib/content/ships/indonesia/rascal.json";
import Rebel from "@/lib/content/ships/indonesia/rebel.json";
import ElAleph from "@/lib/content/ships/indonesia/el-aleph.json";
import Silolona from "@/lib/content/ships/indonesia/silolona.json";
import SiDatuBua from "@/lib/content/ships/indonesia/si-datu-bua.json";

// The two Indonesian fleet partners (James, 2 Nov 2026; voyages plan, Parts 12 and 16). Facts from each
// partner's own site only (rascalvoyages.com and its yacht and itinerary PDFs; silolona.com); claims about
// themselves are quoted and attributed. Both are founder vetted and founder favourites; James has not been
// aboard, so the wording is the vetted-only line (lib/ledger/status.ts, as for NIHI Rote). No commission,
// net rates or contact names. Celestia sells under her own name (celestiayacht.com), so she has no partner
// page of her own: her ship page carries it all.

type Img = { hero: { url: string; alt: string }; gallery: { url: string; alt: string }[] };
const hero = (s: Img, credit: string): ShipImage => ({ url: s.hero.url, alt: s.hero.alt, credit });
const g = (s: Img, credit: string, i: number): ShipImage => ({ url: s.gallery[i].url, alt: s.gallery[i].alt, credit });
const RELATED = [{ label: "Every yacht in Indonesia", href: "/voyages/indonesia" }, { label: "Komodo and Flores by private yacht", href: "/voyages/indonesia/komodo-and-flores-charter" }, { label: "Raja Ampat and Misool by private yacht", href: "/voyages/indonesia/raja-ampat-and-misool-charter" }];
const RV = "Rascal Voyages", SS = "Silolona Sojourns";

export const RASCAL_VOYAGES: Partner = {
  slug: "rascal-voyages",
  name: RV,
  kind: "Yacht charter operator",
  seo: {
    title: "Rascal Voyages Phinisi Yachts with James Wild & Co",
    description: "Rascal Voyages' three phinisis, Rascal, Rebel and El Aleph, for up to 10 guests in Komodo and Raja Ampat: published charter rates, cabin voyages and itineraries.",
    keywords: ["Rascal Voyages", "Rascal yacht", "Rebel yacht", "El Aleph yacht", "Komodo yacht charter", "Raja Ampat yacht charter", "phinisi charter Indonesia"],
  },
  line: "Three handmade phinisis for up to ten guests, sailing Komodo, Raja Ampat and the islands between, at published nightly rates.",
  answer: "Rascal Voyages runs three traditional handmade phinisis in Indonesia: Rascal and Rebel, 30 metres and 10 guests each, and El Aleph, 39 metres. All three charter whole, from US$12,000 a night plus taxes, and Rascal and Rebel also sell cabin voyages from US$2,500 a night per cabin. They sail Komodo from May to October and Raja Ampat from October to April, with a PADI dive instructor aboard and park fees and activities included.",
  who: {
    facts: [
      ["Who", "A yacht charter company running three phinisis in Indonesia, with a shore team and a Bali test kitchen for its menus"],
      ["Fleet", "Rascal (2015, 30 m), Rebel (2020, 30 m) and El Aleph (2008, 39 m, refitted by Rascal Voyages in 2025)"],
      ["Waters", "Komodo National Park, Raja Ampat, the Ring of Fire, the Spice Islands, the Eastern Lesser Sunda Islands and Wakatobi; Togean Islands and Triton Bay listed as coming soon"],
      ["Conservation", "Partners with The SEA People in Raja Ampat, on its Rascal Coral Garden at Yaf Keru, and supports The Manta Trust in Komodo, per its site"],
      ["Also", "Yacht and brand management for other owners (Managed Services)"],
    ],
  },
  how: {
    paragraphs: [
      "Every Rascal yacht can be chartered whole, at a rate Rascal Voyages publishes: US$12,000 a night plus taxes for Rascal and El Aleph, US$13,500 for Rebel. Its itineraries say the price covers accommodation, airport transfers, all activities, park fees and excursions, with alcohol the one exception.",
      "Rascal and Rebel also run scheduled cabin voyages, so a couple can book one cabin: from US$2,500 a night per cabin plus taxes, in Komodo, Raja Ampat, the Spice Islands, the Ring of Fire, the Eastern Lesser Sunda Islands and Wakatobi, including conservation voyages with the Manta Trust and a family focused departure.",
      "Its published itineraries run four nights in Komodo from Labuan Bajo (May to October) and seven in Raja Ampat and Misool from Sorong (October to April), each with extensions: Gili Banta and Manta Alley, Sangeang volcano, the Ring of Fire to Sumbawa, or on from Raja Ampat to Triton Bay.",
    ],
    facts: [
      ["Guests", "Up to 10 on each yacht (El Aleph's fleet page says 11)"],
      ["Crew", "12 on Rascal and Rebel, 13 on El Aleph"],
      ["Charter", "From US$12,000 a night plus taxes, as published"],
      ["Cabins", "From US$2,500 a night per cabin plus taxes, on Rascal and Rebel"],
      ["Included", "Accommodation, airport transfers, all activities, park fees and excursions; alcohol extra"],
      ["Diving", "Full scuba equipment and a PADI dive instructor on every yacht"],
      ["Children", "\"We welcome little Rascals\"; no minimum age published"],
    ],
  },
  fleet: ["rascal", "rebel", "el-aleph"],
  itineraries: {
    title: "Which Voyages Does Rascal Voyages Publish?",
    items: [
      { name: "Komodo National Park, 4 nights", href: "/voyages/ships/rascal#itinerary", eyebrow: "Rascal and Rebel · from Labuan Bajo", line: "Dragons at Loh Liang, the pink beaches and the mantas of Taka Makassar.", image: { url: Rascal.hero.url, alt: Rascal.hero.alt }, facts: [["Nights", "4"]], price: "May to October" },
      { name: "Raja Ampat, 7 nights", href: "/voyages/ships/rebel#itinerary", eyebrow: "Rascal and Rebel · from Sorong", line: "Kali Biru, Cape Kri, Arborek's mantas and three days in Misool.", image: { url: Rebel.gallery[0].url, alt: Rebel.gallery[0].alt }, facts: [["Nights", "7"]], price: "October to April" },
    ],
  },
  apart: [
    { claim: "Discover the undiscovered with us.", attribution: "fleet pages" },
    { claim: "Every journey should give back", attribution: "conservation and sustainability page" },
    { claim: "We welcome little Rascals", attribution: "The Rascal Way" },
    { claim: "We simply love to go the extra nautical mile", attribution: "The Rascal Way" },
  ],
  sustainability: [
    "Reef-safe toiletries and no single-use plastics aboard",
    "Eco-friendly sewage treatment and oil-water separation, with waste delivered to harbour authorities on record",
    "Noise-reduction boxes on the engines",
    "A coral restoration site, the Rascal Coral Garden at Yaf Keru, with The SEA People in Raja Ampat",
    "Manta conservation voyages with The Manta Trust in Komodo",
  ],
  why: [
    "It publishes its whole-yacht rates and what they include, so a charter can be priced before anyone asks.",
    "Three yachts at two sizes, with cabin voyages on two of them, cover a couple, a family of ten and a group who want a 39-metre hull.",
    "A PADI dive instructor sails on every yacht, and its itineraries run deep into Misool, not only the Dampier Strait.",
    "Its conservation work is named and specific: a coral garden in Raja Ampat and manta research voyages in Komodo.",
  ],
  faqs: [
    ["Who is Rascal Voyages?", "A yacht charter company sailing three traditional handmade phinisis in Indonesia, Rascal, Rebel and El Aleph, with menus designed in its Bali test kitchen and conservation partners in Raja Ampat and Komodo."],
    ["How much does a Rascal Voyages charter cost?", "Rascal Voyages publishes US$12,000 a night plus taxes for Rascal and El Aleph and US$13,500 for Rebel, for the whole yacht. Cabins on scheduled voyages start from US$2,500 a night per cabin plus taxes."],
    ["What is included?", "Its itineraries say the price covers overnight yacht accommodation, airport transfers, all activities, park fees and excursions, with the exception of alcoholic drinks."],
    ["How many guests do the yachts take?", "Up to 10 on each: Rascal and Rebel in five cabins with 12 crew; El Aleph in five cabins with 13 crew, the fleet page listing 11 guests."],
    ["Where and when do they sail?", "Komodo from May to October, from Labuan Bajo, and Raja Ampat from October to April, from Sorong, with the Spice Islands, the Ring of Fire, the Eastern Lesser Sunda Islands and Wakatobi between."],
    ["Can children sail?", "Yes. Rascal Voyages says \"We welcome little Rascals\" and runs a family focused voyage; no minimum age is published. El Aleph's twin cabins can be interconnected."],
    ["Is there diving?", "Yes. Every yacht carries full scuba equipment and a PADI dive instructor, and certification can be arranged."],
    ["Has James been aboard?", "Not yet. James vetted Rascal Voyages for the Ledger and names it a founder favourite, and says plainly that he has not been aboard."],
  ],
  hero: hero(Rascal, RV),
  gallery: [g(Rascal, RV, 0), g(Rebel, RV, 1), g(ElAleph, RV, 0), g(Rascal, RV, 3), g(Rebel, RV, 10), g(ElAleph, RV, 10)],
  credit: RV,
  related: RELATED,
  organization: {},
  sources: ["https://www.rascalvoyages.com/our-fleet", "https://www.rascalvoyages.com/cabin-voyages", "https://www.rascalvoyages.com/the-rascal-way", "https://www.rascalvoyages.com/conservation-and-sustainability", "https://www.rascalvoyages.com/managed-services", "https://www.rascalvoyages.com/voyages"],
  checked: "2026-11-02",
  founder: { eyebrow: "Founder vetted · Founder favourite · not yet visited", proof: "James vetted Rascal Voyages and its three yachts for the Ledger and names them a founder favourite. He has not been aboard yet, and says so." },
  journeys: ["rascal", "rebel", "el-aleph"],
};

export const SILOLONA_SOJOURNS: Partner = {
  slug: "silolona-sojourns",
  name: SS,
  kind: "Yacht charter operator",
  seo: {
    title: "Silolona Sojourns Phinisi Charters with James Wild & Co",
    description: "Silolona Sojourns' two Konjo-built phinisis, Silolona and Si Datu Bua, chartered whole across Komodo, Raja Ampat, Banda and Papua by a company with 30 years in Indonesia.",
    keywords: ["Silolona Sojourns", "Silolona", "Si Datu Bua", "Patti Seery", "phinisi charter Indonesia", "Banda Islands yacht charter", "Raja Ampat private charter"],
  },
  line: "Two Konjo-built phinisis, Silolona and Si Datu Bua, chartered whole across Eastern Indonesia by a company with 30 years in these waters.",
  answer: "Silolona Sojourns is an Indonesian yacht charter company founded by Patti Seery, with two traditional phinisis built by the Konjo boat builders of Sulawesi: Silolona, 50 metres, launched in 2004, for ten adults, and Si Datu Bua, 40.2 metres, for six. Both are chartered whole, on routes drawn to order: Komodo, Flores and Alor from May to September, and Raja Ampat, Papua and the Banda Islands from October to April. It does not publish rates.",
  who: {
    facts: [
      ["Who", "\"Indonesia Yacht Charter Specialist with 30 years of expertise\", in its own words, founded by Patti Seery"],
      ["Fleet", "Silolona (2004, 50 m, five cabins) and Si Datu Bua (40.2 m, three king suites), both by the Konjo boat builders of Sulawesi"],
      ["Base", "A Bali-based office team, per its people page"],
      ["Waters", "Komodo, Flores and Alor; the Savu Sea and Sumba; Raja Ampat; Tribal Papua; Cenderawasih Bay; the Banda Islands"],
      ["Also", "Services for visiting yachts (clearance, provisioning, bunkering and customs) and cultural tours across the archipelago"],
    ],
    history: [["2004", "Silolona launched, built of tropical hardwoods to German Lloyd specifications"]],
  },
  how: {
    paragraphs: [
      "Silolona Sojourns charters each yacht whole, with her own captain, chefs and dive team, and draws the route for each party. It publishes no rates or fixed departures, so every charter is quoted for its route and dates.",
      "Its year follows the monsoons: Komodo, Flores and Alor from May to September, then Raja Ampat, Tribal Papua, Cenderawasih Bay and the Banda Islands from October to April. Its crew includes a PADI dive instructor, and diving, waterskiing, wakeboarding, kayaking, paddleboarding and sport fishing are part of life aboard.",
      "Silolona Sojourns pairs Si Datu Bua with a restored 164-year-old clan house on the slopes of Gunung Sesean in Toraja, and its yachts have carried marine scientists surveying whale sharks, leatherback turtles and oceanic mantas from Cenderawasih Bay to Misool.",
    ],
    facts: [
      ["Guests", "10 adults on Silolona; 6 on Si Datu Bua; child extra beds in every cabin"],
      ["Crew", "17 on Silolona, 15 on Si Datu Bua"],
      ["Charter", "Whole yacht only; rates on request"],
      ["Seasons", "May to September in Komodo, Flores and Alor; October to April in Raja Ampat, Papua and Banda"],
      ["Children", "Welcome; no minimum age published"],
    ],
  },
  fleet: ["silolona", "si-datu-bua"],
  apart: [
    { claim: "Indonesia Yacht Charter Specialist with 30 years of expertise", attribution: "home page" },
    { claim: "A fleet of two masterfully crafted traditional wooden sailing vessels", attribution: "partnership page" },
    { claim: "The undisputed standard for excellence", attribution: "home page, of Si Datu Bua" },
  ],
  sustainability: [
    "Works with local communities and organisations to preserve their culture, heritage and environment, per its partnership page",
    "Its yachts have supported marine surveys of whale sharks, leatherback turtles and oceanic mantas, per its partners' testimonials",
  ],
  why: [
    "Thirty years in Eastern Indonesia shows in the routes: Banda's nutmeg islands, the Asmat coast, Cenderawasih Bay's whale sharks and Toraja on land.",
    "Two sizes of yacht: Silolona for up to ten adults, Si Datu Bua's three king suites for six, both with child beds in every cabin.",
    "Every charter is drawn to order, so the route fits the season and the party rather than a fixed loop.",
  ],
  faqs: [
    ["Who is Silolona Sojourns?", "An Indonesian yacht charter company founded by Patti Seery, with 30 years in these waters, in its own words, and two Konjo-built phinisis, Silolona and Si Datu Bua."],
    ["How much does a Silolona Sojourns charter cost?", "Silolona Sojourns does not publish rates. Each yacht is chartered whole and quoted for the route and dates; James requests the quote."],
    ["What is the difference between Silolona and Si Datu Bua?", "Silolona, launched in 2004, is 50 metres with five cabins for ten adults and 17 crew. Si Datu Bua is 40.2 metres with three king suites for six adults and 15 crew. Both take child extra beds in every cabin."],
    ["Where and when do they sail?", "Komodo, Flores and Alor from May to September; Raja Ampat, Tribal Papua, Cenderawasih Bay and the Banda Islands from October to April."],
    ["Can we book a single cabin?", "No. Silolona Sojourns charters each yacht whole. For cabin voyages, look at Aliikai or Rascal Voyages' Rascal and Rebel."],
    ["Can we combine a charter with Toraja?", "Yes. Silolona Sojourns pairs Si Datu Bua with its restored 164-year-old clan house on the slopes of Gunung Sesean in Toraja, Sulawesi."],
    ["Has James been aboard?", "Not yet. James vetted Silolona Sojourns for the Ledger and names it a founder favourite, and says plainly that he has not been aboard."],
  ],
  hero: hero(Silolona, SS),
  gallery: [g(Silolona, SS, 0), g(SiDatuBua, SS, 0), g(Silolona, SS, 5), g(SiDatuBua, SS, 1), g(Silolona, SS, 7), g(SiDatuBua, SS, 2)],
  credit: SS,
  related: RELATED,
  organization: { country: "ID" },
  sources: ["https://www.silolona.com/", "https://www.silolona.com/vessels", "https://www.silolona.com/destination", "https://www.silolona.com/life-on-board", "https://www.silolona.com/about/our-people", "https://www.silolona.com/partnership"],
  checked: "2026-11-02",
  founder: { eyebrow: "Founder vetted · Founder favourite · not yet visited", proof: "James vetted Silolona Sojourns and its two yachts for the Ledger and names them a founder favourite. He has not been aboard yet, and says so." },
  journeys: ["silolona", "si-datu-bua"],
};
