// Country pages: the library's Destination records for the countries built so
// far (Costa Rica, South Africa), cleaned, plus what the page needs that the
// record doesn't hold (airports, transfer times, month bands derived from the
// record's own best-months text). Stays come from stays.json at render time.

type Month = "best" | "good" | "wet";
export type CountryData = {
  slug: string; name: string; region: string; regionName: string;
  ledgerId?: string | null; // DST-… from the Library (sole issuer)
  // A destination card (no stay pages yet) may have no photograph on file: src is null, never a stand-in.
  subtitle: string; leading: string; hero: { src: string | null; alt: string };
  story: { eyebrow: string; title: string; blocks: { h?: string; p: string }[]; image: { src: string | null; alt: string } }[];
  /** Destination card (James, 1 Nov 2026): the country is on the site before its stays are filed.
   *  The page shows "stays coming soon, plan with James" instead of stay counts and empty sections. */
  staysComing?: boolean;
  quote?: { text: string; by: string };
  facts: [string, string][]; faqs: { q: string; a: string }[]; contentStatus: string;
  months: { area: string; note: string; months: Month[] }[];
  airports: [string, string][]; transfers: [string, string][];
  compass?: boolean; liveRates?: { stay: string; property: string; name: string; line: string };
  flyInto: string; bestShort: string;
  postcard?: import("@/components/notes/Postcard").PostcardData;
};

const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];

import LIBRARY from "./countries-library.json";

const HAND: CountryData[] = [
  {
    slug: "costa-rica", name: "Costa Rica", region: "central-america", regionName: "Central America",
    subtitle: "Where Nature Leads the Way",
    leading: "Cloud forests, volcanic slopes, and wildlife filled jungles create a landscape alive with natural energy. Rivers carve through dense vegetation, and coastlines stretch between two warm oceans. Stays focus on sustainability, comfort, and proximity to thriving ecosystems.",
    hero: { src: `${WF}/6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg`, alt: "Costa Rica: rainforest, volcano and coastline" },
    story: [
      { eyebrow: "Costa Rica · the place", title: "A Living Paradise of Rainforest, Volcanoes, and Coastlines", image: { src: `${WF}/69ea4b8595c2a2baa95a6699_Costa%20Rica%20-%20Section%201%20Image.jpg`, alt: "Costa Rica rainforest canopy" }, blocks: [
        { p: "Costa Rica is a place where nature feels alive in every direction. Dense rainforests, active volcanoes, misty cloud forests, and both Pacific and Caribbean coastlines create a landscape rich in biodiversity and contrast." },
        { p: "Travel here is about connection to life in its most vibrant form. Walking through jungle canopies, soaking in natural hot springs, exploring wildlife rich reserves, and moving between ocean and forest reveal a rhythm that is balanced, lush, and energizing." },
        { h: "For nature and wellness explorers", p: "Costa Rica is globally recognized for its strong conservation ethic, protecting vast portions of its land as national parks and reserves. Its ecosystems are among the most diverse on Earth." },
      ] },
      { eyebrow: "Find your rhythm in Costa Rica", title: "Where Jungle, Ocean, and Wellness Align", image: { src: `${WF}/69ea4b8bb3fd5ebd4135a7bc_Costa%20Rica%20-%20Section%202%20Image.jpg`, alt: "Costa Rica coastline where the jungle meets the sea" }, blocks: [
        { h: "Who it suits", p: "Nature lovers drawn to biodiversity, wellness travelers seeking restoration, adventure seekers exploring rainforest and surf, and conscious travelers focused on sustainability and eco experiences." },
        { h: "Only here", p: "Zipline through rainforest canopies, surf along tropical coastlines, explore volcanic landscapes, and encounter wildlife in some of the most biodiverse habitats on Earth." },
      ] },
    ],
    quote: { text: "Costa Rica feels alive in every moment, where nature is not something you visit, but something you move through and become part of.", by: "James Papagno, Founder" },
    facts: [], faqs: [], contentStatus: "none",
    months: [
      { area: "Pacific & central", note: "Arenal, Monteverde, Manuel Antonio, the Osa", months: M("BBBBggggwwwB") },
      { area: "Caribbean coast", note: "Puerto Viejo, Cahuita, the Pacuare", months: M("gBBBggggBBgg") },
    ],
    airports: [["San José (SJO)", "The central valley; every Costa Rica route starts or ends here"], ["Liberia (LIR)", "Closer to Arenal and the north"]],
    transfers: [["SJO → Arenal", "3 hours by road"], ["SJO → Manuel Antonio", "3 hours, or a 25-minute flight"], ["SJO → Osa Peninsula", "50-minute flight"], ["SJO → South Caribbean", "4 hours by road"]],
    compass: true, flyInto: "SJO · LIR", bestShort: "Dec–Apr",
    postcard: {
      image: `${WF}/6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg`, alt: "Costa Rica: rainforest, volcano and the Pacific coast",
      front: { eyebrow: "Greetings from Costa Rica · Route ITN-LAND-2026-418207", title: "The Classic", line: "Volcano, cloud forest, then the Pacific to dry off." },
      greeting: "Dear traveller,",
      note: ["Eight nights, three climates, one very patient sloth. Arenal for the volcano, Monteverde for the cloud forest, Manuel Antonio to sit still and let the ocean do the talking.", "Go December to April. Pack for rain anyway. And leave one afternoon with nothing in it; that's usually when Costa Rica shows off."],
      to: ["Your name here", "Wherever you're dreaming from", "Planned with James Wild & Co."],
      postmark: { place: "San José · CR", date: "26 Oct 2026" }, stampLabel: "Pura vida",
    },
  },
  {
    slug: "south-africa", name: "South Africa", region: "africa", regionName: "Africa",
    subtitle: "Where Safari Becomes a Story",
    leading: "From fynbos-clad coasts and whale-watching bays to Big Five savannas and world-class vineyards, South Africa stitches dramatic landscapes with refined hospitality: Cape Town's city elegance, private reserve safaris and coastal nature retreats in one journey.",
    hero: { src: `https://res.cloudinary.com/jhlnq5h5/image/upload/e_upscale/c_limit,w_2560/q_auto:good/f_jpg/jwco/site/destinations/south-africa/getty-813447208`, alt: "South Africa: a safari vehicle in the bush at golden hour" },
    story: [
      { eyebrow: "South Africa · the place", title: "The World's Most Complete African Experience", image: { src: `https://res.cloudinary.com/jhlnq5h5/image/upload/e_upscale/c_limit,w_2560/q_auto:good/f_jpg/jwco/site/destinations/south-africa/stellenbosch-vineyards`, alt: "Vineyards below the mountains of Stellenbosch, Cape Winelands" }, blocks: [
        { h: "A continent in one country", p: "Big Five game-viewing in Kruger and private concessions, coastal wildlife and whale country along the Southern Cape, and exceptional dining amid the Winelands. Sabi Sands, Kruger, the Garden Route and the Cape each offer a distinct cast of species, scenery and culture, so a single itinerary can feel like several trips in one." },
        { h: "Why travellers return", p: "Accessible infrastructure, high guiding standards and a range of malaria-free options make South Africa an ideal first African journey, and one to return to: a predator-focused photography safari, a wine and culinary chapter in Franschhoek and Stellenbosch, or a private multi-region itinerary." },
      ] },
      { eyebrow: "Explore South Africa", title: "How to Experience the Country", image: { src: `https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_2560/q_auto:good/f_jpg/wildco/south-africa/sabi-sand/tengile-malamala/tengile-malamala-leopard-portrait`, alt: "A leopard in the Sabi Sand, South Africa" }, blocks: [
        { h: "Safari and the Big Five", p: "Kruger and the adjoining private reserves offer the best chance of lion, elephant, leopard, rhino and buffalo, from intimate lodges and tented camps to historic choices like Kruger Shalati." },
        { h: "Cape Town and whale country", p: "Cape Town is the base for culture, seafood and Table Mountain, with penguin colonies and whale-watching along Walker Bay; Ellerman House, The Silo and Grootbos sit on the coast." },
        { h: "The Winelands", p: "Franschhoek and Stellenbosch pair vineyard estates with fine dining: Babylonstoren, Leeu Estates and La Residence, a short scenic drive from Cape Town." },
        { h: "Family, romance and malaria-free options", p: "Private villas, family suites and bush picnics for multi-generational trips and honeymoons alike; the Western Cape, the Karoo and select private reserves are malaria-free." },
      ] },
    ],
    facts: [
      ["Best months", "May to October is peak safari season in Kruger and the private reserves: dry, sparse bush and reliable game around waterholes. The Western Cape and Winelands are best November to April. Whale watching on the Southern Cape peaks July to October."],
      ["Getting there", "Fly into Johannesburg O.R. Tambo for light-aircraft connections to Hoedspruit or Skukuza, a short transfer from the Sabi Sands, Timbavati and Thornybush lodges. Cape Town International serves the Cape, the Winelands and the Garden Route directly, with regular flights between the two."],
      ["Who it suits", "Couples and honeymooners drawn to private concessions and vineyard estates, families looking for malaria-free wildlife, wildlife photographers targeting predator-rich reserves, and travellers who want exceptional food, wine and lodge design alongside genuine wilderness."],
    ],
    faqs: [
      { q: "When is the best time to visit South Africa?", a: "For Big Five safaris in Kruger and the private reserves, the dry season from May to October gives the best game viewing as the bush thins and animals gather at water. The Western Cape and Winelands are most pleasant from November to April, and whale watching along Walker Bay peaks from June to November." },
      { q: "How many days do you need in South Africa?", a: "A first itinerary typically runs 10 to 14 days: a Cape Town base with at least three nights on safari in the greater Kruger or a private reserve. Sixteen to twenty-one days adds the Garden Route, the Winelands and a malaria-free reserve such as Samara Karoo." },
      { q: "Is South Africa safe for travelers?", a: "With a reputable operator, yes. Private reserves, lodges and guided itineraries keep guests in well-managed settings, and domestic flights between regions limit time in cities. Standard travel awareness applies in Cape Town and Johannesburg." },
      { q: "Which reserves are best for a South Africa safari?", a: "The Sabi Sands and greater Kruger anchor most safari itineraries, with Thornybush and Timbavati offering strong Big Five viewing. For malaria-free safari, Samara Karoo in the Great Karoo is known for cheetah conservation and dramatic semi-arid landscapes." },
    ],
    contentStatus: "needs_review",
    months: [
      { area: "Greater Kruger & private reserves", note: "Sabi Sands, Timbavati, Thornybush", months: M("ggggBBBBBBgg") },
      { area: "Cape Town & the Winelands", note: "Franschhoek, Stellenbosch, the coast", months: M("BBBBggggggBB") },
      { area: "Southern Cape whale coast", note: "Walker Bay, Hermanus, Grootbos", months: M("ggggggBBBBgg") },
    ],
    airports: [["Johannesburg (JNB)", "Connections to Hoedspruit and Skukuza for the Kruger lodges"], ["Cape Town (CPT)", "The Cape, the Winelands and the Garden Route"]],
    transfers: [["JNB → Hoedspruit / Skukuza", "About an hour by light aircraft"], ["CPT → Franschhoek", "About 55 minutes by road"], ["CPT → Hermanus", "About 1.5 hours by road"]],
    liveRates: { stay: "leeu-estates", property: "leeu-estates-resorts", name: "Leeu Estates", line: "Our first stay with live booking: the Franschhoek vineyard estate James inspected in May 2026, priced live from the booking desk for your dates." },
    flyInto: "JNB · CPT", bestShort: "May–Oct safari",
  },
];

// Country pages generated from the library (scripts/export-countries.py), 28 Oct 2026.
const FROM_LIBRARY = (LIBRARY.countries as unknown as (CountryData & { atlasName?: string })[]).map(({ atlasName: _a, ...c }) => c as CountryData);
export const COUNTRIES: CountryData[] = [...HAND.map((h) => ({ ...h, ledgerId: h.ledgerId ?? FROM_LIBRARY.find((c) => c.slug === h.slug)?.ledgerId ?? null })), ...FROM_LIBRARY.filter((c) => !HAND.some((h) => h.slug === c.slug))];

export const countryBySlug = (region: string, slug: string) => COUNTRIES.find((c) => c.region === region && c.slug === slug);
