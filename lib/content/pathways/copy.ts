// House copy for the pathway collection pages: an answer paragraph and a
// few questions per pathway, written in the House voice (not attributed to
// James; nothing here is a quotation). Reviewed with the pages before launch.
import type { PathwayId } from "../../pathways";

export const PATHWAY_ANSWER: Record<PathwayId, string> = {
  "PATH-01": "Into the Green gathers the rainforest and jungle stays in the James Wild & Co Ledger: lodges under the canopy, cloud-forest houses, river camps and the roads that join them. Each entry is vetted by James or a named partner, keeps its own Ledger ID, and can be booked as a single stay or built into a journey with an advisor.",
  "PATH-02": "Between Tides is the Ledger's island and ocean collection: atolls, reef houses, private islands and the small ships that reach them. Every entry is vetted, filed under a permanent Ledger ID, and sits beside the voyages that pass the same water.",
  "PATH-03": "Above It All collects the mountain and highland stays in the Ledger: alpine houses, desert plateaus and vineyard valleys with the long view. Vetted entries only, each with its own Ledger ID.",
  "PATH-04": "Where the Wild Lives is the Ledger's wildlife and wilderness collection: safari camps, private reserves and the conservancies that keep the wild wild. Every entry is vetted by James or a named partner and keeps its own Ledger ID. When the whole journey is a safari, the house's safari desk, Wild & Co Safaris, plans it reserve by reserve.",
  "PATH-05": "The Art of Stillness gathers the Ledger's wellness and restoration stays: hot springs, quiet estates and places built for doing less. Vetted entries only, each under a permanent Ledger ID.",
  "PATH-06": "Off the Map is the Ledger's collection of hidden and undiscovered places: stays with no signpost, filed before anyone else found them. Each is vetted and keeps its own Ledger ID; some are shown only when a reading is sent to the house.",
  "PATH-07": "A Place of Our Own collects the Ledger's private residences: whole houses, whole islands and whole camps for one party under one roof. Each entry is vetted and keeps its own Ledger ID; many also appear in the Gatherings volume.",
  "PATH-08": "Rooted in Place gathers the heritage and culture stays in the Ledger: working farms, old houses and hosts whose families never left. Vetted entries only, each with its own Ledger ID.",
};

export const PATHWAY_FAQS: Record<PathwayId, { q: string; a: string }[]> = {
  "PATH-01": [
    { q: "What counts as a rainforest or jungle stay?", a: "A lodge, camp or house where the forest is the setting, not the backdrop: canopy, cloud forest, river roads. The Ledger files each one by its own setting and intentions." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
    { q: "Who vets these stays?", a: "James, or a named partner the house trusts. The Ledger prints the provenance beside every entry and never claims a visit that is not on record." },
  ],
  "PATH-02": [
    { q: "Does Between Tides include voyages?", a: "The collection lists stays. The voyages that pass the same waters are linked from each entry and live in the Voyages volume." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-03": [
    { q: "What makes a stay Above It All?", a: "Altitude or the long view: alpine houses, highland lodges, desert plateaus, vineyard valleys beneath the peaks." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-04": [
    { q: "Is this where I plan a safari?", a: "This is the Ledger's collection of wildlife stays: the place to find and compare them. When a journey is a safari from start to finish, the house's safari desk, Wild & Co Safaris, plans it by reserve, camp and season, and your advisor walks you there." },
    { q: "How does the house know what a stay gives back?", a: "Each stay page carries a Where Your Stay Gives Back note with the statement's source, review date and status. Nothing is printed without a source." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-05": [
    { q: "Is The Art of Stillness only spas?", a: "No. It gathers places built for doing less: hot springs, quiet estates, slow mornings. A spa may be part of it; stillness is the point." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-06": [
    { q: "Why are some entries hidden?", a: "A few places James goes himself are not published. The Compass holds one back in each reading; it is shared when the reading is sent to the house." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-07": [
    { q: "What is the difference from Gatherings?", a: "Gatherings is a volume for the generations who travel together. A Place of Our Own is the pathway for any whole-house or exclusive-use stay; many entries are in both." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
  "PATH-08": [
    { q: "What makes a stay Rooted in Place?", a: "A working farm, an old house kept rather than rebuilt, hosts whose families never left. The host and the history are part of the stay." },
    { q: "Can a stay be on more than one pathway?", a: "Yes. A pathway is a collection, not a category. A stay leads with one pathway and may sit on others; it keeps a single Ledger ID and page." },
  ],
};

// Title and meta description per pathway, tuned to the head terms in
// data/seo-keywords.json (30 Oct 2026). Titles keep the pathway name first so
// the brand's own vocabulary is what gets cited; the search phrase follows.
export const PATHWAY_SEO: Record<PathwayId, { title: string; description: string }> = {
  "PATH-01": { title: "Into the Green: Jungle and Rainforest Lodges Vetted by James Wild & Co", description: "Jungle lodges, cloud-forest houses and river camps from Costa Rica to the Daintree and the Amazon, vetted by James Wild & Co under permanent Ledger IDs." },
  "PATH-02": { title: "Between Tides: Private Islands, Reefs and Beach Stays Vetted by James Wild & Co", description: "Private island resorts, overwater and beachfront stays and the small ships that reach them, from Taha'a to the Caribbean. Vetted by James Wild & Co." },
  "PATH-03": { title: "Above It All: Mountain and Highland Lodges Vetted by James Wild & Co", description: "Mountain lodges, alpine houses and desert-plateau retreats with the long view, from the Andes and the Atacama to the Winelands. Vetted by James Wild & Co." },
  "PATH-04": { title: "Where the Wild Lives: Safari Camps and Private Reserves Vetted by James Wild & Co", description: "Luxury safari camps, private game reserves and conservancies from the Okavango to the Maasai Mara, vetted by James Wild & Co, with what each stay gives back." },
  "PATH-05": { title: "The Art of Stillness: Wellness and Slow-Stay Retreats Vetted by James Wild & Co", description: "Wellness retreats, hot springs and quiet estates built for doing less, vetted by James Wild & Co under permanent Ledger IDs. Restoration, not regimes." },
  "PATH-06": { title: "Off the Map: Remote and Secluded Lodges Vetted by James Wild & Co", description: "Remote lodges and secluded houses with no signpost, filed in the James Wild & Co Ledger first. Some are shared only when a Compass reading is sent in." },
  "PATH-07": { title: "A Place of Our Own: Private Villas and Exclusive-Use Stays Vetted by James Wild & Co", description: "Private villas with staff, exclusive-use safari lodges and whole islands for one party under one roof, vetted by James Wild & Co. Many also sit in Gatherings." },
  "PATH-08": { title: "Rooted in Place: Heritage Hotels, Wine Estates and Host-Led Stays Vetted by James Wild & Co", description: "Heritage hotels, working farms, wine estates and old houses kept rather than rebuilt, with hosts whose families never left. Vetted by James Wild & Co." },
};
