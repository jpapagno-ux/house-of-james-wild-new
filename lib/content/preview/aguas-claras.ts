// Sample AGUAS CLARAS content for the Ledger Edit reskin reference — the
// sitewide HOTEL-template property page redesign. Every value below is a
// verbatim snapshot of the live CMS record STY-2026-000006 (Aguas Claras,
// category = hotel, Playa Chiquita, Costa Rica): no invented copy, no
// reviews, rates shown as on request. Section-image fields are null in the
// studio record, so the page reuses the hero, the 11 CMS gallery plates and
// the room hero images only.

export const SAMPLE_AGUAS = {
  ledger: {
    id: "STY-2026-000006",
    name: "Aguas Claras",
    category: "hotel",
    tagline: "Artful Caribbean hideaway on Playa Chiquita",
    location: "Playa Chiquita, Puerto Viejo · Costa Rica",
    introQuote: "A soulful Caribbean escape where art, sea and rainforest fold into slow, private days.",
    bestFor: ["honeymoon", "family", "adventure", "luxury", "solo"],
  },
  hero: {
    url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/75a700e59_2519c4d70_67f59e112bea9b8db9f4408a_1_hac_hero.jpg",
    alt: "Aguas Claras — the hotel's tropical beachfront setting on Playa Chiquita, Costa Rica.",
  },
  gallery: [
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/623f3abfa_8f19ce550_67f97e530273fe50b6b7c582_4_hac_carousel-3.avif", alt: "Aguas Claras gallery — bungalow exteriors amid lush gardens." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/d8822aaaf_f1d672c79_67f97e533d937286ae5ea126_4_hac_carousel-1.avif", alt: "Aguas Claras gallery — artist-filled bungalow interiors." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/b63507c3d_3abd23d1d_67f97e534317c8d8339ff492_4_hac_carousel-2.avif", alt: "Aguas Claras gallery — handcrafted furnishings and original artworks." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/5615363d9_960a62e41_6835e605544aed8e2c19bce5_Beach_0060.jpg", alt: "Playa Chiquita — the beach at Aguas Claras' doorstep." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/8745303d9_e9e810600_6835e7103e72084545ff7a02_Coral_0049.jpg", alt: "Coral reef — snorkeling waters off the Caribbean coast." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/fd792ada9_d905149a8_6835e61ccd632780526016f2_Restaurante_0002.jpg", alt: "Papaya restaurant — locally inspired cuisine at Aguas Claras." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/40f2b52ce_6103400fc_6835e297ff2e3b864f9ddef7_Beach_0030.jpg", alt: "Beach days — calm coves for swimming and snorkeling." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/e38dac028_b546c67da_6835e66ca51a698394bb6fdb_Restaurante_0009.jpg", alt: "Papaya restaurant — dining beneath tropical greenery." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/a510d7ed4_cda97a4a7_6835e85d43c72e9535c8459f_Restaurante_0020_20_1_.jpg", alt: "Papaya restaurant — regional flavors and fresh local sourcing." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/a713a2463_6a72a5f07_6835dc42a179c63790ead1c0_Beach_0025.jpg", alt: "Playa Chiquita — the shoreline steps from the bungalows." },
    { url: "https://base44.app/api/apps/6a7932161e9318dca1f24474/files/mp/public/6a7932161e9318dca1f24474/5715af5f6_1ab0dce1b_6835e8d98e514a571bbb2a0d_Restaurante_0031.jpg", alt: "Papaya restaurant — the dining room at Aguas Claras." }
  ],
  staysContent: [
    "Set on the sand of Playa Chiquita, Aguas Claras is an intimate, 12-room retreat that feels handcrafted rather than staged. Curated bungalows and Pavlova suites open to sea breezes and original artworks, each room furnished with locally made pieces and natural materials that reference the region's Afro-Caribbean heritage.",
    "Days here move between the beach and the jungle: morning swims and snorkeling, afternoons in a plunge pool or at the Dalime beach club, and evenings at the Papaya restaurant or around an intimate bonfire. The small scale and attentive team mean experiences are private and easy to personalize, whether you want a guided surf session, a cacao ceremony, or simply a hammock and a book."
  ],
  rooms: [
    {
      name: "Pavlova Suites",
      capacity: 2,
      quantity: 6,
      beds: "King Bed",
      image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/697a91dc97eb2c210886a60b_98e00a9e.avif",
      alt: "Pavlova Suite — king-bed suite styled with original artworks."
    },
    {
      name: "1-Bedroom Bungalow",
      capacity: 2,
      quantity: 3,
      beds: "1 King or 2 Singles",
      sizeSqm: 50,
      image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/697a9168c3b2612b7e56f582_c11dbd2e.avif",
      alt: "1-Bedroom Bungalow — 50 sqm bungalow with handcrafted furnishings."
    },
    {
      name: "2-Bedroom Deluxe Bungalow with Private Plunge Pool",
      capacity: 4,
      quantity: 2,
      beds: "1 King + 2 Singles (convertible to King), 2 en-suite bathrooms",
      sizeSqm: 74,
      plungePool: true,
      image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/697a929bc70c0d6eb25a948b_adcaa839.avif",
      alt: "2-Bedroom Deluxe Bungalow — 74 sqm with a private plunge pool."
    },
    {
      name: "2-Bedroom Luxury Bungalow",
      capacity: 4,
      quantity: 10,
      beds: "1 King-Bed & 2 Single-Beds",
      image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/697a924e070ca9d6530fd4f9_4201db72.avif",
      alt: "2-Bedroom Luxury Bungalow — king and twin beds for families."
    }
  ],
  adventures: {
    eyebrow: "Adventures & Experiences",
    title: "Sea and Forest, Both Filed.",
    paragraphs: [
      "Aguas Claras programs center on the dual rhythm of sea and forest. Mornings might include a guided snorkeling trip or a private surf lesson, while afternoons can be spent biking coastal trails to neighboring coves or exploring jungle trails with a naturalist guide.",
      "Cultural experiences are equally prominent: book an Afro-Caribbean music night, join a cacao ceremony, or take a hands-on cooking and cocktail class that teaches regional flavors. For slow, restorative days the property curates private yoga, breathwork sessions and beach bonfires with live acoustic music."
    ]
  },
  features: {
    eyebrow: "Features",
    title: "What the Rate Carries.",
    body: "Standout features: Papaya restaurant serving locally inspired cuisine, Dalime beach club access, private plunge pools in selected two-bedroom bungalows, a small wellness program with therapies and yoga, daily housekeeping and optional full-board plans, complimentary beach bicycles and free Wi-Fi. The property's small size enables private guiding and tailored itineraries, with sustainable sourcing and community partnerships woven into operations."
  },
  onlyHere: {
    eyebrow: "Only Here",
    title: "Impossible to Recreate Elsewhere.",
    paragraphs: [
      "Aguas Claras specializes in intimate Caribbean moments that feel impossible to recreate at larger resorts: candlelit beach bonfires with local musicians, theme nights centered on regional foodways, and small, private cacao ceremonies led by community practitioners.",
      "The combination of artist-filled bungalows, direct Playa Chiquita access, and curated Afro-Caribbean programming results in singular evenings of live music, locally led cooking classes, and restorative wellness practices framed by ocean and jungle."
    ]
  },
  whyStay: [
    { title: "Direct Beach Access", body: "Aguas Claras sits directly on Playa Chiquita, with immediate access to sand, surf and calm snorkeling coves for morning swims and low-key beach days." },
    { title: "Artful, Local Design", body: "Rooms are individually styled with original artworks and handcrafted furnishings, creating a sense of place that blends contemporary comfort with Caribbean craft." },
    { title: "Intimacy and Privacy", body: "With just twelve rooms, the property feels like a private compound: discreet service, the option for private dining, and two-bedroom bungalows that work well for families or small groups." },
    { title: "Wellness and Culture", body: "A dedicated yoga shala, breathwork and meditation classes, and on-site wellness therapies pair easily with cultural programming such as cacao ceremonies and Afro-Caribbean music nights." },
    { title: "Eco-Conscious Practices", body: "The retreat emphasizes sustainable operations and community engagement, from local sourcing in the Papaya kitchen to practices that reduce waste and support nearby villages." }
  ],
  peoplePlanet: {
    eyebrow: "People + Planet",
    // facts_title is escaped-HTML legacy text; meaning preserved and restyled:
    // "Barefoot Luxury *on the* Caribbean Coast".
    titleA: "Barefoot Luxury",
    titleItalic: "on the",
    titleB: "Caribbean Coast",
    intro: "Adorned by floral water colour paintings to mosaics, this modern bohemian hideaway is for discerning eco-travelers, who seek a delightful eclectic retreat while surrounded by the natural Caribbean beauty.",
    body: "Hidden along Playa Chiquita, Hotel Aguas Claras is an intimate eco-retreat where art, nature, and sustainability come together. As part of the Cayuga Collection, this beachfront sanctuary offers uniquely designed bungalows and suites, lush gardens, and direct beach access. Inviting you to immerse yourself in Costa Rica's wild beauty."
  },
  facts: {
    bestMonths: "May - Nov",
    bestMonthsDescription: "An incredible time of year when the rainforest is at its most abundant with greenery and the best wildlife.",
    coordinates: "9.643245, -82.720328",
    address: "Hotel Aguas Claras 500 Meters South of Villas Caribe Punta Cocles, Puerto Viejo Province of Limon, Costa Rica",
    airportName: "SJO – San Jose International Airport",
    airportDirections: "Schedule a domestic flight to limon or on request, arrange a private driver from SJO or a private helicopter."
  },
  faqs: [
    { question: "What is Aguas Claras known for?", answer: "Aguas Claras is known for its small-scale, art-filled Caribbean retreat on Playa Chiquita, blending eco-luxury with Afro-Caribbean culture, wellness programming, and direct beach access." },
    { question: "How many rooms does Aguas Claras have?", answer: "The property is an intimate 12-room retreat, with a mix of Pavlova suites, one-bedroom bungalows and two-bedroom bungalows including options with private plunge pools." },
    { question: "What is the best time to visit Aguas Claras?", answer: "Aguas Claras is open year-round. Conditions on the Caribbean coast vary seasonally, so contact the team for advice on the best months for surfing, snorkeling or calmer seas." },
    { question: "Is Aguas Claras good for families?", answer: "Yes. The property offers two-bedroom bungalows suitable for families, family-friendly beach activities, and private guiding that can be tailored to multi-generational needs." },
    { question: "How do you get to Aguas Claras?", answer: "Most guests fly into San José or Puerto Limón and then continue by road to Playa Chiquita near Puerto Viejo de Talamanca. The property can help arrange private transfers or advise on rental car routes." },
    { question: "Are meals included at the property?", answer: "Breakfast is included with stays, and full-board or a la carte dining is available through the Papaya restaurant and optional beach club arrangements." },
    { question: "Does Aguas Claras offer wellness and yoga?", answer: "Yes. The property features a yoga shala and offers yoga, meditation and breathwork classes, along with on-site wellness therapies and tailored restorative programs." }
  ]
};