// The trust pages: /the-ledger (how James vets every stay), /for-advisors
// (join the house) and /partners (partner with a purpose).
//
// Sources: the Ledger status model in lib/ledger/status.ts (what each stamp
// may claim), the house's "I Know a Place" voice marks (Oct 2026), the
// Base44 library's Ledger ID prefixes (houseData.js LEDGER_PREFIXES), the
// Base44 agents sample (legacy terms carried over for James to confirm) and
// the partner page (James's approved edit). Pending sign-off where marked.

import type { LedgerStampKind } from "@/lib/ledger/status";
import { LEDGER_COUNTS } from "@/lib/ledger/counts";

// ── /the-ledger ─────────────────────────────────────────────────────────────
export type Mark = { stamp: LedgerStampKind | null; says: string; plain: string; rule: string };

export const LEDGER = {
  eyebrow: "The House · The Ledger",
  title: "The Ledger: How James Vets Every Stay, Ship and Route",
  subtitle: "Ledgered, not crowded. Nothing gets in on a brochure's word, and nothing gets a mark it hasn't earned.",
  answer: `The Ledger is James Wild & Co's record of every stay, safari reserve, family residence, vessel and route it recommends. Each entry is vetted in person or through a named partner, filed under a permanent Ledger ID that's never reused, and carries one dated mark saying exactly how the house knows it. It holds ${LEDGER_COUNTS.stays} live stays, ${LEDGER_COUNTS.vessels} vessels and ${LEDGER_COUNTS.journeys} journeys.`,
  counts: [
    [String(LEDGER_COUNTS.stays), "live stays"],
    [String(LEDGER_COUNTS.vessels), "vessels"],
    [String(LEDGER_COUNTS.journeys), "journeys"],
    ["1983", "first journey designed"],
  ] as [string, string][],
  steps: [
    { n: "01", title: "Heard of", line: "A tip from a guide, a host, an advisor or a long dinner. It goes on James's list, not in the Ledger." },
    { n: "02", title: "Walked, sailed or slept in", line: "James goes himself, or a partner he trusts goes and reports back. The visit is dated." },
    { n: "03", title: "Filed", line: "It earns a permanent Ledger ID, a mark that says how the house knows it, and notes on who it suits and what to avoid." },
    { n: "04", title: "Kept honest", line: "Rates are re-checked at every enquiry. Marks are never upgraded on anyone's say-so, and an ID is never reused when a place changes hands." },
  ],
  marks: [
    { stamp: "Founder favorite", says: "One of mine.", plain: "James has stayed here and named it one of his favourites.", rule: "Only with a recorded stay that James names a favourite." },
    { stamp: "Field verified", says: "I know a place.", plain: "James stayed here. He slept in the bed.", rule: "Only with a dated founder stay." },
    { stamp: "Founder inspected", says: "I've walked it.", plain: "James toured it in person and approved it.", rule: "Only with a dated inspection." },
    { stamp: "Host met", says: "I know the host.", plain: "James has met the people who run it. The house can patch you in.", rule: "Worn on the host's portrait, never on the stay." },
    { stamp: null, says: "I know who knows.", plain: "Vetted through a named partner on the ground, labelled Partner verified.", rule: "A quiet line, no stamp." },
    { stamp: "Under observation", says: "I'll know soon.", plain: "On James's list and worth the trip. Not yet in the Ledger.", rule: "Never shown on a Ledger record." },
  ] as Mark[],
  ids: [
    ["STY", "Stays", "STY-2026-000006"],
    ["RSV", "African reserves", "RSV-2026-…"],
    ["RES", "Family residences", "RES-2026-…"],
    ["VSL", "Vessels", "VSL-2026-…"],
    ["ITN-LAND", "Overland routes", "ITN-LAND-2026-418207"],
    ["ITN-VSL", "Voyages", "ITN-VSL-2026-302558"],
  ] as [string, string, string][],
  entry: {
    id: "ITN-VSL-2026-302558",
    name: "Aliikai · 10 Day Raja Ampat North",
    volume: "The Voyage Ledger",
    status: "Field verified · 2024",
    lines: [
      ["Route", "Sorong → Wayag → Sorong, 9 nights"],
      ["Best months", "October to April"],
      ["The vessel", "A phinisi of Sulawesi ironwood: two masts, seven sails"],
      ["Fare", "From US$4,830 per person, rechecked at enquiry"],
    ] as [string, string][],
    note: "James sailed her with his son in November 2024.",
  },
  struck: [
    { word: "Hidden gem", why: "If it's on a website, it's not hidden. If it were a gem, it'd be in a vault." },
    { word: "Bucket list", why: "We'd rather you went while you're very much alive and kicking." },
    { word: "Bespoke", why: "Suits are bespoke. Trips are planned, carefully, by someone who's been." },
    { word: "Once in a lifetime", why: "The places James would send his own family. That's what the Founder favorite stamp is for." },
    { word: "Curated", why: "Museums curate. We vet. There's a difference, and it involves mosquito nets." },
  ],
  folio: "Under the Ledger sits the Traveller Folio: each journey gets its own Folio ID, so the house travels with you along the way. Bookings, confirmations and live updates on the road come from myfolio@jameswildco.com under that ID, and you come home to a digital folio of the trip, kept on your own shelf for years.",
  jamesNote: "If I haven't slept in it, sailed it or walked it, or sent someone I'd trust with my own family, it isn't in the Ledger. That's not a policy. It's just how I've always done it.",
  faqs: [
    { q: "What is the James Wild & Co Ledger?", a: "The house's record of every stay, reserve, residence, vessel and route it recommends. Each entry has a permanent Ledger ID and a dated mark showing how the house knows it: stayed, inspected, named a founder favourite, or vetted through a named partner." },
    { q: "Has James personally stayed everywhere in the Ledger?", a: "No, and the Ledger says so. Where James stayed, the entry carries the Field verified stamp and the year; where he inspected, Founder inspected; where a trusted partner vetted it, a Partner verified line. Nothing is marked as a founder stay without a dated record." },
    { q: "What does a Ledger ID mean?", a: "A permanent reference for one place, ship or route, such as STY-2026-000006 for a stay or ITN-VSL-2026-302558 for a voyage. Advisors quote it; it's never reused, even if the property changes hands." },
    { q: "Are rates in the Ledger live?", a: "Rates shown are re-checked at every enquiry before a quote goes out. Live rates on selected stays are being added as booking connections open." },
    { q: "Can a hotel pay to be in the Ledger?", a: "No. A place earns its entry by being vetted. Partnerships and offers are labelled separately and never buy a mark." },
  ],
};

// ── /for-advisors ───────────────────────────────────────────────────────────
// Terms confirmed by James, 25 Oct 2026: 70% split, US$249/yr or US$49/mo,
// clients stay the advisor's (firm policy). Applications: advisors@jameswildco.com.
export const FOR_ADVISORS = {
  eyebrow: "For the trade · Advisors wanted",
  title: "The Desk Is Open: Become a James Wild & Co Travel Advisor",
  subtitle: "Not just a host agency ID. A craft, a Ledger to sell from, and a founder with forty-four years on the road to teach it.",
  quote: "Any house can issue you an ID. I'd rather train you.",
  answer:
    "James Wild & Co is a wholesaler and hybrid host agency that trains travel advisors in the founder's method and lets them plan and book from the Ledger: vetted stays, reserves, ships and routes with permanent IDs. Advisors keep 70% of booking commission on a membership of US$249 a year or US$49 a month. New and experienced advisors are welcome.",
  meta: [
    ["The training", "The founder's method, taught at the desk"],
    ["The Ledger", "Vetted entries with permanent IDs"],
    ["The split", "70% of booking commission to you"],
    ["The fee", "US$249 a year, or US$49 a month"],
    ["Your clients", "Stay yours. Always."],
  ] as [string, string][],
  why: [
    "An advisor network will issue you an ID in an afternoon: a portal, a split, a starter course. It's a fast way into the trade, and a slow way to stand out in it, because everyone gets the same thing.",
    "The house offers training with roots: how to vet a stay, read a season and file a journey a traveller can trust and a search engine can quote. When you plan from the Ledger you're not reselling inventory. You're quoting provenance.",
  ],
  compare: [
    ["Training", "Onboarding videos and a starter course", "The founder's method: vetting, seasons, routes and the slow-travel thinking behind them"],
    ["What you sell", "Inventory anyone in the network can quote", "The Ledger: entries vetted in person or by named partners, each with a permanent ID"],
    ["Your standing", "You sell under a marketplace brand", "Your clients travel on provenance, with James's marks to show for it"],
    ["The people", "A large network of strangers", "A small desk trained to one standard, known by name"],
  ] as [string, string, string][],
  terms: [
    ["Your share", "70% of every booking commission"],
    ["Membership", "US$249 a year, or US$49 a month, no lock-in"],
    ["Your clients", "Yours, always. A firm house policy"],
    ["The house's share", "30%, which funds the Ledger, rate checks, Iggi and James's ongoing vetting"],
  ] as [string, string][],
  tools: [
    { icon: "compass", title: "The founder's method", line: "How James vets a stay, reads a season and files a journey, taught by James." },
    { icon: "key", title: "The Ledger", line: "Plan from vetted stays, reserves, residences, ships and routes, each with a permanent ID." },
    { icon: "star", title: "Your advisor card", line: "A profile and an advisor ID, with the Ledger entries you've vetted or sent travellers to, in green ink." },
    { icon: "route", title: "Iggi at your desk", line: "Coming soon: drafts and answers that cite Ledger entries. You keep the judgment." },
    { icon: "binoculars", title: "Fam trips", line: "See what you sell, inside the Ledger, so your advice carries the weight of having been." },
    { icon: "family", title: "Featured where it counts", line: "Advisor cards on the destination pages where you know the ground." },
  ],
  steps: [
    { n: "01", title: "Apply", line: "Who you are, who you serve, and why you want training, not just an ID." },
    { n: "02", title: "Meet the desk", line: "A conversation, not a funnel. We'd like to know your travellers as well as you do." },
    { n: "03", title: "Train on the method", line: "The founder's course, the Ledger and your first fam trip." },
    { n: "04", title: "Quote the Ledger", line: "Plan and book with the house behind every answer you give." },
  ],
  jamesNote: "If you want to stand out in this trade, not just work in it, write to the desk. I'll teach you what took me forty-four years to learn, minus most of the wrong turns.",
  faqs: [
    { q: "How does the 70% commission split work?", a: "You keep 70% of the booking commission you earn. Membership is US$249 a year or US$49 a month. The house's 30% funds the Ledger, rate checks, Iggi and James's ongoing vetting." },
    { q: "Do I need experience to join?", a: "No. New advisors are trained on the method itself. Experienced advisors are just as welcome; the Ledger gives your expertise an edge you can prove." },
    { q: "Is James Wild & Co a host agency?", a: "Yes. It's a wholesaler and a hybrid host agency, so advisors can plan and book under the house with its relationships and Ledger behind them." },
    { q: "Can I keep my own clients and brand?", a: "Yes, and that policy is firm: your clients stay yours, always. You plan and book through the house and show your own advisor card and profile." },
    { q: "Do you book safaris too?", a: "Yes. African safaris run through Wild & Co Safaris, the house's safari booking platform, with partner guides on the ground." },
  ],
};

// ── /partners ───────────────────────────────────────────────────────────────
export const PARTNERS = {
  eyebrow: "For the trade · Partners",
  title: "Partner With a Purpose",
  subtitle: "Distinctive stays, thoughtful hosts and journeys that give travellers a deeper connection to the places they visit.",
  answer:
    "James Wild & Co partners with hand-selected lodges, resorts, safari reserves, private homesteads and small vessels that share its care for nature, community and meaningful hospitality. Partners are presented in the Ledger, in destination guides and suggested routes, to advisors and travellers who suit them. A place earns its entry by being vetted; partnership never buys a mark.",
  aims: [
    { title: "Bring thoughtful partners into view", line: "Introduce places and operators whose hospitality, character and care for their surroundings deserve to be understood." },
    { title: "Help travellers choose well", line: "Explain what makes each place distinctive, who it suits and what to consider before visiting." },
    { title: "Support communities and culture", line: "Recognise partners who involve local people, respect tradition and create opportunity through work, learning and local enterprise." },
    { title: "Encourage care for nature", line: "Share the specific work partners do to protect wildlife, care for habitats and use resources responsibly." },
    { title: "Value the people behind the welcome", line: "Look past the guest experience to how an operation supports its staff, guides and hosts." },
    { title: "Inspire longer, slower stays", line: "Encourage travellers to slow down, stay curious and give a place time to reveal itself." },
  ],
  founderNote: "I want the places we recommend to mean something to the people who visit and to the people who call them home. That begins with knowing our partners, asking thoughtful questions and giving travellers good reasons to stay a little longer.",
  oneHouse: [
    "The House of James Wild & Co brings the Ledger, specialist journeys and partner relationships together under one approach.",
    "Each approved stay and vessel is hand-selected, the reasons for its inclusion recorded, and it's connected with travellers whose interests it serves. Wild & Co Safaris carries the same approach into African safari planning.",
  ],
  presents: [
    "A considered Ledger entry, with your story told properly.",
    "Inclusion in relevant destination guides and suggested routes.",
    "Founder interviews, field notes and selected storytelling.",
    "Advisor education and product introductions.",
    "Agreed campaigns and longer-stay collaborations.",
  ],
  wan: { mark: "Worth Another Night™", title: "Another Day Makes Room for a Conversation, a Discovery, a Deeper Understanding.", line: "With selected partners we shape experiences, inclusions or stay benefits that make extending the journey worthwhile. The traveller sees a choice, three nights or four, framed around what the extra night rewards. Nothing about it should feel like an upsell." },
  resources: [
    { title: "The House overview", line: "The collection, the thinking and the ways to work together." },
    { title: "Our selection standard", line: "What we consider before a place joins the Ledger." },
    { title: "Brand and partner resources", line: "Approved materials for working together." },
  ],
  closing: { title: "Tell Us About Your Place", lines: ["Who makes it special? What do you care for? What will a traveller understand after time with you?", "We'd like to hear your story."] },
  faqs: [
    { q: "How does a property become a James Wild & Co partner?", a: "Tell us about your place. If it suits the house, James or a trusted partner visits or reviews it, and if it's vetted it's filed in the Ledger under its own ID. Partnership terms are agreed separately." },
    { q: "Can partnership buy a founder stamp?", a: "No. Marks record how the house knows a place, with a date. They're earned by a visit or a named partner's review, never by an agreement." },
    { q: "Do you work with small vessels and private homes?", a: "Yes: lodges, resorts, safari reserves, private homesteads, family residences and small ships and yachts." },
  ],
};
