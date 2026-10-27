// The house pages: /about (why the house is still going, with James's rules
// of the road) and /about/founder (James). The separate Philosophy page was
// retired 25 Oct 2026; /about/philosophy redirects to /about#rules.
//
// Sources: the Base44 About and Founder samples (sampleAboutContent.js,
// sampleFounderContent.js), the published memoir "From Surf to Soul", and
// facts James has stated directly (years, trips, credentials). Rules of the
// road and the "mistakes" lines are drafted in James's voice from his own
// brief (go someplace new, what's around the corner, search on a whim, go on
// your own, leave days unplanned, plan last minute, mistakes). All copy is
// pending his sign-off; the pages stay noindex until then. The rules of the
// road and the mistakes lines were approved 27 Oct 2026; the rest of the
// About and Founder copy is still to go on the Proofs sheet.
//
// Fixes against the samples: always "Exploring since 1982" (the samples
// said "Established"); first Eleuthera trip 1982 per the memoir (the About
// sample said 1981); title "Chief Expedition Officer" (the Founder sample said
// "Exploration"). No em dashes in public copy.

const WES = "https://cdn.prod.website-files.com/679d0f261523f5053f06eae5";
const WES2 = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const IMG = {
  elephants: { url: `${WES}/67a53f21e2188b1e0278cf29_redcharlie-nf7W_hn6DKQ-unsplash.avif`, alt: "An open safari vehicle waits on a dirt road while a herd of elephants crosses ahead in East African grassland" },
  desk: { url: `${WES}/6812f4b58ac7b58015954eb1_ABOUT_03.1.jpg`, alt: "A safari tent with a vintage wooden desk, a leather chair and a brass telescope looking out over a desert plain at sunset" },
  yacht: { url: `${WES}/6812f4c490c16fcbcbc57760_ABOUT_03.2.jpg`, alt: "The deck of a sailing yacht under tall white sails, with a long wooden table set in soft afternoon light" },
  surfersBeach: { url: `${WES2}/6991d34cd14320d3ecb646ea_photos_surfersbeach-1.jpg`, alt: "Surfer's Beach, Eleuthera: a wild Bahamian shoreline with a wave breaking along the sand" },
  dominical: { url: `${WES}/67c1ee4561a90104445c9a85_about-story-1.avif`, alt: "Polaroid of James relaxing on a beach in a patterned shirt, Dominical, Costa Rica, 1995" },
  jeep: { url: `${WES}/67c1ee446ac65a18e02e0ace_about-story-2.avif`, alt: "Vintage photograph of a red open-top jeep loaded with surfboards in the early days of Costa Rica surf travel" },
};

export const MEMOIR_URL = "https://www.wildearthstays.com/memoir/wild-earth-stay-founder-story-40-years-of-sustainable-travel";

// ── The rules of the road (on /about#rules) ─────────────────────────────────
export const RULES_INTRO = "Plan the bones of a journey: the flights, the transfers, the stays worth booking early. Then leave room for what's around the corner.";
export const CLOSER = "Plan the bones. Wing the rest.";
export type Rule = { n: string; title: string; james: string; house: string };
export const RULES: Rule[] = [
  { n: "01", title: "Go someplace new.", james: "The places you already love will keep. Go and meet one you don't know yet.", house: "Every journey can carry one place you've never heard of. The Compass even holds one back until you talk to us." },
  { n: "02", title: "It's what's around the corner.", james: "The best thing I've seen on any trip was never on the itinerary. It was just past it.", house: "Routes are drawn with room to turn left: a free afternoon near the good road, a guide who knows the side track." },
  { n: "03", title: "Search on a whim.", james: "Half my best trips started with “what's that?” and a finger on a map.", house: "Send us the whim. We'll tell you straight whether it's worth the flight, and when." },
  { n: "04", title: "Go on your own, at least once.", james: "Travel alone and the place does the talking. Travel in a crowd and you mostly hear the crowd.", house: "We know the small lodges with one long table, where a solo traveller is a guest, not a table for one." },
  { n: "05", title: "Leave a few days unplanned.", james: "Plan the bones. Wing the rest.", house: "Ask for open days and we'll leave them open, with a short list in your pocket rather than on your schedule." },
  { n: "06", title: "Last minute can be the best minute.", james: "Some of the best rooms come free the week before. It helps to know who to call.", house: "We call the lodges and captains directly. Short notice is a phone call, not a panic." },
  { n: "07", title: "Make mistakes. Just not the expensive ones.", james: "Forty-four years on the road buys you a long list of wrong turns. I took them so you can take better ones.", house: "Every Overland route and every Compass reading lists what we'd avoid." },
];

// Mistakes worth skipping: general field lessons, dry on purpose.
export const MISTAKES: { avoid: string; quip: string }[] = [
  { avoid: "Seeing a whole country in a week.", quip: "You'll see the airports beautifully." },
  { avoid: "Changing hotels every night.", quip: "That isn't a trip. It's a check-in tour." },
  { avoid: "Packing for the big plane when the small one takes you in.", quip: "Bush planes weigh your bag, and they mean it." },
  { avoid: "Filling every hour.", quip: "The sighting you remember happens in the hour you didn't book." },
  { avoid: "Trusting the brochure photo.", quip: "Which is why everything in the Ledger has been slept in first." },
];

export const BELIEFS = ["Luxury is space and silence.", "Adventure begins where Wi-Fi ends.", "Travel is a way back to yourself."];

// ── /about ──────────────────────────────────────────────────────────────────
export const ABOUT = {
  eyebrow: "The House · Exploring since 1982",
  title: "Forty-Four Years In, and Still Going Around the Next Corner",
  subtitle: "A house of travel kept like a ledger, by a founder who still leaves a few days unplanned.",
  facts: [
    ["Exploring since", "1982"],
    ["Designing journeys since", "1983"],
    ["Safaris since", "2011"],
    ["Every entry", "Vetted in person"],
  ] as [string, string][],
  answer:
    "James Wild & Co is a founder-led travel house that has been exploring since 1982 and designing journeys since 1983. Every stay, safari camp, family residence, small ship and overland route in its Ledger has been walked, sailed or slept in first, then filed under a permanent ID. It serves travellers directly and the advisors who plan for them.",
  why: {
    eyebrow: "Why we're still going",
    title: "Because the Map Never Runs Out",
    paragraphs: [
      "People ask why, after forty-four years, James is still at it. The honest answer: the map never runs out. There's always another coast he hasn't surfed, another reef he hasn't dropped onto, another lodge someone swears is the one.",
      "It began on Eleuthera in 1982 with a surfboard, a cave above Surfer's Beach and no plan worth the name. The next year friends asked him to take them back, and the first James Wild trip was designed. He's been planning other people's best weeks ever since, and still leaves a few of his own unplanned.",
      "The house runs on the same instinct. Nothing goes in the Ledger on a brochure's word. And the next corner is already on the list.",
    ],
    quote: "It's not where you go. It's what's around the corner when you get there.",
  },
  years: [
    { year: "1982", title: "Eleuthera", line: "A surfboard, Gregory Town's one bakery, and a week in a cave above Surfer's Beach. No Wi-Fi, no schedule. The seed is planted." },
    { year: "1983", title: "The first trip designed", line: "Friends ask James to take them surfing on Eleuthera. Charlton meets them in North Eleuthera. The house's first journey." },
    { year: "1989", title: "Under sail", line: "Sailing begins, with surfing, diving and reefs at every anchorage along the way." },
    { year: "1990", title: "On the record", line: "IATAN membership, held ever since." },
    { year: "1990s", title: "Costa Rica, early", line: "A wholesale firm working the first days of surf, dive and soft-adventure travel to Central America. Dominical, '95." },
    { year: "1996", title: "Tahiti", line: "The first of many seasons surfing and diving French Polynesia. Taha'a becomes the favourite." },
    { year: "2011", title: "Africa", line: "Safari design begins, and the Ledger's camps are vetted reserve by reserve." },
    { year: "Today", title: "Five volumes, one Ledger", line: "Stays, Safaris, Gatherings, Voyages and Overland, all filed the same way. James is still travelling to vet them." },
  ],
  craft: {
    eyebrow: "The house, at work",
    title: "Kept for Travellers. Quoted by Advisors.",
    paragraphs: [
      "Two people come to this desk: the traveller planning the journey of a season, and the advisor who has promised them one. Both are owed the same thing: first-hand knowledge, current rates, and a record that holds up when it's quoted.",
      "The Ledger is the house's answer. Every stay is vetted in person, every rate re-checked at enquiry, and every entry filed under its own permanent ID. None is recycled when a property changes hands.",
    ],
  },
  jamesNote: "Forty-four years of boots on the ground. Everything in this Ledger I have walked, sailed or slept in myself, or sent someone I trust to do it for me. That's the whole of the standard.",
  faqs: [
    { q: "Is James Wild & Co the same house as Wild Earth Stays?", a: "Yes. The same founder, the same portfolio and the same standard, continued under the James Wild & Co name, with the Ledger as its record. Wild Earth Stays lives on as a volume of the house." },
    { q: "How long has James been designing travel?", a: "James has been exploring since 1982, when he first surfed Eleuthera in the Bahamas, and designing journeys since 1983, when friends asked him to take them back. He has designed safaris since 2011." },
    { q: "Who does the house serve?", a: "Both sides of the desk: travellers who want a journey designed from first-hand knowledge, and travel advisors who quote the Ledger's vetted stays, routes and rates to their own clients." },
    { q: "What is James Wild's travel philosophy?", a: "Go someplace new and leave room for what's around the corner. Plan the bones of a journey, the flights, the transfers and the stays worth booking early, and leave space for whims, open days and the side road nobody put on the itinerary." },
    { q: "Can a James Wild itinerary include unplanned days?", a: "Yes, if you want them. Ask for open days and they stay open, with a short list of ideas from James rather than a schedule." },
    { q: "Can you plan a trip at the last minute?", a: "Often, yes. The house calls lodges and captains directly, and good rooms do come free close to the date. Availability depends on the place and the season, so call as soon as the whim strikes." },
    { q: "How does a stay get into the Ledger?", a: "It is walked, sailed or slept in first, by James or someone he trusts, then filed under its own permanent ID, whether it's a stay, a reserve, a residence, a vessel or a route. Nothing is added on a brochure's word." },
  ],
};

// ── /about/founder ──────────────────────────────────────────────────────────
export const FOUNDER = {
  eyebrow: "The House · The founder",
  title: "James Wild: Character and Experience, Not Order-Taking",
  subtitle: "Forty-four years of journeys walked, sailed and slept in himself, since 1982.",
  quote: "It is not just about where you go. It is about what the Earth shows you when you arrive.",
  meta: [
    ["Where it began", "Eleuthera, 1982: a cave above Surfer's Beach"],
    ["The 1990s", "Early surf and dive travel in Costa Rica"],
    ["By water", "Sailing since 1989; diving and surfing for 44 years"],
    ["The field", "Africa since 2011, Antarctica, the Pacific, the Americas"],
  ] as [string, string][],
  answer:
    "James Wild is the founder and Chief Expedition Officer of James Wild & Co. His name is James Papagno. He has been exploring since 1982, designing journeys since 1983, sailing since 1989 and designing safaris since 2011. He is an IATAN member since 1990, a CLIA member and a PADI-certified diver, and he vets the Ledger's stays in person.",
  thesis: {
    eyebrow: "The founder's thesis",
    title: "Why Character Leads, Not the Checklist",
    paragraphs: [
      "Most travel is order-taking: a request comes in, a rate goes out, a booking confirms. James built the house on the opposite instinct. A journey worth designing has to be lived first, and the person designing it has to care why you're going, not just where.",
      "He'd also rather you didn't over-plan it. Go someplace new. Leave a day or two open. Follow the whim that starts with “what's that?” on a map. The best part of most trips is what's around the corner, and you can't book that. You can only leave room for it.",
    ],
  },
  story: {
    eyebrow: "Journeys filed from the field",
    title: "From Eleuthera's Cliffs to the Okavango",
    paragraphs: [
      "In 1982 he packed a surfboard in Hollywood, Florida and flew to Eleuthera, a wild, little-known island in the Bahamas. There was no resort. There was Gregory Town, one bakery, and a dirt path down to Surfer's Beach, where a cave above the break was home for a week. It wasn't just a surf trip. It was the start of everything since.",
      "By the 1990s the calling was a business: a wholesale firm working the earliest days of surf, dive and soft-adventure travel to Central America. Dive travel followed, and with it expedition-style itineraries into waters few travellers had reached.",
      "From there the map kept opening: Tahiti from 1996, Africa from 2011, Antarctica, Raja Ampat. Every one designed because he'd walked it, sailed it or slept in it himself.",
    ],
  },
  fieldLog: [
    { year: "2020", place: "Antarctic Peninsula", line: "Aboard HX's MS Roald Amundsen, and stuck down there when the world shut down. He took his own photographs." },
    { year: "2023", place: "Exumas & Moab", line: "In the Exumas with the Reef Ball Foundation; Ulum Moab vetted in April and named his favourite family stay." },
    { year: "2024", place: "Raja Ampat", line: "Eleven days aboard the yacht Aliikai with his son, in November." },
    { year: "2025", place: "Taha'a & Punta Mita", line: "Vahine Private Island vetted on Taha'a. Casa Koko in Punta Mita, the host met, and a swim with whale sharks." },
    { year: "2026", place: "South Africa & Botswana", line: "Monwana, Lion Sands Ivory Lodge, Kirkman's Kamp, DumaTau, Mombo and Qorokwe, plus Jaci's and every Leeu Estates house." },
  ],
  next: { label: "Around the next corner", line: "Namibia's Skeleton Coast and Sossusvlei, diving Palawan, Thailand, the Azores, Greenland and Ireland." },
  credentials: [
    "Founder & Chief Expedition Officer, James Wild & Co",
    "IATAN member since 1990",
    "CLIA member (Cruise Lines International Association)",
    "PADI-certified diver",
    "B.A. in Marketing, Florida Atlantic University",
    "Photographer and drone pilot; pickleball devotee between journeys",
  ],
  closingQuote:
    "The wildest places on Earth don't just exist on maps. They live in our imagination, waiting to be awakened. Travel should challenge us, transform us, and remind us of our place in something far greater.",
  jamesNote: "I don't take orders for trips. I design journeys I'd take myself, and I have, since 1982.",
  faqs: [
    { q: "Who is James Wild?", a: "James Wild is the founder and Chief Expedition Officer of James Wild & Co; his name is James Papagno. He has explored since 1982, designed journeys since 1983 and designed safaris since 2011, and he vets the house's stays in person." },
    { q: "Has James been to the places he recommends?", a: "Everything in the Ledger has been walked, sailed or slept in by James or by someone he trusts. Where James went himself, the entry carries his founder mark and the year." },
    { q: "What are James's credentials?", a: "He has been an IATAN member since 1990, is a member of CLIA and is a PADI-certified diver. The house is a registered Florida Seller of Travel (ST45327) and holds IATA number 10783883." },
    { q: "Can I plan a trip with James directly?", a: "Yes. Start at Plan with James, or take the Compass and send your reading. If you already work with a travel advisor, the house works with them." },
  ],
};
