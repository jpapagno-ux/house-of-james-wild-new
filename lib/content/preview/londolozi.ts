// Sample LONDOLOZI RESERVE content for the Ledger Edit reskin — the
// AFRICA-ONLY RESERVE template. Every value is a verbatim snapshot of the
// live studio records: Stay STY-2026-115702 (Londolozi Reserve, reserve
// parent, is_collection_page) and AfricanReserve RSV-2026-000007, plus the
// 14 camp/chalet child records filed as Rooms under the parent. Camps
// carry LIVE registry rates — never "on request". No reviews; founder note
// and FAQs are empty on file and are therefore omitted, not invented.

export const SAMPLE_LONDOLOZI = {
  name: "Londolozi Reserve",
  ledgerId: "RSV-2026-000007",
  subtitle: "Sabi Sand Game Reserve · South Africa",
  introQuote:
    "The camps & villas of the Londolozi Reserve offer a harmonious blend of heritage and luxury, providing guests with an authentic safari experience deeply rooted in family tradition and a profound connection to the land.",
  meta: [
    ["Reserve ledger", "RSV-2026-000007"],
    ["Continent", "Africa"],
    ["Country", "South Africa"],
    ["Location", "Sabi Sand Game Reserve"],
    ["Filed as", "4 luxury camps · Private Granite Suites · private family villas"],
    ["Rates", "Live registry · from US$1,386 p/p night"],
  ],
  hero: {
    // The hero_image_url field on file is corrupted (truncated filename), so
    // the reserve hero uses the first CMS gallery plate — an existing image.
    url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/4cedca427_465cee065_683f57ebc8ac68f06acb51dc_Londolozi-Varty-Camp-Exterior_20_1_.jpg",
    alt: "Londolozi Reserve: thatched camp buildings beneath trees along the Sand River, Sabi Sand",
  },
  overview: [
    "Camps and villas thoughtfully cater to both families and couples, featuring private heated plunge pools, open-air bathtubs, and interconnected suite options. Designed with a strong focus on togetherness, each space reflects Londolozi's deep commitment to family and community.",
  ],
  rateLine:
    "Live registry rates, per person per night — the lowest camp rate on file is US$1,386 (Varty Camp). Re-verified at enquiry, never on request.",
  camps: [
    {
      name: "Founders Camp",
      from: 1692,
      units: "River-view chalets · family suites on file",
      summary: "A family-friendly luxury safari lodge set under ancient ebony trees — river-view chalets and unforgettable Big Five game drives, ideal for families, couples, and multi-generational travelers.",
    },
    {
      name: "Varty Camp",
      from: 1386,
      units: "Timber-decked chalets with private pools",
      summary: "The original heart of Londolozi, where a century-old campfire still burns in tribute to the land's legacy. Interleading rooms welcome children aged six and up.",
    },
    {
      name: "Tree Camp",
      from: 2385,
      units: "6 suites",
      summary: "Six suites under a canopy of trees — the quiet, romantic beat of the reserve.",
    },
    {
      name: "Pioneer Camp",
      from: 2385,
      units: "3 exclusive suites",
      summary: "Just three exclusive suites with private plunge pools, outdoor showers and glass walkways — secluded, ultra-luxury, with river views.",
    },
    {
      name: "Private Granite Suites",
      from: 3000,
      units: "3 suites",
      summary: "The reserve's most private suite camp — exclusive-use, pool deck over the rock.",
    },
    {
      name: "Private Villas · Pioneer Homestead",
      from: null,
      units: "Exclusive-use villa · 3 suites",
      summary: "Private and exclusive use of a home in Africa — very popular for groups of friends and multi-generational families. Whole-property rate filed with the House desk.",
    },
  ],
  adventures: {
    eyebrow: "Adventures on file",
    title: "What the Reserve Programs.",
    bullets: [
      "Family & generational experiences",
      "Safari game drives — Big 5",
      "Conservation & eco mindfulness",
      "Photo Lab",
      "Wellness & health",
      "Honeymoon & couples",
    ],
    image: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/ad7ad3bb1_30b0d02f0_683f52d3ee555fbcf5739797_Londolozi-Tree-Camp-View_20_1_.jpg",
    imageAlt: "Londolozi Reserve: views over the bush from Tree Camp at golden hour",
  },
  onlyHere: {
    eyebrow: "Only Here",
    title: "Impossible to Recreate Elsewhere.",
    paragraphs: [
      "At Londolozi, safari is a journey of self-discovery, offering unmatched leopard sightings, soulful wellness experiences, and camps with unique character. Rooted in a legacy of conservation and storytelling, each stay supports sustainability and empowers local communities. Each of the distinctive, soulful camps has its own unique vibe, thoughtfully designed to reflect the rhythm of the land.",
    ],
    image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/683f465a9e39c1540516b179_Londolozi-Founders-Camp-Main-Area-Long-Shot-2-Elsa-Young-Low-Res-copy.jpg",
    imageAlt: "Londolozi Founders Camp: the main lounge area under ancient ebony trees",
  },
  whyStay: {
    eyebrow: "Why this reserve is in the ledger",
    title: "A Spiritual Return to the Wild — An Original",
    paragraphs: [
      "Londolozi is not just a safari destination. It's a spiritual return to the wild, a sanctuary where nature, luxury, and legacy converge to offer something truly rare: deep, personal transformation. You're not just witnessing the wild. You're becoming part of it.",
    ],
    image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/683f66f6cd0542c4fa1b8841_Londolozi-Private-Granite-Suite-PoolExteriorView%20(1).jpg",
    imageAlt: "Londolozi Private Granite Suites: plunge pool deck over the rock above the Sand River",
  },
  sustainability: {
    eyebrow: "Londolozi · Sustainability",
    titleA: "Guardians of the Land",
    titleB: "A Deep Commitment to Sustainability",
    intro: "Eco-conscious luxury in the heart of the Sabi Sands — at Londolozi, sustainability is not an initiative. It's a way of life.",
    body: "As one of Africa's first certified ecotourism destinations, Londolozi leads the way in regenerative tourism, where luxury meets responsibility and every stay contributes to the health of the land, the wildlife, and the local communities. Once degraded farmland, Londolozi has been restored into thriving wilderness over the past 90+ years. Game drives are led by trained naturalists and trackers who prioritize animal welfare, maintain safe distances, and avoid stress to wildlife. All five camps operate with solar power systems, reducing reliance on fossil fuels.",
  },
  gallery: [
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/39ba130c1_e1f290e07_683f66f6d152ed7b9b2a36ba_Londolozi-Private-Granite-Suite-PoolDeck_20_1_.jpg", alt: "Londolozi Private Granite Suites: pool deck above the river" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/cdf86ead6_674f9b2b6_683f66f6da1144f18b9e502c_Londolozi-Private-Granite-Suite-Bar_20_1_.jpg", alt: "Londolozi Private Granite Suites: the bar" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/3b33103f1_66aced96b_683f66f6a53520d30355c90d_Londolozi-Private-Granite-Suite-Mainroom_20_1_.jpg", alt: "Londolozi Private Granite Suites: main room interior" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/df5a72e77_3e04e1114_683f598ca9efb65bff1744c3_Londolozi-Varty-Camp-Superior-Chalet-Room_20_1_.jpg", alt: "Londolozi Varty Camp: superior chalet room" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/2cfca10df_198af2b8e_683f598ca9efb65bff1744cd_Londolozi-Varty-Camp-Standard-Chalet-Pool_20_1_.jpg", alt: "Londolozi Varty Camp: standard chalet with private pool" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/f19fc5650_b33e4a4b1_683f5800e8d275cab4129570_Londolozi-Varty-Camp-Mainarea_20_1_.jpg", alt: "Londolozi Varty Camp: main lounge area" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/82af470e8_1a4b9f7a5_683f57eb380f2d209b717883_Londolozi-Varty-Camp-River-Overlook_20_1_.jpg", alt: "Londolozi Varty Camp: overlook above the Sand River" },
    { url: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/0e1af2e53_f0f9fd16c_683f52aef3f1353dd48897ee_Londolozi-Tree-Camp-Dining_20_1_.jpg", alt: "Londolozi Tree Camp: dining under the canopy" },
  ],
  practical: [
    ["Location", "Sabi Sand Game Reserve · South Africa"],
    ["Coordinates", "-24.801461, 31.498252"],
    ["Nearest airport", "Kruger Mpumalanga International Airport"],
    ["Getting there", "Three major airports serve the Sabi Sands: Kruger Mpumalanga (western sector), Skukuza (southern sector), and Hoedspruit Eastgate (northern sector). Road transfers from any of these airports are arranged with a confirmed reservation."],
    ["Best months", "May – October · dry season, prime safari time. Sparse vegetation and animals at the waterholes make for exceptional sightings — leopard sightings are more frequent."],
    ["Reserve camps", "Founders, Varty, Tree, Pioneer, Private Granite Suites, plus exclusive-use villas"],
    ["Rates", "Live registry per camp · from US$1,386 per person per night · re-verified at enquiry, never on request"],
  ],
};