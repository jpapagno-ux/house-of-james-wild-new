// Sample ALIIKAI VOYAGE content for the Ledger Edit reskin — the CRUISE /
// VESSEL template. Verbatim snapshot of the live studio records: Stay
// STY-2026-882896 (property_slug aliikai-voyage, Lane C, cruise category)
// plus its 8 room records (7 cabins + the whole-yacht charter line).
// Features and Experiences collections hold NO linked records for Aliikai —
// the filed features-content / adventures-experiences richtext lists are
// the on-file source and are rendered verbatim. Founder note, FAQs,
// best_for, coordinates, address and airport fields are empty on file and
// are omitted, not invented.

const CDN = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const SAMPLE_ALIIKAI = {
  name: "Aliikai Voyage",
  ledgerId: "STY-2026-882896",
  subtitle: "Sail Beyond the Ordinary – Discover Indonesia's Wild Beauty Aboard Aliikai",
  introQuote:
    "An unparalleled experience that fully immerses guests in exquisite nature, culture, and unique one of kind adventures.",
  meta: [
    ["Vessel ledger", "STY-2026-882896"],
    ["Continent", "Asia"],
    ["Country", "Indonesia"],
    ["The yacht", "40m wooden yacht · 7 cabins · 3 decks"],
    ["Crew", "13 crew for near one-to-one care"],
    ["Sailed waters", "Raja Ampat · Komodo · Alor · Banda Sea"],
    ["Booking", "Shared cabin or whole-yacht charter"],
  ],
  hero: {
    url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/c99dcfd88_5c03b83a1_684789da9f8783e259dcc5c8_Aliikai-Boat-Exterior3.webp",
    alt: "Aliikai under sail: the 40-metre wooden phinisi yacht at anchor in Indonesian waters",
  },
  rate: {
    fromPrice: 690,
    currency: "US$",
    basis: "Per cabin, per night · shared voyage",
    note: "Live registry rates, per cabin. Voyages are never 'on request': sail by the cabin or take the yacht whole — the House re-verifies every rate at enquiry and books directly with the vessel.",
  },
  charter: {
    title: "Take the Yacht Whole",
    text: "Book the entire yacht — US$9,900 per night + 11% tax, for up to 14 passengers.",
    note: "Filed rate line for the private-voyage record · the full yacht, crewed by 13, taken as one.",
  },
  cabins: [
    {
      name: "Owner's Cabin · Fam", filing: "Owner's Cabins with King Size Beds & Private Terraces (Fam Cabin on the main deck)",
      deck: "Main deck", bed: "King Bed", sleeps: 2, fromRate: 950,
      image: `${CDN}/68478e85beb17e1fa828d1d7_Aliikai-Fam-Patio.webp`,
      alt: "Aliikai Fam Cabin: owner's cabin with private terrace on the main deck",
    },
    {
      name: "Owner's Cabin · Kei", filing: "Owner's Cabins with King Size Beds & Private Terraces (Kei Cabin on the upper deck)",
      deck: "Upper deck", bed: "King Bed (convertible to twin beds)", sleeps: 4, fromRate: 950,
      image: `${CDN}/68478e853a2462ccf6cc750c_Aliikai-Kei-Patio.webp`,
      alt: "Aliikai Kei Cabin: owner's cabin with private terrace on the upper deck",
    },
    {
      name: "Oceanview Cabin · Savu", filing: "Oceanview Cabins with Windows with King Size Beds (Savu on the upper deck)",
      deck: "Upper deck", bed: "King Bed", sleeps: 2, fromRate: 810,
      image: `${CDN}/68478e8505301fb963e32aca_Aliikai-Savu_Koon-Bedroom.webp`,
      alt: "Aliikai Savu Cabin: oceanview cabin with windows and king bed on the upper deck",
    },
    {
      name: "Oceanview Cabin · Koon", filing: "Oceanview Cabins with Windows with King Size Beds (Koon on the upper deck)",
      deck: "Upper deck", bed: "King Bed", sleeps: 2, fromRate: 810,
      image: `${CDN}/68478e8505301fb963e32aca_Aliikai-Savu_Koon-Bedroom.webp`,
      alt: "Aliikai Koon Cabin: oceanview cabin with windows and king bed on the upper deck",
    },
    {
      name: "Oceanview Cabin · Asmat", filing: "Oceanview cabin with portholes (Asmat Cabin on the lower deck)",
      deck: "Lower deck", bed: "Queen bed and one extra sofa bed", sleeps: 3, fromRate: 690,
      image: `${CDN}/68478e85895801246824bf2b_Aliikai-Asmat-Bedroom.webp`,
      alt: "Aliikai Asmat Cabin: oceanview cabin with portholes on the lower deck",
    },
    {
      name: "Oceanview Cabin · Dayak", filing: "Oceanview cabin with portholes (Dayak Cabin on the lower deck)",
      deck: "Lower deck", bed: "Queen Bed", sleeps: 2, fromRate: 690,
      image: `${CDN}/68478e85f1b8c50f5e5641bb_Aliikai-Abui_Dayak-Bedroom.webp`,
      alt: "Aliikai Dayak Cabin: oceanview cabin with portholes on the lower deck",
    },
    {
      name: "Oceanview Cabin · Abui", filing: "Oceanview cabin with portholes (Abui Cabin on the lower deck)",
      deck: "Lower deck", bed: "Queen Bed", sleeps: 2, fromRate: 690,
      image: `${CDN}/68478e85f1b8c50f5e5641bb_Aliikai-Abui_Dayak-Bedroom.webp`,
      alt: "Aliikai Abui Cabin: oceanview cabin with portholes on the lower deck",
    },
  ],
  ship: {
    eyebrow: "The Ship",
    title: "Authentic Indonesian",
    intro: "With Aliikai, indigenous meets modern in style. Sail to Raja Ampat, Komodo Island, Alor, Banda Sea or try them all in a tailored, fully custom voyage!",
    body: "Aliikai reflects Indonesia's boat-building heritage with a modern barefoot luxury style. Initially built in the small village of Bulukumba, South Sulawesi. 3 years of meticulous craftsmanship and a dozen carpenters completed the design. Built with the strongest Ironwood from Sulawesi, Aliikai has 2 masts and 7 sails, totaling a sailing area of 450 sqm. The dining area merges wonderfully with the main lounge and bar, which give way to the fabulous al fresco deck. Higher up you'll find a 60 sqm sundeck for sun-bathing or stargazing, as well as the 'zen' roof for yoga or simply to admire Indonesia's stunning backdrop.",
  },
  features: {
    eyebrow: "Filed features",
    title: "The Yacht's Conveniences.",
    bullets: [
      "Intimate social lounges indoor + alfresco.",
      "Ventilated camera & dive prep room.",
      "12–14 crew for near one-to-one care.",
      "Eco-sourced gourmet Indonesian cuisine.",
      "Expansive decks & daybeds for relaxation.",
      "Private charter or shared cabin options.",
    ],
  },
  adventures: {
    eyebrow: "Adventures on file",
    title: "What the Voyage Programs.",
    bullets: [
      "Expert-guided scuba & snorkeling with Nitrox.",
      "Komodo Dragon trekking & UNESCO island exploration.",
      "Hidden-waterfall hikes & volcano walks.",
      "Kayak, paddle-board, water-ski adventures.",
      "Cultural village visits & birdwatching.",
      "On-deck cinema, yoga, Balinese massages under the stars.",
    ],
  },
  onlyHere: [
    "Fully custom itinerary — the route is yours to draw.",
    "Shared or private voyage.",
    "Multiple itineraries; combines well with land stays in Bali or Sumba and beyond.",
  ],
  whyStayHere: {
    eyebrow: "Why this vessel is in the ledger",
    title: "Sustainable Luxury at Sea",
    subtitle: "Discover Indonesia's Heart with Intention",
    paragraphs: [
      "Aliikai is ideal for travelers yearning for deeper immersion. Couples seeking intimacy & romance, families bonding over shared adventure, solo journeyers craving self-discovery, and eco-minded guests celebrating marine conservation.",
    ],
    image: `${CDN}/68aa08f275bc491f7ed20045__oeQfU8o8.jpeg`,
    imageAlt: "Aliikai Voyage: the wooden yacht's sailing rig and decks against the Indonesian sea",
  },
  gallery: [
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/a47971df4_40597c877_684789da9f8783e259dcc5c8_Aliikai-Boat-Exterior3.webp", alt: "Aliikai: the wooden yacht under way at sea" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/663ff1fa8_9292f590c_68478d72ca1b0e7dd49eba5_Aliikai-Boat-Exterior2.webp", alt: "Aliikai: exterior profile of the twin-masted phinisi" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/7fe26266f_4547375ec_68478e851ae94600ba894a25_Aliikai-Boat-Deck.webp", alt: "Aliikai: al fresco deck lounges and daybeds" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/7b472f750_02bd201fb_68478de58f16779a33744f60_Aliikai-Boat-InnerDeck.webp", alt: "Aliikai: inner deck merging dining, lounge and bar" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/9612d0e91_c108a8168_68478e85dad1c52ab7a8006d_Aliikai-Boat-Upperdeck.webp", alt: "Aliikai: upper deck with the 60 sqm sundeck" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/67789976d_8a8d1e09b_68478e85f1b8c50f5e5641bb_Aliikai-Abui_Dayak-Bedroom.webp", alt: "Aliikai: Abui and Dayak oceanview cabins on the lower deck" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/d54169fcc_458a9b3dc_68478e85895801246824bf2b_Aliikai-Asmat-Bedroom.webp", alt: "Aliikai: Asmat cabin bedroom with portholes" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/4ea097ffa_9206b236f_68478e85b6328ec3218e5d2d_Aliikai-Fam-Bedroom.webp", alt: "Aliikai: Fam owner's cabin bedroom" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/8270c3781_8dbf38a8_68478e85beb17e1fa828d1d7_Aliikai-Fam-Patio.webp", alt: "Aliikai: Fam cabin private terrace on the main deck" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/843049283_df9953f33_68478e850ae3d356bb578ddd_Aliikai-Kei-Bedroom.webp", alt: "Aliikai: Kei owner's cabin bedroom" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/b6a79d483_dec6ec794_68478e853a2462ccf6cc750c_Aliikai-Kei-Patio.webp", alt: "Aliikai: Kei cabin private terrace on the upper deck" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/ed9bac6ae_f0ff40cfb_68478e8505301fb963e32aca_Aliikai-Savu_Koon-Bedroom.webp", alt: "Aliikai: Savu and Koon oceanview cabins with windows" },
  ],
  practical: [
    ["The yacht", "40m wooden phinisi · 2 masts · 7 sails · 450 sqm sailing area"],
    ["Cabins", "7 cabins across 3 decks · sleeps up to 14"],
    ["Crew", "13 crew · 12–14 aboard on voyage"],
    ["Voyage style", "Shared cabin, private cabin or whole-yacht charter · fully custom itineraries"],
    ["Best months", "May – Nov · April–November for Komodo and Alor dry season, October–April for Raja Ampat's calm seas"],
    ["Rates", "From US$690 per cabin, per night · whole yacht US$9,900 per night + 11% tax (up to 14 passengers) · live registry, re-verified at enquiry"],
  ],
};