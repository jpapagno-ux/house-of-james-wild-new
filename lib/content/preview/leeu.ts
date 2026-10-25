// Sample GATHERINGS stay-listing content — the Gatherings Ledger format for
// jameswildco.com/<volume>, modeled on the approved gatherings layout. All
// facts and images are pulled from the Leeu House record in the Webflow CMS
// (wildearthstays.com) and the live property page. Read-only design sample;
// copy pending founder sign-off.

export const SAMPLE_GATHERINGS_LEEU = {
  images: {
    hero: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/ae294f982_cc67a2d17_6a230a0a714287d73d103c0e_5fdc91f8cde8e-Header.jpg",
    heroAlt: "The entrance garden at Leeu House, Franschhoek, with mountains above the village",
    plate: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a284118a334b2be1969ffa8_6454e8177ced6-02%20(3).jpg",
    plateAlt: "A quiet corner of Leeu House among the gardens of Franschhoek village",
    gallery: [
      { url: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab165b1384151e5a67745fd_d23fbcdf.avif", alt: "A sitting corner of a Leeu House suite with Cape-inspired interiors" },
      { url: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab164ba384151e5a676db97_f1c58bbd.webp", alt: "Detail of the curated contemporary art collection at Leeu House" },
      { url: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab164c79436504123aeae61_5246d4bb.avif", alt: "The 15-metre swimming pool at Leeu House with mountain views" },
      { url: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab167267c2dc0bb9eb56401_9ad637c0.avif", alt: "The private gardens and terraces of Leeu House in Franschhoek" },
    ],
  },

  meta: {
    entryNo: "No. S-149",
    ledgerId: "STY-2026-000149",
    coordinates: ["33° 54′ 22″ S", "19° 06′ 00″ E"],
    setting: "Winelands · Village",
    evidence: "Founder Favorite · CMS synced",
    region: "Franschhoek, Western Cape, South Africa",
  },

  titleBlock: {
    eyebrow: ["JAMES WILD & CO.", "WINELANDS", "FOUNDER FAVORITE"],
    title: "Leeu House, Franschhoek",
    bestForLine:
      "For travelers who value intimacy over scale: a handful of rooms, personalized service, and South Africa's gourmet capital at the doorstep.",
    partnership: "In partnership with Leeu Collection",
  },

  verdict: {
    eyebrow: "Why it earned its place",
    paragraphs: [
      "A boutique residence a few steps inside Franschhoek village, designed as a peaceful sanctuary: guests wander to restaurants, galleries and wine experiences, then return to an elegant house surrounded by gardens, art and mountain views.",
      "The Cape chapter of a larger journey. Leeu House gives you village life at the doorstep, a refined base of Classic, Deluxe and Terrace rooms, and the Winelands unfolding from the front door.",
      "Only a handful of rooms, one of the most personal houses in the file, and immediate access to the gourmet capital: a sophisticated winelands stay without the formality of a large resort.",
    ],
  },

  jamesNote:
    "The Cape chapter before the safari. I keep Leeu House for the traveler who wants the village at the doorstep and quiet at the door. Two nights among the vines changes how the whole journey reads.",

  actions: {
    note: "Sample actions · wired at build",
    save: "Save to My Folios",
    ask: "Ask Iggi",
    review: "Request Advisor Review",
  },

  manifest: {
    eyebrow: "The Manifest",
    rows: [
      ["Season", "Best October to April · warm, harvest energy, ideal Winelands conditions"],
      ["Rooms", "Classic, Deluxe, Luxury Rooms and a Suite · terraces and private gardens on select rooms"],
      ["Children", "A quiet, adult-leaning boutique house · children by arrangement"],
      ["Last leg", "Cape Town International (CPT) · about 55 minutes by road"],
      ["Water", "15-metre swimming pool with mountain views"],
      ["Rates", "From $765 per night · request a quote"],
    ],
  },

  crossSellManifest: {
    eyebrow: "The Manifest · Planning",
    rows: [
      ["Season", "Best October to April · warm, harvest energy, ideal Winelands conditions"],
      ["Rooms", "Classic, Deluxe, Luxury Rooms and a Suite · terraces and private gardens on select rooms"],
      ["Children", "A quiet, adult-leaning boutique house · children by arrangement"],
      ["Last leg", "Cape Town International (CPT) · about 55 minutes by road"],
      ["Water", "15-metre swimming pool with mountain views"],
      ["Rates", "From $765 per night · request a quote"],
      ["Power", "230V · type M / N"],
      ["Time", "UTC+2 · SAST"],
    ],
  },

  sleepingPlan: {
    eyebrow: "Sleeping plan",
    title: "The rooms at Leeu House",
    note: "Synced from the Stays collection · rates verified in the CMS rate registry · confirm occupancy and bed types with your quote.",
    columns: ["Category", "From rate", "Notes · J.W.", "Book"],
    rows: [
      { name: "Classic Room", rate: 765, currency: "USD", note: "The entry to the house. Classic rooms, king or twin, refined Cape interiors." },
      { name: "Deluxe Room", rate: 815, currency: "USD", note: "A step up in space and finish. The easy choice for a longer village stay." },
      { name: "Classic with Terrace", rate: 940, currency: "USD", note: "A private terrace of one's own, among the gardens." },
      { name: "Deluxe with Terrace", rate: 996, currency: "USD", note: "The most I would give up: terrace, gardens and mountain air." },
    ],
  },

  planning: {
    eyebrow: "Planning",
    rows: [
      ["Best season", "October to April · summer and early autumn, harvest February to March"],
      ["Last leg", "Cape Town International (CPT) · approx. 68 km, around 55 minutes by car"],
      ["Power", "230V · type M / N"],
      ["Time", "UTC+2 · SAST"],
      ["Children", "Adult-leaning boutique house · children by arrangement"],
      ["Water", "15-metre pool with mountain views"],
    ],
  },

  practical: {
    eyebrow: "The practical ledger",
    title: "How the stay works",
    reviewed: "Facts last reviewed · Oct 2026 · confirm current rates & policies with us",
    rows: [
      ["Plan", "Bed and breakfast · The Conservatory dining on the house"],
      ["Book via", "Wild & Co Gatherings · we book the rooms and plan the Cape Winelands days"],
      ["Check-in", "From 14:00 · check-out 11:00 (confirm with quote)"],
      ["Children", "Children by arrangement · the house keeps an adult-leaning pace"],
      ["Rates", "From $765 per night (USD, per room)"],
    ],
    ratesPolicy:
      "We publish a price only with its currency, rate basis, occupancy, dates, exclusions and source. Until then, rates are quoted for your dates.",
    included: ["Complimentary wine tasting at the Great Heart Wine Boutique", "Curated contemporary art collection throughout the house", "Parking in the village"],
    notIncluded: ["Dinners beyond The Conservatory plan", "Spa treatments", "Flights and road transfers"],
    includedNote: "Sample lines · confirm inclusions with the house at quote",
  },

  formula: {
    eyebrow: "The Gathering Formula",
    title: "How it measures up",
    intro: "Six of six, each with a recorded note from the house review.",
    checks: [
      { n: "01", label: "Room to gather", note: "Classic to Deluxe with Terrace rooms; a Suite and exclusive-use option for the whole party." },
      { n: "02", label: "A day for every age", note: "Wine tastings, galleries and village wandering steps away." },
      { n: "03", label: "Water within reach", note: "The 15-metre pool with mountain views, set in the gardens." },
      { n: "04", label: "Country at the door", note: "Vineyards, mountains and the Winelands from the front step." },
      { n: "05", label: "A resort behind you", note: "Leeu Spa, the Conservatory dining room and the wine boutique on hand." },
      { n: "06", label: "Worth returning to", note: "The Winelands make the safari a whole journey." },
    ],
  },

  evidence: {
    eyebrow: "The evidence",
    title: "How we know",
    intro: "Each line says what was done, when, and what it covers. A past review does not confirm current rates or policies.",
    rows: [
      { label: "Founder Favorite", meta: "Per the Founder's Fave record on Wild Earth Stays", body: "Badged a founder favorite in the Wild Earth Stays collection. An editorial judgement, not a verification of current facts, rates or policies.", ref: "Ledger STY-2026-000149" },
      { label: "CMS Record Verified", meta: "Synced from the Webflow Properties collection · Oct 2026", body: "Facts, imagery, adventures, features and room rates pulled from the live wildearthstays.com CMS record and property page.", ref: "Webflow item 6a188efb22caeb249ea3df29" },
    ],
    footer: "First recorded · Aug 2026 · Facts last reviewed · Oct 2026",
  },

  experiences: {
    eyebrow: "Recorded from experience",
    title: "At the house and in the village",
    items: [
      { name: "Leeu Spa Escape", meta: "Adults · Year-round", body: "Restorative treatments inspired by African botanicals and Pinotage-based therapies.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230e8c95d0d985a14cb39f_5b55b54ca1d14-Leeu%20Spa%20Double%20Treatment%20Room_01.jpg", alt: "The double treatment room at Leeu Spa, Leeu House" },
      { name: "Conservatory Dining", meta: "Resident guests · Daily", body: "Relaxed dining showcasing local produce and Cape flavors in the conservatory.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230ebf12b131d77c06c632_67ac4965a0f61-Leeu%20Collection%20-%20Leeu%20House%20-%20Convservatory%20(1)%402x.jpg", alt: "The Conservatory dining room at Leeu House, Franschhoek" },
      { name: "Great Heart Wine Tasting", meta: "Adults · On request", body: "An intimate tasting featuring the staff-owned Great Heart Wines project.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230deb599bd2e2270ddf6a_67988a50344c7-Great%20Heart%20Wine%20Boutique%20(1)%402x.jpg", alt: "The Great Heart Wine Boutique at Leeu House" },
      { name: "Art & Sculpture Discovery", meta: "All ages · Year-round", body: "A curated contemporary art collection integrated throughout the property.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230eea43d3f46328efe55c_5b60305101d61-Ghandi.jpeg", alt: "A sculpture from the curated art collection at Leeu House" },
      { name: "Cape Winelands Exploration", meta: "All ages · Seasonal", body: "Venture into the surrounding vineyards and mountain landscapes.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230f21054cca5dee1401df_67988a502f0a4-Great%20Heart%20Wine%20Boutique%20(2)%402x.jpg", alt: "The Winelands landscape around Leeu House, Franschhoek" },
      { name: "Franschhoek Village Wandering", meta: "All ages · Year-round", body: "Galleries, boutiques, cafés and award-winning restaurants steps away.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230e5b3a50b2f9a780d40c_6454e86d699b3-03%20(3).jpg", alt: "Franschhoek village streets a short walk from Leeu House" },
    ],
  },

  dining: {
    eyebrow: "At the table",
    question: "Where do guests eat at Leeu House, Franschhoek?",
    answer:
      "Guests at Leeu House eat at The Conservatory, the house's own dining room serving relaxed Cape cooking from local produce, and walk to Franschhoek's celebrated restaurants a few minutes away. Wine is in the house: the Great Heart Wine Boutique pours a complimentary tasting with every stay.",
    card: {
      kind: "Restaurant",
      name: "The Conservatory",
      location: "Leeu House, Franschhoek",
      when: "Breakfast, lunch and dinner",
      who: "Resident guests",
      body: "The house's own dining room, relaxed and Cape-rooted. The easy table for the first night of the Winelands chapter.",
      table: ["Locally sourced Cape produce", "Great Heart Wines"],
      image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6a230ebf12b131d77c06c632_67ac4965a0f61-Leeu%20Collection%20-%20Leeu%20House%20-%20Convservatory%20(1)%402x.jpg",
      alt: "A table set in the Conservatory dining room at Leeu House",
    },
  },

  liveRates: {
    eyebrow: "Live rates",
    heading: "Today's rates, live from the booking desk",
    sourceNote: "Pulled live from the Wild Earth Stays booking engine, built by Tag Albie. Rates below are for the sample search shown.",
    search: {
      check_in: "14 October 2026",
      check_out: "15 October 2026",
      guests: "1 guest",
      rooms: "1 room",
      currency: "USD",
    },
    engine_url:
      "https://book.wildearthstays.com/en/property/leeu-estates-resorts?checkIn=2026-10-14&checkOut=2026-10-15&adults=1&children=0&infants=0&currency=USD&rooms=1",
    plan_name: "Best Available Rate",
    plan_note: "Flexible days. Price per night, exclusive of taxes and fees.",
    rooms: [
      { name: "Manor House Suite", sleeps: "Sleeps 1-2", bed: "1 queen bed", rate: "$3,150.11" },
      { name: "Fynbosch Cottage", sleeps: "Sleeps 1-2", bed: "1 queen bed", rate: "$3,937.64" },
    ],
    promo: {
      name: "Length of Stay Discount",
      statement: "15% discount for a stay of 3 nights or more",
      rows: [
        { name: "Manor House Suite", rate: "$2,677.59" },
        { name: "Fynbosch Cottage", rate: "$3,346.99" },
      ],
    },
    cta: "Check live rates for your dates",
    footnote: "Rates refresh with the engine's dynamic pricing and change with dates, occupancy and season. Our team confirms every quote in the Ledger before anything is booked.",
  },

  liveBand: {
    eyebrow: "Live rates · Tag Albie engine",
    heading: "Today's rate, live from the booking desk",
    intro: "The figure below is the booking engine's own current price for your dates, refreshed through our rate desk with a 15-minute cache. The sleeping plan above keeps its published baseline; the live desk answers 'what will it cost on my dates'.",
    updateLabel: "Update search",
    ctaLabel: "Check live rates",
    footnote: "Dynamic pricing changes with dates, occupancy and season.",
    errorNote: "The booking desk could not be reached.",
  },

  allRooms: {
    eyebrow: "Book a room · Tag Albie engine",
    title: "Choose your room",
    intro: "Every room at the house, offered in one ledger. Rooms with a live mark are priced by the booking engine for your exact dates, refreshed through our rate desk with a 15-minute cache; the others carry their published baseline and are quoted for your dates before anything is confirmed.",
    updateLabel: "Update search",
    bookLabel: "Select room",
    quoteLabel: "Select room",
    checkoutLabel: "Check out",
    refreshStartLabel: "Refresh the rates & start over",
    moreLabel: "What's included and excluded",
    lessLabel: "Hide inclusions",
    includedLabel: "What's included",
    excludedLabel: "What's excluded",
    footnote: "Prices refresh with the engine's dynamic pricing and change with dates, occupancy and season. Rooms without a live mark are priced from the CMS rate registry; our team confirms every quote in the Ledger before anything is booked.",
    errorNote: "The booking desk could not be reached, showing baseline rates.",
    fallbackImage: "https://media.base44.com/images/public/6a7932161e9318dca1f24474/ae294f982_cc67a2d17_6a230a0a714287d73d103c0e_5fdc91f8cde8e-Header.jpg",
    rooms: [
      { name: "Classic Room", baseline: 765, bed: "King or twin", sleeps: "Sleeps 1-2", note: "The entry to the house. Classic rooms, king or twin, refined Cape interiors.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab165b1384151e5a67745fd_d23fbcdf.avif", alt: "A sitting corner of a Leeu House suite with Cape-inspired interiors",
        included: ["Bed-and-breakfast plan", "Complimentary Great Heart wine tasting per stay", "WiFi and the house art collection", "House concierge for Gatherings planning"],
        excluded: ["Dinner and beverages beyond breakfast", "Spa treatments", "Flights and transfers", "Taxes and fees, quoted at confirmation"] },
      { name: "Deluxe Room", baseline: 815, bed: "King or twin", sleeps: "Sleeps 1-2", note: "A step up in space and finish. The easy choice for a longer village stay.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab164ba384151e5a676db97_f1c58bbd.webp", alt: "Detail of the curated contemporary art collection at Leeu House",
        included: ["Bed-and-breakfast plan", "Complimentary Great Heart wine tasting per stay", "WiFi and the house art collection", "House concierge for Gatherings planning"],
        excluded: ["Dinner and beverages beyond breakfast", "Spa treatments", "Flights and transfers", "Taxes and fees, quoted at confirmation"] },
      { name: "Classic with Terrace", baseline: 940, bed: "King or twin", sleeps: "Sleeps 1-2", note: "A private terrace of one's own, among the gardens.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab164c79436504123aeae61_5246d4bb.avif", alt: "The 15-metre swimming pool at Leeu House with mountain views",
        included: ["Bed-and-breakfast plan", "Complimentary Great Heart wine tasting per stay", "Private terrace and garden access", "House concierge for Gatherings planning"],
        excluded: ["Dinner and beverages beyond breakfast", "Spa treatments", "Flights and transfers", "Taxes and fees, quoted at confirmation"] },
      { name: "Deluxe with Terrace", baseline: 996, bed: "King or twin", sleeps: "Sleeps 1-2", note: "The most I would give up: terrace, gardens and mountain air.", image: "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b/6ab167267c2dc0bb9eb56401_9ad637c0.avif", alt: "The private gardens and terraces of Leeu House in Franschhoek",
        included: ["Bed-and-breakfast plan", "Complimentary Great Heart wine tasting per stay", "Private terrace and garden access", "House concierge for Gatherings planning"],
        excluded: ["Dinner and beverages beyond breakfast", "Spa treatments", "Flights and transfers", "Taxes and fees, quoted at confirmation"] },
    ],
  },

  deeperAfrica: {
    eyebrow: "James Wild & Co. Safaris",
    heading: "A deeper Africa journey?",
    ask: "A Gatherings stay can be the whole trip, or the opening chapter. If the Winelands leave you wanting the wilder country beyond them, we build that journey too, under the same house, with the same hand.",
    route: {
      eyebrow: "Route 01 · The Grand Traverse",
      title: "Wine. Wildlife. Wilderness.",
      brief: "A 13-night Private Guided journey from Cape Town and Franschhoek to the private wildlife country of Sabi Sands, the elephant corridors of Linyanti and the waterborne silence of the Okavango Delta. You travel with your own guide and vehicle throughout, and this house is the second stay of the route. Built back to front on purpose: a city, a vineyard, then the bush, then the water. Crafted and tested by House of James Wild & Co in May 2026.",
      stats: [
        { value: "13", label: "Nights" },
        { value: "5", label: "Distinct stays" },
        { value: "2", label: "Countries" },
        { value: "Private", label: "Guided" },
      ],
      stages: [
        { nights: "3 nights ·", place: "Cape Cadogan, Cape Town" },
        { nights: "1 night ·", place: "Leeu House, Franschhoek", isLeeu: true },
        { nights: "3 nights ·", place: "Lion Sands Ivory Lodge, Sabi Sands" },
        { nights: "3 nights ·", place: "DumaTau, Linyanti" },
        { nights: "3 nights ·", place: "Qorokwe, Okavango Delta" },
      ],
      link: "https://wildcosafaris.vercel.app/grand-traverse/wine-wildlife-wilderness/",
      cta: "See the journey",
    },
    journeys: [
      {
        key: "private_guided",
        tag: "Journey type 01",
        title: "Private Guided",
        intro: "Your own guide and your own vehicle, first day to last. The journey moves at your pace, not the camp's schedule. This is how the Grand Traverse runs.",
        link: "https://wildcosafaris.vercel.app/grand-traverse/wine-wildlife-wilderness/",
      },
      {
        key: "classic",
        tag: "Journey type 02",
        title: "Classic",
        intro: "Expertly planned by us, hosted on the ground by the camps' own guiding teams. Shared vehicles, beautifully balanced pacing and exceptional value.",
        link: "https://wildcosafaris.vercel.app/journeys/classic/",
      },
      {
        key: "in_the_field",
        tag: "Journey type 03",
        title: "In The Field",
        intro: "Mobile, remote and elemental. Fewer walls, longer distances, and a camp that moves with the country rather than waiting for it.",
        link: "https://wildcosafaris.vercel.app/journeys/in-the-field/",
      },
    ],
    footnote: "Every route is planned under the same Ledger, room by room and night by night.",
    video: {
      youtubeId: "REPLACE_WITH_YOUTUBE_ID",
      title: "Wine. Wildlife. Wilderness. — The Grand Traverse",
      jamesLine: "Thirteen nights, one guide, and you remember who was sitting in the front seat — not the thread count.",
      caption: "James on why this route plays.",
    },
  },

  villaInvite: {
    eyebrow: "Larger villas · The Gatherings portfolio",
    heading: "Need more than a room?",
    body: "The cottage and the houses over at Leeu Estates, Franschhoek, are the Gatherings answer: whole residences with the Winelands for a view. Our Gatherings team can truly define your generation or family journey, room by room and night by night. More than a booking: a journey, planned.",
    cta: "See the cottage and the houses",
    agentCta: "Connect with the Gatherings team",
    agentNote: "Traveling with an agent? They can connect with us directly and we'll set the meeting.",
    link: "https://wildco-gatherings1.vercel.app/houses/leeu-estates-franschhoek",
  },

  collection: {
    eyebrow: "The Leeu Collection · South Africa",
    intro: "More of the collection, one link-scroll away.",
    properties: [
      {
        name: "Leeu House",
        blurb: "This house · Franschhoek",
        link: "https://www.wildearthstays.com/property/leeu-house",
      },
      {
        name: "Leeu Estates",
        blurb: "The estate · Franschhoek",
        link: "https://www.wildearthstays.com/property/leeu-estates",
      },
      {
        name: "Le Quartier Français",
        blurb: "The original · Franschhoek",
        link: "https://www.wildearthstays.com/property/le-quartier-francais",
      },
    ],
  },

  faqs: [
    { q: "Is Leeu House inside Franschhoek village?", a: "Yes. The house sits on Huguenot Road directly in Franschhoek, yet is designed as a peaceful sanctuary: guests wander to restaurants, galleries and wine experiences, then return to gardens, art and mountain views." },
    { q: "How far is Leeu House from Cape Town airport?", a: "Cape Town International Airport (CPT) is approximately 68 km away, around 55 minutes by car. It is the preferred arrival airport for the house." },
    { q: "What is included in a stay at Leeu House?", a: "A bed-and-breakfast plan with a complimentary wine tasting at the Great Heart Wine Boutique included per stay. Dinners, spa treatments, flights and transfers are quoted separately." },
    { q: "When is the best time to visit Franschhoek?", a: "October to April. These months bring warm temperatures, harvest-season energy in February and March, and ideal conditions for exploring the Cape Winelands." },
    { q: "What room types does Leeu House have?", a: "Classic Rooms, Deluxe Rooms, Luxury Rooms and a Suite, with terraces and private gardens on select rooms. Current rates in the registry run from $765 to $996 per night." },
    { q: "How does a Gatherings booking work?", a: "We book the rooms, plan the Winelands days, and pair the Cape chapter with the rest of your journey. Rates are quoted for your dates, occupancy and exclusions before anything is confirmed." },
  ],
};