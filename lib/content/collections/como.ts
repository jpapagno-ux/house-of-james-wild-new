// COMO Hotels and Resorts: the five COMO houses on the James Wild & Co list.
// Facts come only from comohotels.com (checked 4 Nov 2026) and the live stay
// records (Stay Studio, sourced from COMO). COMO's own count is 19 hotels and
// resorts; we list the five the house sells.
//
// COMO Parrot Cay (STY-2026-000575) and COMO Alpina Dolomites (STY-2026-000624)
// are filed in Stay Studio but not released yet, so their cards say their page
// is being filed. Parrot Cay and Alpina photographs are marked rights
// "to_verify" in Cloudinary until COMO confirms use (media-kit email, 4 Nov).
// Hidden from search (approved: false) until James approves the copy.

import type { CollectionHotel, CollectionImage } from "@/lib/content/collections/cayuga";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const img = (id: string, alt: string, w: number, h: number): CollectionImage => ({ url: `${CLD}/c_limit,w_3200/q_auto:best/f_jpg/${id}`, alt, w, h });

export const COMO = {
  slug: "como",
  name: "COMO Hotels and Resorts",
  orgName: "COMO Hotels and Resorts",
  path: "/collections/como",
  approved: false, // awaiting James on the copy
  founded: "",
  founders: ["Christina Ong"],
  countries: ["Indonesia", "Turks and Caicos", "Italy"],
  facts: [["COMO worldwide", "19 hotels"], ["On our list", "5 houses"], ["Founder-owner", "Christina Ong"], ["Wellness", "COMO Shambhala"]] as [string, string][],
  seo: {
    title: "COMO Hotels and Resorts: Bali, Parrot Cay and the Dolomites",
    description: "Five COMO houses we plan: COMO Shambhala Estate, COMO Uma Ubud and COMO Canggu in Bali, COMO Parrot Cay in Turks and Caicos and COMO Alpina in the Dolomites. Which suits whom, and how to pair them.",
  },
  eyebrow: "The Collections · COMO",
  tagline: "A strong sense of place, modern luxury in natural settings, and wellness that runs through every house",
  answer: "COMO Hotels and Resorts is a group of 19 hotels and resorts led by founder-owner Christina Ong, built on what COMO calls thoughtful design, genuine hospitality and a strong sense of place. We plan five of them: three in Bali, a private island in Turks and Caicos and a mountain hotel in the Dolomites. Each carries COMO Shambhala, the group's holistic wellness practice, and each feels like where it is.",
  hero: img("jwco/stays/como-shambhala-estate/hero", "COMO Shambhala Estate, Payangan, Bali", 1920, 1080),
  copy: {
    hotelsHeading: "Five Houses, One Way of Seeing",
    hotelsLine: "Same care, different ground: jungle river valley, Ubud ridge, Echo Beach, a Caribbean island and an alpine meadow.",
    says: "At a glance",
    quoteOfficial: false,
    fitHeading: "Which COMO House Fits Which Traveller",
    pairHeading: "Two COMO Houses, Well Paired",
    askHeading: "Questions Worth Asking Before a Wellness Stay",
    askLine: "COMO Shambhala is the thread through every house. These help decide how much of it you want.",
    faqTitle: "Questions About COMO Hotels and Resorts",
    source: "Hotel details from comohotels.com; the roster is confirmed before booking.",
    planPlace: "Bali, the Caribbean or the Dolomites",
    galleryCredit: "Photographs courtesy of COMO Hotels.",
  },
  hotels: [
    {
      slug: "como-shambhala-estate", name: "COMO Shambhala Estate", country: "Indonesia", setting: "Jungle river valley", where: "Payangan, near Ubud, Bali",
      bestFor: ["Wellness", "Families", "Groups"],
      choose: "Choose it when the stay is the point: a multi-night Wellness Path, or a family or group taking a whole Residence.",
      line: "COMO's wellness retreat in the forest above the Ayung River, with personalised Wellness Paths, healthy cuisine and the Kedara water garden.",
      image: img("jwco/stays/como-shambhala-estate/hero", "COMO Shambhala Estate, Payangan, Bali", 1920, 1080),
      gallery: [],
      official: { who: "Wellness seekers on a multi-night Wellness Path, and families or groups taking a private Residence.", facts: "Pool Villas, Suites and five Residences, about 90 minutes from Ngurah Rai airport." },
      built: true,
    },
    {
      slug: "como-uma-ubud", name: "COMO Uma Ubud", country: "Indonesia", setting: "Valley edge, walk to town", where: "Kedewatan, Ubud, Bali",
      bestFor: ["Couples", "Walkers", "Culture"],
      choose: "Choose it to have Ubud on foot and COMO calm to come back to.",
      line: "46 suites and pool villas above the Tjampuhan Valley, an easy walk or a five-minute shuttle from Ubud town, with the ridge walk from the front door.",
      image: img("jwco/stays/como-uma-ubud/hero", "COMO Uma Ubud in Kedewatan, Ubud", 1920, 1080),
      gallery: [],
      official: { who: "Couples and wellness travellers who want to walk into Ubud and come back to a quiet base.", facts: "Daily yoga, COMO Shambhala Spa and Kemiri for Indonesian cooking." },
      built: true,
    },
    {
      slug: "como-uma-canggu", name: "COMO Canggu", country: "Indonesia", setting: "On the beach", where: "Echo Beach, Canggu, Bali",
      bestFor: ["Families", "Surf", "Beach"],
      choose: "Choose it for the family half of a Bali trip: surf lessons, a beach club and Play by COMO for the children.",
      line: "A beachfront COMO on Echo Beach with 119 rooms and suites, Tropicsurf lessons, the COMO Shambhala lagoon pool and Play by COMO for ages 4 to 12.",
      image: img("jwco/stays/como-uma-canggu/hero", "COMO Canggu on Echo Beach, Bali", 1920, 1080),
      gallery: [],
      official: { who: "Families, with Play by COMO, and travellers who want surf and sand.", facts: "Penthouses with rooftop pools, COMO Beach Club, about 90 minutes from the airport." },
      built: true,
    },
    {
      slug: "como-parrot-cay", name: "COMO Parrot Cay", country: "Turks and Caicos", setting: "Private island", where: "Parrot Cay, Turks and Caicos",
      bestFor: ["Couples", "Privacy", "Beach"],
      choose: "Choose it for a private island with very little to do but swim, rest and be looked after.",
      line: "A private island in the Turks and Caicos, with beach houses and villas among the trees, clear shallow water and a COMO Shambhala Retreat.",
      image: img("wildco/turks-and-caicos/parrot-cay/parrot-cay-beach-houses-and-trees", "Beach houses among the trees along the white sand at COMO Parrot Cay, Turks and Caicos", 1920, 1080),
      gallery: [],
      official: { who: "For privacy on a Caribbean island.", facts: "Beach houses and residences such as The Sanctuary, with a COMO Shambhala Retreat." },
      built: false,
    },
    {
      slug: "como-alpina-dolomites", name: "COMO Alpina Dolomites", country: "Italy", setting: "Alpine meadow, 1,800 m", where: "Alpe di Siusi, South Tyrol",
      bestFor: ["Ski", "Summer hiking", "Families"],
      choose: "Choose it for the Dolomites in either season: ski from the door in winter, walk the high meadow in summer.",
      line: "On the Alpe di Siusi in the UNESCO Dolomites, ski-in ski-out on Dolomiti Superski in winter and open again from June to October for walking.",
      image: img("wildco/italy/dolomites/como-alpina/como-alpina-snow-buildings-mountains", "COMO Alpina Dolomites under snow on the Alpe di Siusi, with the mountains behind", 1920, 1080),
      gallery: [],
      official: { who: "For skiers in winter and walkers in summer.", facts: "Eight room and suite types, a COMO Shambhala Retreat with a 22 m indoor pool, four restaurants and Play by COMO; about an hour from Bolzano." },
      built: false,
    },
  ] as CollectionHotel[],
  pairings: [
    { title: "Ubud, then the beach", hotels: ["COMO Uma Ubud", "COMO Canggu"], line: "Walk the ridge and the rice fields, then let the family loose on Echo Beach. Both are about 90 minutes from the airport." },
    { title: "Retreat, then the town", hotels: ["COMO Shambhala Estate", "COMO Uma Ubud"], line: "A Wellness Path in the valley, then a few lighter nights within walking distance of Ubud." },
    { title: "Mountain and sea", hotels: ["COMO Alpina Dolomites"], line: "The Dolomites pair with the Italian lakes or Venice, about four hours by road." },
    { title: "The island on its own", hotels: ["COMO Parrot Cay"], line: "Parrot Cay works best given a week. It is a place to stay put." },
  ],
  rule: "Four or five nights in each house is usually better than three houses in a week. COMO places reward staying still.",
  questions: [
    "How many nights does the Wellness Path you want really need?",
    "Which treatments and classes are included, and which are booked separately?",
    "Are there quiet areas or times kept free of children?",
    "What is the season, and what is closed out of it?",
    "How long is the transfer, and can it be private?",
    "Which room type gives the view or privacy you are paying for?",
  ],
  faqs: [
    { q: "Which COMO hotels does James Wild & Co plan?", a: "Five: COMO Shambhala Estate, COMO Uma Ubud and COMO Canggu in Bali, COMO Parrot Cay in Turks and Caicos and COMO Alpina Dolomites in South Tyrol, Italy. COMO's own collection is 19 hotels and resorts; ask about any of them." },
    { q: "What is COMO Shambhala?", a: "COMO describes COMO Shambhala as a 360-degree approach to proactive, holistic wellness. It runs through each COMO house, from spa treatments and yoga to healthy cuisine, and is the centre of COMO Shambhala Estate in Bali." },
    { q: "Which COMO hotel is best for families?", a: "COMO Canggu in Bali, with Play by COMO for children aged 4 to 12 and surf lessons on Echo Beach. COMO Alpina in the Dolomites also has Play by COMO, and COMO Shambhala Estate's Residences suit larger families." },
    { q: "Which COMO hotel is best for a honeymoon?", a: "COMO Parrot Cay for a private island, or COMO Uma Ubud for Bali with walks from the door. Both are quiet and built for two." },
    { q: "When is COMO Alpina Dolomites open?", a: "COMO Alpina opens for a winter ski season from December to March and a summer season from June to October. Exact dates are confirmed when you book." },
    { q: "Can I combine two COMO hotels in Bali?", a: "Yes. COMO Uma Ubud or COMO Shambhala Estate inland pairs naturally with COMO Canggu on the beach; we arrange the road transfer between them." },
  ],
  disclosure: "James Wild & Co is a COMO partner and may help plan and book these hotels. Recommendations remain based on traveller fit.",
};
