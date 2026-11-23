import type { CountryData } from "./countries";

// House destination cards, hand-built (James, 21 Nov 2026: "Yes proceed", St Barths, Anguilla and Bali first).
// Islands the house's photographs and sailings already reach but the library has no Destination record for yet.
// Each is a destination card (staysComing): no stays are filed, so the page reads "stays coming soon, plan with
// James". Facts only from official bodies, kept as data in HOUSE_CARD_SOURCES and never printed as links (James,
// 13 Nov 2026): St Barths from the Comité Territorial du Tourisme de Saint-Barthélemy; Anguilla from the Anguilla
// Tourist Board and the Government of Anguilla. contentStatus stays "none" until James has read each page.
// Founder marks (James, 21 Nov 2026): he sailed these islands in 2024 aboard Windstar's Wind Surf and SeaDream II,
// and was back on St Maarten, St Barths and Anguilla in August 2025. Cap Juluca on Anguilla is a house partner; its
// stay page went live on 23 Nov 2026 (STY-2026-000772), so Anguilla is a full page now: its hero is Cap Juluca's own
// credited photograph and staysComing is off. St Barths is still a destination card.
// The library already holds St Barths as DST-2026-000063 (slug st-barths, coming soon), so the card uses that slug and
// name and picks up its Ledger ID; Anguilla is DST-2026-000113, created 21 Nov 2026 with Cap Juluca.
// No photograph is on file yet (hero.src null, never a stand-in): the licensed Getty heroes arrived at preview
// size only, and wait in HERO_QUEUE below until the full-size files are in the library.

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const REGION = { region: "caribbean-mexico", regionName: "Caribbean & Mexico" };

export const HOUSE_CARD_SOURCES: Record<string, { title: string; url: string }[]> = {
  "st-barths": [
    { title: "Comité Territorial du Tourisme de Saint-Barthélemy: Travel", url: "https://www.saintbarth-tourisme.com/travel" },
    { title: "Comité Territorial du Tourisme de Saint-Barthélemy: Discover", url: "https://www.saintbarth-tourisme.com/discover" },
    { title: "Comité Territorial du Tourisme de Saint-Barthélemy: Saint-Jean", url: "https://www.saintbarth-tourisme.com/locations/saint-jean" },
  ],
  anguilla: [
    { title: "Anguilla Tourist Board: Getting to Anguilla", url: "https://ivisitanguilla.com/getting-to-anguilla/" },
    { title: "Anguilla Tourist Board: island facts", url: "https://ivisitanguilla.com/faq/" },
    { title: "Anguilla Tourist Board: Explore our Island", url: "https://ivisitanguilla.com/explore-our-island/" },
    { title: "Anguilla Tourist Board: boat racing", url: "https://ivisitanguilla.com/sports/" },
    { title: "Government of Anguilla: Anguilla Facts", url: "https://gov.ai/service/about-anguilla/anguilla-facts" },
  ],
};

export const HOUSE_CARDS: CountryData[] = [
  {
    slug: "st-barths", name: "St Barths", ...REGION,
    subtitle: "A French island of red roofs, seventeen beaches and one very short runway",
    leading: "Saint-Barthélemy is 24 square kilometres of dry volcanic hills in the French West Indies, with a Swedish-built harbour town, a marine reserve around its shores and beaches on every side. No long-haul flight lands here. You arrive by small plane, by ferry or under sail, and the house plans it that way.",
    hero: { src: null, alt: "St Barths, Caribbean" },
    story: [
      { eyebrow: "St Barths · the place", title: "Small, French and Hard to Reach on Purpose", image: { src: null, alt: "St Barths: Gustavia harbour" }, blocks: [
        { p: "The Arawak called the island Ouanalao. Columbus sighted it in 1493, French colonists settled in 1648, and in 1784 it passed to Sweden, which built Gustavia as a free port. It returned to France in 1878 and has been a French Overseas Collectivity since 15 July 2007. The red roofs around the harbour are the picture most people carry home." },
        { p: "The island is a former volcano: rocky ground, arid soil and no natural source of drinking water. A marine nature reserve of 1,200 hectares, set up in 1996, protects the water in several zones around the coast." },
        { h: "Getting in is half of it", p: "The runway at Rémy de Haenen Airport is 650 metres long and reserved for small aircraft; it opens at seven in the morning and closes fifteen minutes after sunset. Most travellers connect through St Maarten, Guadeloupe, Antigua or San Juan. Ferries cross from St Martin and Sint Maarten to Gustavia several times a day, in about 45 minutes." },
      ] },
      { eyebrow: "Where the house sends you", title: "Gustavia, Saint-Jean and the Quiet Coasts", image: { src: null, alt: "St Barths: Saint-Jean bay" }, blocks: [
        { h: "Gustavia", p: "The harbour town and the port, where the ferries land. The Governors' House, built around 1780, served the Swedish governors from 1785 to 1877; Dinzey House, from about 1820, survived the great fire of 1852." },
        { h: "Saint-Jean", p: "A bay of calm turquoise water beside the airport, lined with a beach, beach clubs and shops. Its central position and the airport next door make it a popular place to stay." },
        { h: "The beaches", p: "The tourism committee names seventeen. Flamands is the largest and Saline the second; Gouverneur, Colombier, Lorient, Grand Cul-de-Sac, Shell Beach and Toiny are among the rest." },
        { h: "The founder's corner", p: "James came to St Barths under sail in 2024, aboard Windstar's Wind Surf and SeaDream II, and was back in August 2025. His own favourite is Toiny, on the Côte Sauvage, the wild windward side of the island." },
        { h: "By sea", p: "St Barths is a port of call on small-ship sailings in the Ledger, with SeaDream and Four Seasons I among them." },
      ] },
    ],
    staysComing: true,
    facts: [
      ["Best months", "December to May is the dry, mild season, at about 27°C. June to November is hot and humid, at 30 to 32°C; the tourism committee calls December to August the most favourable stretch."],
      ["Getting there", "No long-haul flights. Connect through St Maarten (SXM), Guadeloupe (PTP), Antigua (ANU) or San Juan (SJU) to a small aircraft, or take the ferry from St Martin or Sint Maarten to Gustavia, about 45 minutes."],
      ["Entry", "A valid passport for everyone. US and Canadian citizens need no visa for stays of 90 days or fewer; other nationalities should check French requirements before travel. Sint Maarten asks every traveller, including those in transit, to complete its entry form."],
      ["Who it suits", "Couples, families taking a villa, and sailors. Travellers who want French food and a beach within ten minutes in any direction."],
      ["Size", "24 square kilometres, with a 1,200 hectare marine nature reserve around it."],
      ["In the Ledger", "A destination card: stays coming soon. James sailed here in 2024 and returned in August 2025."],
    ],
    faqs: [
      { q: "When is the best time to visit St Barths?", a: "December to May, the dry and mild season, when the air is about 27°C. June to November is hotter and more humid, at 30 to 32°C. The island's tourism committee describes December to August as the most favourable period overall." },
      { q: "How do you get to St Barths?", a: "There are no direct long-haul flights. Most travellers fly to St Maarten (SXM), Guadeloupe, Antigua or San Juan and connect on a small aircraft to Rémy de Haenen Airport, or take a ferry from St Martin or Sint Maarten to Gustavia in about 45 minutes." },
      { q: "Why can't large planes land on St Barths?", a: "The runway is 650 metres long and is reserved for small aircraft. The airport opens at 7:00 in the morning and closes fifteen minutes after sunset, so connections have to be timed for daylight." },
      { q: "Is St Barths part of France?", a: "Yes. Saint-Barthélemy has been a French Overseas Collectivity since 15 July 2007. It was Swedish from 1784 to 1878, which is where Gustavia gets its name and its free-port history." },
      { q: "How many beaches does St Barths have?", a: "The tourism committee names seventeen, including Flamands (the largest), Saline, Gouverneur, Colombier, Saint-Jean, Lorient, Grand Cul-de-Sac, Shell Beach and Toiny." },
      { q: "Do I need a visa for St Barths?", a: "US and Canadian citizens need no visa for stays of 90 days or fewer, with a passport valid for more than six months and a return or onward ticket. UK citizens need no visa for stays of up to 90 days. Other nationalities should check French visa rules before departure." },
      { q: "Has James been to St Barths?", a: "Yes. James sailed to St Barths in 2024 aboard Windstar's Wind Surf and SeaDream II, and returned in August 2025. His favourite part of the island is Toiny, on the Côte Sauvage." },
      { q: "Can you visit St Barths by ship?", a: "Yes. Gustavia is a port of call for small ships, and the house files sailings that call there. Tell us your dates and we will match a sailing or plan the island on its own." },
    ],
    contentStatus: "none",
    months: [{ area: "St Barths", note: "Dry and mild December to May · hot and humid June to November", months: M("BBBBBgggwwwB") }],
    airports: [["St Barths (SBH)", "Rémy de Haenen Airport: a 650 metre runway, small aircraft only, daylight hours"], ["St Maarten (SXM)", "Princess Juliana, the main gateway, for the short flight or the ferry"], ["Guadeloupe (PTP)", "Daily regional connections"]],
    transfers: [["St Maarten → Gustavia", "About 45 minutes by ferry, several times a day"], ["St Maarten → St Barths", "A short flight on a small aircraft"], ["Airport → Saint-Jean", "Minutes; the bay is beside the runway"]],
    flyInto: "SXM · SBH", bestShort: "Dec to May",
  },
  {
    slug: "anguilla", name: "Anguilla", ...REGION,
    subtitle: "Thirty-three beaches on a flat coral island, nine miles from St Martin",
    leading: "Anguilla is the most northerly of the Leeward Islands: 35 square miles of coral and limestone, 16 miles long and 3 wide, ringed by 33 beaches and a handful of uninhabited cays. It is a self-governing British Overseas Territory, quiet by design, and most people reach it by a 25 minute boat from St Maarten.",
    hero: { src: "https://res.cloudinary.com/jhlnq5h5/image/upload/f_auto,q_auto/jwco/stays/anguilla/belmond-cap-juluca/hero", alt: "Two guests carrying a paddleboard along the white sand of Maundays Bay past the beachfront villas of Cap Juluca, Anguilla" },
    story: [
      { eyebrow: "Anguilla · the place", title: "Flat, Bright and Unhurried", image: { src: null, alt: "Anguilla: a white sand beach" }, blocks: [
        { p: "Anguilla has no mountains and no rainforest. It is a low island of coral and limestone. It lies about 150 miles east of Puerto Rico and nine miles north of St Martin, with The Valley as its small capital." },
        { p: "The island runs east to west along one main road, and the Tourist Board counts 33 beaches along its shores. The mean monthly temperature is about 80°F, rainfall is low at roughly 35 inches a year, and the trade winds do the rest." },
        { h: "A sailing island", p: "Boat racing is Anguilla's national pastime. The season begins around Easter week and ends in August with the Champion of Champions, a round-the-island race at the close of Boat Racing Week. If you are here then, watch one from the beach." },
      ] },
      { eyebrow: "Where the house sends you", title: "The West End, Sandy Ground and the Cays", image: { src: null, alt: "Anguilla: Sandy Island from the air" }, blocks: [
        { h: "The West End", p: "Meads Bay, Rendezvous Bay, Maundays Bay, Barnes Bay, Long Bay and Cove Bay: long arcs of soft sand on calm water, and the beaches the island is known for." },
        { h: "Sandy Ground and Sandy Island", p: "Sandy Ground is the island's harbour beach. From it a shuttle runs ten minutes out to Sandy Island, a strip of sand with palms, a lunch table and a reef to snorkel." },
        { h: "Prickly Pear and Scilly Cay", p: "Prickly Pear is twenty minutes by boat from Sandy Ground, for snorkelling, swimming and a long lunch. Scilly Cay is three minutes from the wharf at Island Harbour, known for lobster and rum punch. Anguilla has seven cays in all." },
        { h: "The founder's Anguilla", p: "James knows these waters from the deck: he sailed them in 2024 aboard Windstar's Wind Surf and SeaDream II, and came back to Anguilla in August 2025 on a trip that took in St Maarten and St Barths. Cap Juluca, on Maundays Bay, is the house's partner stay on the island." },
        { h: "By sea", p: "Anguilla is a port of call for Four Seasons I in the Ledger, and it pairs easily with St Barths and St Martin on a week under sail or by short boat hops." },
      ] },
    ],
    facts: [
      ["Best months", "December to April is the island's main season. Rainfall is low all year, about 35 inches, and the Tourist Board puts the rainy season from September."],
      ["Getting there", "Fly into St Maarten (SXM), then about 25 minutes by boat from the Anguilla St Maarten Ferry Terminal across from the airport, or 30 minutes by public ferry. All ferries arrive at Blowing Point. Anguilla's own airport is Clayton J. Lloyd International (AXA)."],
      ["Who it suits", "Beach lovers, families and couples who want calm water and good food without a scene. Sailors, from Easter to August."],
      ["Size", "35 square miles: 16 miles long and 3 miles wide at its widest point."],
      ["Money and language", "English. The Eastern Caribbean dollar, with US dollars widely accepted."],
      ["In the Ledger", "A destination card: Cap Juluca, a house partner, is coming. James was on the island in August 2025."],
    ],
    faqs: [
      { q: "When is the best time to visit Anguilla?", a: "December to April is the main season. The island is warm all year, with a mean monthly temperature of about 80°F and low rainfall of roughly 35 inches a year; the Tourist Board puts the rainy season from September." },
      { q: "How do you get to Anguilla?", a: "Most visitors fly to St Maarten (SXM) and cross by boat: about 25 minutes from the Anguilla St Maarten Ferry Terminal opposite the airport, or about 30 minutes on the public ferry. Every ferry arrives at the Blowing Point Ferry Terminal. Anguilla also has its own airport, Clayton J. Lloyd International (AXA)." },
      { q: "How many beaches does Anguilla have?", a: "Thirty-three, by the Anguilla Tourist Board's count, on an island 16 miles long. Meads Bay, Rendezvous Bay, Maundays Bay and Cove Bay on the West End are the best known." },
      { q: "How big is Anguilla?", a: "35 square miles: 16 miles long and 3 miles wide at its widest point. It is flat, made of coral and limestone, and easy to cross end to end." },
      { q: "Is Anguilla British?", a: "Yes. Anguilla is a self-governing British Overseas Territory. English is the language and the capital is The Valley." },
      { q: "What currency does Anguilla use?", a: "The Eastern Caribbean dollar. US dollars are widely accepted." },
      { q: "Has James been to Anguilla?", a: "Yes. James was on Anguilla in August 2025, on a trip that also took in St Maarten and St Barths, and he sailed these islands in 2024 aboard Windstar's Wind Surf and SeaDream II. Cap Juluca, A Belmond Hotel, on Maundays Bay is the house's partner stay there." },
      { q: "Can you visit Sandy Island from Anguilla?", a: "Yes. A shuttle runs from Sandy Ground to Sandy Island in about ten minutes. Prickly Pear is about twenty minutes by boat from the same beach." },
    ],
    contentStatus: "none",
    months: [{ area: "Anguilla", note: "Main season December to April · rain most likely from September", months: M("BBBBggggwwwB") }],
    airports: [["St Maarten (SXM)", "Princess Juliana, the gateway most visitors use; the ferry terminal is across from the airport"], ["Anguilla (AXA)", "Clayton J. Lloyd International, in The Valley"], ["San Juan (SJU)", "Connections by small aircraft"]],
    transfers: [["St Maarten airport → Blowing Point", "About 25 minutes by boat"], ["Marigot → Blowing Point", "About 30 minutes by public ferry"], ["Sandy Ground → Sandy Island", "About 10 minutes by shuttle boat"], ["Sandy Ground → Prickly Pear", "About 20 minutes by boat"]],
    flyInto: "SXM · AXA", bestShort: "Dec to Apr",
  },
];

// HERO QUEUE: the licensed Getty photographs for these pages, named and alt-texted, waiting for their full-size
// files. The files James sent on 21 Nov 2026 are 612 pixels wide, below the 900 pixel floor for a full-screen hero
// (lib/content/sharpen.ts). When a full-size file is filed in the library at its id, move its row into
// HOUSE_HEROES in countries.ts; the first row becomes the page's hero and share image. Rows marked "confirm" hold
// back the place name until Getty's caption has been checked.
export const HERO_QUEUE: Record<string, { id: string; alt: string; caption?: string; confirm?: boolean }[]> = {
  "st-barths": [
    { id: "jwco/heroes/mexico-caribbean/gustavia-st-barths-red-roofs-harbour-yachts", alt: "Red roofed houses above Gustavia harbour with yachts at anchor, St Barths", caption: "Gustavia, St Barths" },
    { id: "jwco/heroes/mexico-caribbean/st-jean-bay-st-barths-eden-rock-aerial", alt: "St Jean Bay from above with a red roofed hotel on the rock between two white beaches, St Barths", caption: "St Jean Bay, St Barths" },
    { id: "jwco/heroes/mexico-caribbean/gustavia-st-barths-harbour-dusk-lights", alt: "Gustavia harbour at dusk with red roofs, harbour lights and yachts under evening cloud, St Barths", caption: "Gustavia, St Barths" },
    { id: "jwco/heroes/mexico-caribbean/colombier-bay-st-barths-hillside-cactus-view", alt: "View over cactus and rock to a turquoise bay, a white beach and offshore islets on the north west of St Barths", confirm: true },
    { id: "jwco/heroes/mexico-caribbean/st-barths-beach-loungers-umbrella-palm", alt: "Two wooden sun loungers under a white umbrella and a palm on a white sand beach facing turquoise water", confirm: true },
  ],
  anguilla: [
    { id: "jwco/heroes/mexico-caribbean/sandy-island-anguilla-sand-cay-reef-aerial", alt: "Aerial view of a tiny white sand cay with one building, ringed by turquoise shallows and coral reef", confirm: true },
    { id: "jwco/heroes/sailing/sailing-yacht-bow-sand-cay-palms-turquoise", alt: "View from the deck of a sailing yacht toward a low sand cay with palms across bright turquoise water", confirm: true },
    { id: "jwco/heroes/mexico-caribbean/caribbean-cove-swimmer-turquoise-water-aerial", alt: "Aerial view of a swimmer floating in clear turquoise water off a small white sand cove with rock ledges", confirm: true },
    { id: "jwco/heroes/mexico-caribbean/caribbean-white-sand-beach-palms-swimmer-aerial", alt: "Aerial view of a white sand beach with palm shade and a lone swimmer in clear shallows", confirm: true },
  ],
  bali: [
    { id: "jwco/heroes/indonesia-raja-ampat/bali-tegallalang-rice-terraces-sunrise-volcano-aerial", alt: "Aerial view of the Tegallalang rice terraces among palms at sunrise with a volcano on the horizon, Bali, Indonesia", caption: "Tegallalang, Bali" },
    { id: "jwco/heroes/indonesia-raja-ampat/nusa-penida-kelingking-beach-headland-steps", alt: "Steep steps leading down toward the green headland and white cove of Kelingking Beach, Nusa Penida, Bali, Indonesia", caption: "Kelingking Beach, Nusa Penida" },
    { id: "jwco/heroes/indonesia-raja-ampat/bali-rice-terraces-couple-walking-golden-light", alt: "A couple walking hand in hand along a rice terrace among palms in golden light, Bali, Indonesia", confirm: true },
    { id: "jwco/heroes/indonesia-raja-ampat/bali-macaques-mossy-stone-lion-statue", alt: "Three long tailed macaques, one holding an infant, seated on a moss covered stone lion statue in forest, Bali, Indonesia", confirm: true },
    { id: "jwco/heroes/indonesia-raja-ampat/bali-jungle-waterfalls-traveller", alt: "A traveller looking across jungle to twin waterfalls dropping down a green cliff, Bali, Indonesia", confirm: true },
    { id: "jwco/heroes/indonesia-raja-ampat/nusa-penida-sea-stacks-turquoise-coast", alt: "Green topped sea stacks and cliffs rising from deep turquoise water along a wild coast, Nusa Penida, Bali, Indonesia", confirm: true },
  ],
};
