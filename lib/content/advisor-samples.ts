import type { DeskProfile } from "./advisor-desk";

// Sample advisors for the Advisor Desk (James, Oct 2026). Invented to show
// how advisors sit across the six volumes and the destinations: names,
// agencies, contact details, headshots (AI-generated, Cloudinary
// wildco/advisors/sample-*) and bookings are not real. Every Ledger ID is
// real, and every mark in James's column is his actual record.
//
// The cross-pollination, on purpose:
//   Sofia   — honeymoons, wine, islands, small-ship Mediterranean, Other Europe
//   Marcus  — Africa first: private reserves, family safaris, overland
//   Mateo   — voyages: small ships, polar, diving, Galápagos, Indonesia
//   Clara   — wellness & health, family gatherings, slow Other Europe

const CL = "https://res.cloudinary.com/jhlnq5h5/image/upload";
export const samplePortrait = (n: number, w = 560) => `${CL}/c_fill,ar_4:5,g_face,w_${w}/f_auto,q_auto/wildco/advisors/sample-advisor-headshot${n === 1 ? "" : `-0${n}`}`;
export const sampleHeadshot = (n: number, w = 96) => `${CL}/c_fill,ar_1:1,g_face,w_${w}/f_auto,q_auto/wildco/advisors/sample-advisor-headshot${n === 1 ? "" : `-0${n}`}`;

export const SAMPLE_DESKS: Record<string, DeskProfile> = {
  "sofia-marchetti": {
    adv: "ADV-2026-000033",
    sample: true,
    since: 2016,
    joined: 2026,
    agency: "Marchetti Journeys",
    base: "New York, New York",
    languages: ["English", "Italian"],
    volumes: ["stays", "voyages", "europe", "safaris"],
    countries: ["south-africa", "madagascar", "seychelles", "greece", "ecuador-galapagos"],
    specialties: ["Honeymoons", "Wine country", "Indian Ocean islands", "Small-ship Mediterranean", "Other Europe"],
    line: "Two nights of wine, three of bush, one island. In that order.",
    entries: [
      { ledgerId: "STY-2026-000075", name: "Ellerman House", place: "Cape Town · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "stays", james: { mark: "I Keep Going Back", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "Feb 2026" }, guests: 6, folios: ["FOL·420", "FOL·426"], last: "Oct 26", note: "Night one, after the flight. Nobody argues with that view." },
      { ledgerId: "STY-2026-000148", name: "Leeu Estates", place: "Franschhoek · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "stays", james: { mark: "I've Walked It", year: 2026 }, theirs: { mark: "Stayed", when: "Feb 2026" }, guests: 4, folios: ["FOL·420"], last: "Oct 26", note: "Wine first, then bush. Jet lag is kinder to people holding a glass." },
      { ledgerId: "STY-2026-000147", name: "Le Toiny", place: "Côte Sauvage · St Barts", href: null, countrySlug: null, regionSlug: "caribbean-mexico", volume: "stays", james: { mark: "I Keep Going Back", favourite: true }, theirs: null, guests: 6, folios: ["FOL·433", "FOL·447"], last: "Sep 26" },
      { ledgerId: "STY-2026-497907", name: "Miavana by Time + Tide", place: "Nosy Ankao · Madagascar", href: null, countrySlug: "madagascar", regionSlug: "africa", volume: "safaris", james: { mark: "Pencilled" }, theirs: { mark: "Walked It", when: "Nov 2025" }, guests: 2, folios: ["FOL·451"], last: "Aug 26", note: "Helicopter in, no shoes for six days. Worth every conversation about the budget." },
      { ledgerId: "STY-2026-000276", name: "Six Senses Zil Pasyon", place: "Félicité · Seychelles", href: null, countrySlug: "seychelles", regionSlug: "africa", volume: "safaris", james: { mark: "Pencilled" }, theirs: null, guests: 4, folios: ["FOL·420", "FOL·426"], last: "Oct 26", note: "The island at the end of the honeymoon, so the last photograph is the best one." },
      { ledgerId: "ITN-VSL-2026-000001", name: "Cyclades sailing voyage", place: "Aegean · Greece", href: null, countrySlug: "greece", regionSlug: "europe", volume: "voyages", james: { mark: "Pencilled" }, theirs: { mark: "Sailed It", when: "Jun 2025" }, guests: 4, folios: ["FOL·444"], last: "Jul 26", note: "Six cabins, one skipper who knows which taverna is open on a Tuesday." },
      { ledgerId: "STY-2026-000522", name: "Dá Licença", place: "Alentejo · Portugal", href: null, countrySlug: null, regionSlug: "europe", volume: "europe", james: { mark: "Pencilled" }, theirs: { mark: "Stayed", when: "Apr 2026" }, guests: 2, folios: ["FOL·458"], last: "Sep 26", note: "The Europe nobody shows you: cork oaks, a chapel, and lunch that takes the afternoon." },
      { ledgerId: "STY-2026-784861", name: "Alya Galápagos catamaran", place: "At sea · Galápagos", href: null, countrySlug: "ecuador-galapagos", regionSlug: "south-america", volume: "voyages", james: { mark: "Pencilled" }, theirs: null, guests: 2, folios: ["FOL·449"], last: "Sep 26" },
    ],
    folios: [
      { id: "FOL·420", title: "Cape, wine and an island", route: "Ellerman → Leeu Estates → Zil Pasyon", status: "Booked" },
      { id: "FOL·444", title: "The Cyclades, slowly", route: "Athens → Sifnos → Milos, by sail", status: "Quoted" },
      { id: "FOL·458", title: "Other Europe, honeymoon edition", route: "Lisbon → Alentejo → Comporta", status: "Open" },
    ],
  },

  "marcus-adeyemi": {
    adv: "ADV-2026-000021",
    sample: true,
    since: 2011,
    joined: 2026,
    agency: "Adeyemi Safari Co.",
    base: "London, England",
    languages: ["English", "Yoruba"],
    volumes: ["safaris", "gatherings", "overland"],
    countries: ["south-africa", "botswana", "kenya", "tanzania", "namibia"],
    specialties: ["Private reserves", "Family safaris", "First safaris", "Overland Africa", "Conservation stays"],
    line: "Pick the guide before the lodge. The lodge is where you sleep; the guide is where you were.",
    entries: [
      { ledgerId: "STY-2026-000171", name: "Monwana", place: "Thornybush · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "Sep 2025" }, guests: 9, folios: ["FOL·402", "FOL·417", "FOL·431"], last: "Oct 26", note: "Eight suites. The elephants at the waterhole are the reservation." },
      { ledgerId: "STY-2026-056524", name: "Wilderness DumaTau", place: "Linyanti · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026, favourite: true }, theirs: { mark: "Stayed", when: "Jun 2024" }, guests: 6, folios: ["FOL·417", "FOL·439"], last: "Oct 26", note: "Elephants cross the channel at four. Nobody is late for that." },
      { ledgerId: "STY-2026-000347", name: "Wilderness Mombo Camp", place: "Okavango Delta · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026 }, theirs: null, guests: 4, folios: ["FOL·439"], last: "Sep 26" },
      { ledgerId: "STY-2026-403235", name: "Wilderness Qorokwe", place: "Okavango Delta · Botswana", href: null, countrySlug: "botswana", regionSlug: "africa", volume: "safaris", james: { mark: "I Know a Place", year: 2026 }, theirs: { mark: "Walked It", when: "Jun 2024" }, guests: 2, folios: ["FOL·439"], last: "Sep 26" },
      { ledgerId: "STY-2026-000066", name: "Cottar's 1920s Camp & Bush Villa", place: "Maasai Mara · Kenya", href: null, countrySlug: "kenya", regionSlug: "africa", volume: "gatherings", james: { mark: "I've Walked It" }, theirs: { mark: "Stayed", when: "Aug 2023" }, guests: 11, folios: ["FOL·388", "FOL·425"], last: "Aug 26", note: "The villa takes three generations and a grandmother who said she'd never camp." },
      { ledgerId: "STY-2026-000152", name: "Lewa Wilderness", place: "Laikipia · Kenya", href: null, countrySlug: "kenya", regionSlug: "africa", volume: "safaris", james: { mark: "I've Walked It" }, theirs: null, guests: 4, folios: ["FOL·425"], last: "Jul 26" },
      { ledgerId: "STY-2026-000248", name: "Singita Faru Faru", place: "Grumeti · Tanzania", href: null, countrySlug: "tanzania", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2018, favourite: true }, theirs: { mark: "Stayed", when: "Feb 2022" }, guests: 6, folios: ["FOL·396", "FOL·441"], last: "Oct 26", note: "The migration from the deck, and the river you can't take your eyes off." },
      { ledgerId: "STY-2026-000351", name: "Wilderness Serra Cafema", place: "Kunene · Namibia", href: null, countrySlug: "namibia", regionSlug: "africa", volume: "overland", james: { mark: "Pencilled" }, theirs: { mark: "Walked It", when: "May 2025" }, guests: 2, folios: ["FOL·452"], last: "Jun 26", note: "The far end of the overland. Earn it by road and it stays with you." },
      { ledgerId: "STY-2026-115702", name: "Londolozi", place: "Sabi Sand · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "Pencilled" }, theirs: { mark: "Stayed", when: "Mar 2024" }, guests: 8, folios: ["FOL·402", "FOL·431"], last: "Oct 26" },
    ],
    folios: [
      { id: "FOL·417", title: "Three generations, two countries", route: "Monwana → DumaTau", status: "Booked" },
      { id: "FOL·425", title: "Kenya, with the children", route: "Cottar's villa → Lewa", status: "Booked" },
      { id: "FOL·452", title: "Namibia by road", route: "Windhoek → Sossusvlei → Serra Cafema", status: "Open" },
    ],
  },

  "mateo-rivas": {
    adv: "ADV-2026-000047",
    sample: true,
    since: 2014,
    joined: 2026,
    agency: "Rivas Blue Water",
    base: "Miami, Florida",
    languages: ["English", "Spanish"],
    volumes: ["voyages", "overland", "stays"],
    countries: ["indonesia", "ecuador-galapagos", "tahiti", "costa-rica", "philippines"],
    specialties: ["Small ships & sailing yachts", "Polar voyages", "Diving & reefs", "Galápagos", "Contrast: land before the boat"],
    line: "Two nights on land first. Nobody enjoys a yacht with jet lag.",
    entries: [
      { ledgerId: "STY-2026-882896", name: "Aliikai", place: "Raja Ampat · Indonesia", href: null, countrySlug: "indonesia", regionSlug: "asia", volume: "voyages", james: { mark: "I Know a Place", year: 2024, favourite: true }, theirs: { mark: "Sailed It", when: "Nov 2024" }, guests: 8, folios: ["FOL·405", "FOL·419"], last: "Oct 26", note: "Phinisi, eight guests, the best reef on earth under the hull." },
      { ledgerId: "STY-2026-149516", name: "Sirius Galápagos yacht", place: "At sea · Galápagos", href: null, countrySlug: "ecuador-galapagos", regionSlug: "south-america", volume: "voyages", james: { mark: "Pencilled" }, theirs: { mark: "Sailed It", when: "Mar 2025" }, guests: 6, folios: ["FOL·436"], last: "Sep 26", note: "Quito for two nights, then the boat. The contrast is the trip." },
      { ledgerId: "STY-2026-784861", name: "Alya Galápagos catamaran", place: "At sea · Galápagos", href: null, countrySlug: "ecuador-galapagos", regionSlug: "south-america", volume: "voyages", james: { mark: "Pencilled" }, theirs: null, guests: 4, folios: ["FOL·449"], last: "Sep 26" },
      { ledgerId: "STY-2026-000213", name: "Vahine Private Island", place: "Taha'a · Tahiti", href: null, countrySlug: "tahiti", regionSlug: "oceania", volume: "stays", james: { mark: "I've Walked It", year: 2025 }, theirs: null, guests: 4, folios: ["FOL·412"], last: "Aug 26" },
      { ledgerId: "ITN-LAND-2026-418207", name: "The Classic, Costa Rica", place: "Arenal → Monteverde → Pacific · Costa Rica", href: "/overland/costa-rica/the-original-costa-route-7-days", countrySlug: "costa-rica", regionSlug: "central-america", volume: "overland", james: { mark: "I've Walked It" }, theirs: { mark: "Walked It", when: "Jan 2026" }, guests: 5, folios: ["FOL·455"], last: "Oct 26", note: "The land half before the dive half. Volcano, cloud forest, then salt." },
    ],
    folios: [
      { id: "FOL·419", title: "Raja Ampat, north route", route: "Sorong → Wayag, aboard Aliikai", status: "Booked" },
      { id: "FOL·436", title: "Quito, then the islands", route: "Quito → Sirius, 8 nights", status: "Quoted" },
      { id: "FOL·455", title: "Costa Rica, land then sea", route: "Arenal → Osa → Drake Bay diving", status: "Open" },
    ],
  },

  "clara-whitlock": {
    adv: "ADV-2026-000012",
    sample: true,
    since: 2009,
    joined: 2026,
    agency: "Whitlock & Daughters Travel",
    base: "Denver, Colorado",
    languages: ["English", "French"],
    volumes: ["gatherings", "stays", "europe", "safaris"],
    countries: ["south-africa", "kenya", "botswana"],
    specialties: ["Wellness & health retreats", "Family gatherings", "Multigenerational", "Slow Other Europe", "Celebrations"],
    line: "Book the house, not the rooms. Families argue less when nobody is down the corridor.",
    entries: [
      { ledgerId: "STY-2026-950299", name: "Morukuru Farm House", place: "Madikwe · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "gatherings", james: { mark: "I Know Who Knows", year: 2026 }, theirs: { mark: "Stayed", when: "Dec 2024" }, guests: 10, folios: ["FOL·398", "FOL·429"], last: "Oct 26", note: "A whole farmhouse, a private guide, and a chef who learns what the children eat by day two." },
      { ledgerId: "STY-2026-119083", name: "Jaci's Private Lodge", place: "Madikwe · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "gatherings", james: { mark: "I Know the Host", year: 2026 }, theirs: null, guests: 6, folios: ["FOL·429"], last: "Sep 26" },
      { ledgerId: "STY-2026-000149", name: "Leeu House", place: "Franschhoek · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "stays", james: { mark: "I've Walked It", year: 2026 }, theirs: { mark: "Stayed", when: "Dec 2024" }, guests: 4, folios: ["FOL·398"], last: "Aug 26", note: "The spa afternoon between two safaris. Earned, and taken." },
      { ledgerId: "STY-2026-138258", name: "Tswalu Kalahari", place: "Kalahari · South Africa", href: null, countrySlug: "south-africa", regionSlug: "africa", volume: "safaris", james: { mark: "I Keep Going Back", year: 2012, favourite: true }, theirs: null, guests: 4, folios: ["FOL·446"], last: "Jul 26" },
      { ledgerId: "STY-2026-000066", name: "Cottar's 1920s Bush Villa", place: "Maasai Mara · Kenya", href: null, countrySlug: "kenya", regionSlug: "africa", volume: "gatherings", james: { mark: "I've Walked It" }, theirs: { mark: "Walked It", when: "Jul 2025" }, guests: 8, folios: ["FOL·438"], last: "Oct 26", note: "The villa for a seventieth birthday. Nobody has stopped talking about it." },
      { ledgerId: "STY-2026-000522", name: "Dá Licença", place: "Alentejo · Portugal", href: null, countrySlug: null, regionSlug: "europe", volume: "europe", james: { mark: "Pencilled" }, theirs: { mark: "Stayed", when: "May 2026" }, guests: 6, folios: ["FOL·457"], last: "Oct 26", note: "Wellness without the word on the door. Pool, olive trees, silence, three generations." },
    ],
    folios: [
      { id: "FOL·429", title: "Madikwe for the whole family", route: "Morukuru Farm House → Jaci's", status: "Booked" },
      { id: "FOL·438", title: "A seventieth in the Mara", route: "Cottar's Bush Villa, 5 nights", status: "Booked" },
      { id: "FOL·457", title: "Alentejo, slowly", route: "Lisbon → Dá Licença → the coast", status: "Open" },
    ],
  },
};
