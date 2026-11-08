import type { Guide } from "./guides";

// Fiji place guides (James, 5 Nov 2026: "we probably at this point need to make a Fiji guide"): the Yasawa
// Islands, the Mamanuca Islands, Vanua Levu and Taveuni, and Kadavu, inside the Fiji country page. Place facts
// only from Tourism Fiji (fiji.travel, read 7 Nov 2026); stay and ship facts from their brands, as filed in the
// Library. James has travelled Fiji, but no page claims he stayed at any one stay: every stay here is a vetted
// partner. Kristina Larson is the house's Fiji specialist. No dashes in the copy. Heroes borrow each place's
// selected stay frames, credited, until the house files its own landscape photography (IMAGE FOLLOW-UP).

type Month = "best" | "good" | "wet";
const M = (s: string) => s.split("").map((c) => (c === "B" ? "best" : c === "g" ? "good" : "wet")) as Month[];
const BASE = "/destinations/oceania/fiji";
const TF = (path: string, title: string) => ({ title: `Tourism Fiji: ${title}`, url: `https://www.fiji.travel${path}` });
const CLIMATE = TF("/fiji-guide/things-to-know/weather-and-climate-in-fiji/climate-in-fiji", "climate in Fiji");
const BY_SEA = TF("/fiji-guide/things-to-know/getting-around/water", "exploring Fiji by sea");
const BY_AIR = TF("/fiji-guide/things-to-know/getting-around/air", "exploring Fiji by air");
/** Tourism Fiji: the dry season (May to October) is cooler and clearest; November to April is warm with short showers. */
const FIJI_MONTHS = [{ area: "Across the islands", note: "Dry season May to October, clearest water; warm and wetter November to April (Tourism Fiji)", months: M("ggggBBBBBBgg") }];
const NAN: [string, string] = ["Nadi International Airport (NAN)", "Every international flight lands here"];
const PROOF_EYEBROW = "Vetted with our partners · the house's Fiji specialist";
const ONWARD = (except: string) => [
  { name: "Fiji", href: BASE, line: "Every stay, the best months, and how to move between the islands" },
  { name: "The Yasawa Islands", href: `${BASE}/yasawa-islands`, line: "The Blue Lagoon, Sawa-i-Lau and the manta rays" },
  { name: "The Mamanuca Islands", href: `${BASE}/mamanuca-islands`, line: "Twenty islands close to Nadi, and Cloudbreak" },
  { name: "Vanua Levu and Taveuni", href: `${BASE}/vanua-levu-and-taveuni`, line: "The far north: Savusavu, the Rainbow Reef and the private islands" },
  { name: "Kadavu", href: `${BASE}/kadavu`, line: "The Great Astrolabe Reef and Kokomo" },
].filter((o) => !o.href.endsWith(except));

export const FIJI_GUIDES: Record<string, Guide> = {
  "yasawa-islands": {
    slug: "yasawa-islands", region: "oceania", country: "fiji", parent: "fiji", name: "The Yasawa Islands", path: `${BASE}/yasawa-islands`,
    theme: "sea", stays: ["yasawa-island-resort", "turtle-island"],
    proofEyebrow: PROOF_EYEBROW,
    seo: {
      title: "Yasawa Islands Travel Guide: The Blue Lagoon, Sawa-i-Lau and Where to Stay",
      description: "Fiji's Yasawa Islands: a chain of 20 islands with the Blue Lagoon, the Sawa-i-Lau caves and manta rays from May to October. How to get there, when to go, Yasawa Island Resort, Turtle Island and the Yasawa Princess II.",
      keywords: ["Yasawa Islands travel guide", "Yasawa Islands Fiji", "Blue Lagoon Fiji", "Sawa-i-Lau caves", "Fiji manta rays", "Yasawa Islands cruise", "best resorts Yasawa Islands"],
    },
    eyebrow: "Destinations · Oceania · Fiji",
    h1: "The Yasawa Islands",
    tagline: "Twenty islands north of Nadi, the Blue Lagoon, and caves you swim into",
    slides: [],
    slidesFromStay: { slug: "yasawa-island-resort", alt: "Yasawa Island and its reef from the air, Fiji", credit: "Photograph courtesy of Yasawa Island Resort & Spa" },
    answer: "The Yasawa Islands are a chain of about 20 islands north of Nadi, roughly 50 to 80 km away, reached by seaplane, helicopter, the daily Yasawa Flyer catamaran from Denarau, or on a small cruise ship. Tourism Fiji names the Blue Lagoon, the limestone caves of Sawa-i-Lau and the manta rays at Drawaqa, which gather from May to October, as the highlights; the dry season, May to October, gives the clearest water for snorkelling. The house files Yasawa Island Resort, the only resort on Yasawa itself, Turtle Island, and Blue Lagoon Cruises' 44-guest Yasawa Princess II.",
    facts: [
      ["Where", "A chain of about 20 islands north and northwest of Viti Levu"],
      ["From Nadi", "About 50 to 80 km: seaplane, helicopter, the Yasawa Flyer or a cruise (Tourism Fiji)"],
      ["Best time", "Year round; May to October for the clearest snorkelling"],
      ["Manta rays", "Drawaqa Island, May to October"],
      ["Famous for", "The Blue Lagoon, the Sawa-i-Lau caves, village visits"],
      ["In the Ledger", "Yasawa Island Resort · Turtle Island · Yasawa Princess II"],
    ],
    proof: "James has travelled Fiji, and every stay and ship in this guide is a vetted partner of the house. Kristina Larson, the house's Fiji specialist, plans the Yasawas: a cruise, a resort, or both in one trip.",
    months: [{ area: "Snorkelling and the lagoons", note: "Year round; clearest May to October (Tourism Fiji)", months: M("ggggBBBBBBgg") }, { area: "Manta rays at Drawaqa", note: "May to October (Tourism Fiji)", months: M("wwwwBBBBBBww") }],
    airports: [NAN],
    transfers: [["Nadi → the Yasawas", "Seaplane or helicopter from Nadi Airport"], ["Denarau → the Yasawas", "The Yasawa Flyer catamaran, daily (Tourism Fiji)"], ["Nadi → Yasawa Island Resort", "About 30 minutes by charter flight to the resort's own airstrip"]],
    highlights: [
      { title: "The Blue Lagoon", line: "Snorkel", body: "Ringed by Nanuya, Matacawalevu, Tavewa and Nacula at the northern end of the chain, and the setting of the film The Blue Lagoon (Tourism Fiji)." },
      { title: "Sawa-i-Lau", line: "Caves", body: "A high limestone island in the northern Yasawas with seawater caves you swim inside (Tourism Fiji)." },
      { title: "Manta rays", line: "May to October", body: "Giant mantas gather in the channel near Drawaqa Island through the manta season (Tourism Fiji)." },
      { title: "Sharks on the southern reefs", line: "Snorkel or dive", body: "Snorkel or dive with sharks on remote reefs in the southern Yasawas (Tourism Fiji)." },
    ],
    suits: [
      { who: "Couples", line: "Eighteen thatched bures, adults only most of the year, the only resort on its island.", href: "/stays/yasawa-island-resort", label: "Yasawa Island Resort" },
      { who: "First time in Fiji", line: "The Blue Lagoon, Sawa-i-Lau and the mantas in one week, 44 guests.", href: "/voyages/ships/yasawa-princess-ii", label: "Yasawa Princess II" },
      { who: "A private island", line: "Turtle Island, a private island resort in the Yasawa group.", href: "/stays/turtle-island", label: "Turtle Island" },
    ],
    howTo: {
      title: "How to See the Yasawas",
      intro: "Stay on one island, or let a small ship move you between them.",
      options: [
        { name: "Stay on Yasawa itself", body: "Fly 30 minutes from Nadi to Yasawa Island Resort's airstrip, and picnic on beaches of your own.", href: "/stays/yasawa-island-resort", label: "Yasawa Island Resort" },
        { name: "Cruise the chain", body: "Blue Lagoon Cruises sails 3, 4 and 7 nights from Port Denarau to the Sacred Islands, the Blue Lagoon, Sawa-i-Lau and Drawaqa.", href: "/voyages/ships/yasawa-princess-ii", label: "Yasawa Princess II" },
        { name: "Pair it with the Mamanucas", body: "The Yasawas and the Mamanucas share the same boats from Denarau, so a week in each fits one trip.", href: `${BASE}/mamanuca-islands`, label: "The Mamanuca Islands" },
      ],
    },
    onwardEyebrow: "Continue through Fiji",
    onward: ONWARD("yasawa-islands"),
    voyageWaters: [],
    faqs: [
      { q: "How far are the Yasawa Islands from Nadi?", a: "About 50 to 80 km, per Tourism Fiji: reachable by seaplane or helicopter from Nadi Airport, the daily Yasawa Flyer catamaran from Denarau, or on a cruise." },
      { q: "When is the best time to visit the Yasawa Islands?", a: "They work year round. The dry season, May to October, gives the clearest water for snorkelling and is also the manta ray season at Drawaqa." },
      { q: "Where is the Blue Lagoon in Fiji?", a: "At the northern end of the Yasawas, ringed by Nanuya, Matacawalevu, Tavewa and Nacula. It is where the film The Blue Lagoon was made." },
      { q: "Can you swim with manta rays in the Yasawas?", a: "Yes, from May to October in the channel near Drawaqa Island, per Tourism Fiji. Blue Lagoon Cruises' 4 and 7-night cruises stop there." },
      { q: "Where should I stay in the Yasawa Islands?", a: "Yasawa Island Resort & Spa, 18 bures and the only resort on Yasawa itself, adults only most of the year; or Turtle Island, a private island resort in the group." },
    ],
    geo: { lat: -16.95, lng: 177.4 },
    sources: [
      TF("/places-to-go/yasawa-islands", "Yasawa Islands"),
      TF("/places-to-go/yasawa-islands/places/sawa-i-lau-caves", "Sawa-i-Lau caves"),
      TF("/places-to-go/yasawa-islands/places/swim-with-manta-rays", "swim with manta rays"),
      CLIMATE, BY_SEA,
      { title: "Blue Lagoon Cruises: Yasawa Princess II", url: "/voyages/ships/yasawa-princess-ii" },
    ],
  },

  "mamanuca-islands": {
    slug: "mamanuca-islands", region: "oceania", country: "fiji", parent: "fiji", name: "The Mamanuca Islands", path: `${BASE}/mamanuca-islands`,
    theme: "sea", stays: ["likuliku-lagoon-resort", "six-senses-fiji", "tokoriki-island-resort", "vomo-island"],
    proofEyebrow: PROOF_EYEBROW,
    seo: {
      title: "Mamanuca Islands Travel Guide: Islands Near Nadi, Cloudbreak and Where to Stay",
      description: "Fiji's Mamanuca Islands: a cluster of about 20 islands close to Nadi, with boat, seaplane and helicopter transfers, Cloudbreak's surf and Monuriki from Cast Away. Likuliku, Six Senses Fiji, Tokoriki and VOMO.",
      keywords: ["Mamanuca Islands travel guide", "Mamanuca Islands Fiji", "best resorts Mamanuca Islands", "Cloudbreak Fiji", "Monuriki Cast Away island", "Fiji islands near Nadi"],
    },
    eyebrow: "Destinations · Oceania · Fiji",
    h1: "The Mamanuca Islands",
    tagline: "Twenty islands off Nadi, the easiest of Fiji to reach, and Cloudbreak beyond the reef",
    slides: [],
    slidesFromStay: { slug: "vomo-island", alt: "VOMO Island's beachfront residences from the lagoon, Fiji", credit: "Photograph courtesy of VOMO Island Fiji" },
    answer: "The Mamanuca Islands are a cluster of about 20 islands off Nadi, the most accessible of Fiji's island groups: resorts run boat transfers from Denarau, and seaplanes and helicopters fly from Nadi. Tourism Fiji names world-class surf in the southern Mamanucas, Cloudbreak among it, and Monuriki, where Cast Away was filmed. The islands work year round. The house files Likuliku Lagoon Resort, Six Senses Fiji on Malolo, Tokoriki Island Resort and VOMO, between the Mamanucas and the Yasawas.",
    facts: [
      ["Where", "About 20 islands west of Nadi and Denarau"],
      ["From Nadi", "Resort boats from Denarau; seaplane or helicopter from Nadi (Tourism Fiji)"],
      ["Best time", "Year round"],
      ["Surf", "Cloudbreak and other breaks in the southern Mamanucas"],
      ["On film", "Monuriki (Cast Away)"],
      ["In the Ledger", "Likuliku · Six Senses Fiji · Tokoriki · VOMO"],
    ],
    proof: "James has travelled Fiji, and every stay in this guide is a vetted partner of the house. Kristina Larson, the house's Fiji specialist, matches the Mamanucas to the trip: adults only, families, or a whole residence.",
    months: FIJI_MONTHS,
    airports: [NAN],
    transfers: [["Denarau → the Mamanucas", "Resort boats and water taxis (Tourism Fiji)"], ["Nadi → the Mamanucas", "Seaplane or helicopter"], ["Nadi → VOMO", "About 15 minutes by helicopter, or by VOMO's boat from Vuda Point"]],
    highlights: [
      { title: "Twenty islands", line: "Island hopping", body: "A cluster of about 20 islands, close enough to hop from beach to reef in a day (Tourism Fiji)." },
      { title: "Cloudbreak", line: "Surf", body: "The southern Mamanucas hold world-class breaks, Cloudbreak among them (Tourism Fiji)." },
      { title: "Monuriki", line: "Cast Away", body: "The island where the film Cast Away was shot; Survivor is filmed in the Mamanucas too (Tourism Fiji)." },
      { title: "A whole residence", line: "Families", body: "VOMO's seven residences of three to five bedrooms, each with a butler." },
    ],
    suits: [
      { who: "Couples", line: "Adults only, with overwater bures in a lagoon.", href: "/stays/likuliku-lagoon-resort", label: "Likuliku Lagoon Resort" },
      { who: "Families", line: "All inclusive, a Kids' Village, and residences up to five bedrooms.", href: "/stays/vomo-island", label: "VOMO Island" },
      { who: "Wellness", line: "Six Senses on Malolo, with a residence for the whole family.", href: "/stays/six-senses-fiji", label: "Six Senses Fiji" },
    ],
    howTo: {
      title: "How to See the Mamanucas",
      intro: "Pick the island that fits the trip; every one is close to Nadi.",
      options: [
        { name: "Arrive by air", body: "A helicopter or seaplane from Nadi turns the transfer into the first view of the reef.", href: "/stays/vomo-island", label: "VOMO Island" },
        { name: "Join a cruise from your resort", body: "Blue Lagoon Cruises collects guests from Mamanuca resorts, Likuliku and Tokoriki among them.", href: "/voyages/ships/yasawa-princess-ii", label: "Yasawa Princess II" },
        { name: "Go north after", body: "The same boats carry on to the Yasawas.", href: `${BASE}/yasawa-islands`, label: "The Yasawa Islands" },
      ],
    },
    onwardEyebrow: "Continue through Fiji",
    onward: ONWARD("mamanuca-islands"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to the Mamanuca Islands?", a: "Resorts run boat transfers from Denarau, water taxis go on demand, and seaplanes and helicopters fly from Nadi Airport, per Tourism Fiji." },
      { q: "When is the best time to visit the Mamanuca Islands?", a: "They welcome visitors year round. Fiji's dry season, May to October, is cooler with the clearest water; November to April is warmer with short showers." },
      { q: "Is Cloudbreak in the Mamanucas?", a: "Yes. Tourism Fiji lists Cloudbreak among the world-class breaks of the southern Mamanucas." },
      { q: "Which Mamanuca resorts suit families?", a: "VOMO, all inclusive with a Kids' Village and residences of three to five bedrooms, and Six Senses Fiji on Malolo." },
      { q: "Which island is Cast Away?", a: "Monuriki, in the Mamanuca group, per Tourism Fiji." },
    ],
    geo: { lat: -17.7, lng: 177.15 },
    sources: [
      TF("/places-to-go/mamanuca-islands", "Mamanuca Islands"),
      TF("/places-to-go/mamanuca-islands/locations/luxury-in-the-mamanuca-islands", "luxury in the Mamanuca Islands"),
      TF("/things-to-do/surfing/mamanuca-surf-guide", "Mamanuca surf guide"),
      CLIMATE, BY_SEA, BY_AIR,
    ],
  },

  "vanua-levu-and-taveuni": {
    slug: "vanua-levu-and-taveuni", region: "oceania", country: "fiji", parent: "fiji", name: "Vanua Levu and Taveuni", path: `${BASE}/vanua-levu-and-taveuni`,
    theme: "sea", stays: ["laucala", "matangi-island", "namale-resort-and-spa", "jean-michel-cousteau-resort"],
    proofEyebrow: PROOF_EYEBROW,
    seo: {
      title: "Vanua Levu and Taveuni Travel Guide: Savusavu, the Rainbow Reef and Fiji's Private Islands",
      description: "Fiji's far north: Vanua Levu, Savusavu and the Great Sea Reef; Taveuni, the Garden Island, the Rainbow Reef and the 180th meridian; and the private islands Laucala and Matangi. How to get there and where to stay.",
      keywords: ["Vanua Levu travel guide", "Taveuni travel guide", "Savusavu Fiji", "Rainbow Reef Fiji", "Laucala Island", "Matangi Island", "northern Fiji resorts"],
    },
    eyebrow: "Destinations · Oceania · Fiji",
    h1: "Vanua Levu and Taveuni",
    tagline: "Fiji's far north: Savusavu Bay, the Garden Island and the soft corals of the Rainbow Reef",
    slides: [],
    slidesFromStay: { slug: "laucala", alt: "Laucala Island from the air, Fiji", credit: "Photograph courtesy of Laucala" },
    answer: "Vanua Levu is Fiji's second largest island, quieter than Viti Levu, with Savusavu and its hot springs, pearl farming, and the Great Sea Reef offshore; fly from Nadi to Savusavu (SVU) or Labasa (LBS). Taveuni, the Garden Island, has rainforest, waterfalls and the 180th meridian, and the Rainbow Reef in the Somosomo Strait is one of Fiji's best dive regions; fly from Nadi to Matei (TVU). Both work year round, per Tourism Fiji. The house files Namale and the Jean-Michel Cousteau Resort at Savusavu, and the private islands Laucala and Matangi.",
    facts: [
      ["Where", "Northern Fiji: Vanua Levu, Taveuni and the islands off them"],
      ["Airports", "Savusavu (SVU) and Labasa (LBS) on Vanua Levu; Matei (TVU) on Taveuni"],
      ["From Nadi", "About an hour by domestic flight to Savusavu"],
      ["Best time", "Year round (Tourism Fiji)"],
      ["Diving", "The Rainbow Reef and the Great White Wall, Somosomo Strait; the Great Sea Reef"],
      ["In the Ledger", "Laucala · Matangi · Namale · Jean-Michel Cousteau Resort"],
    ],
    proof: "James has travelled Fiji, and every stay in this guide is a vetted partner of the house; Laucala is in The Exceptional Few. Kristina Larson, the house's Fiji specialist, plans the flights north and the private island transfers.",
    months: FIJI_MONTHS,
    airports: [NAN, ["Savusavu (SVU)", "For Savusavu, Namale and the Jean-Michel Cousteau Resort"], ["Matei, Taveuni (TVU)", "For Taveuni and the islands off it"]],
    transfers: [["Nadi → Savusavu", "About an hour by domestic flight"], ["Nadi → Taveuni", "Domestic flights to Matei (Tourism Fiji)"], ["Nadi → Laucala", "Laucala's own aircraft to the island's airstrip"]],
    highlights: [
      { title: "The Rainbow Reef", line: "Dive", body: "In the Somosomo Strait, bursting with soft corals and sites like the Great White Wall (Tourism Fiji)." },
      { title: "The Garden Island", line: "Taveuni", body: "Rainforest, waterfalls and volcanic soil, and the marker where the 180th meridian crosses the island (Tourism Fiji)." },
      { title: "Savusavu", line: "Vanua Levu", body: "Hot springs, pearl farms and the Great Sea Reef, one of the largest barrier reefs in the world (Tourism Fiji)." },
      { title: "Two private islands", line: "Laucala and Matangi", body: "Laucala, in The Exceptional Few, and Matangi, adults only, with its treehouses." },
    ],
    suits: [
      { who: "The whole island", line: "A private island resort with its own airstrip.", href: "/stays/laucala", label: "Laucala" },
      { who: "Families", line: "Resident marine biologists and a kids' club from breakfast to bedtime.", href: "/stays/jean-michel-cousteau-resort", label: "Jean-Michel Cousteau Resort" },
      { who: "Couples", line: "Adults only, eight bures and three treehouses.", href: "/stays/matangi-island", label: "Matangi" },
    ],
    howTo: {
      title: "How to See the North",
      intro: "Fly north from Nadi, then let the islands set the pace.",
      options: [
        { name: "Base at Savusavu", body: "Namale or the Jean-Michel Cousteau Resort, an hour's flight from Nadi.", href: "/stays/namale-resort-and-spa", label: "Namale" },
        { name: "Dive the Rainbow Reef", body: "Matangi runs day trips to the Somosomo Strait and the Great White Wall.", href: "/stays/matangi-island", label: "Matangi" },
        { name: "Take an island", body: "Laucala flies guests in on its own aircraft.", href: "/stays/laucala", label: "Laucala" },
      ],
    },
    onwardEyebrow: "Continue through Fiji",
    onward: ONWARD("vanua-levu-and-taveuni"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Vanua Levu?", a: "By domestic flight from Nadi to Savusavu (SVU) or Labasa (LBS), about an hour to Savusavu; ferries also run from Suva, per Tourism Fiji." },
      { q: "How do you get to Taveuni?", a: "By domestic flight from Nadi to Matei Airport (TVU), or by ferry from Suva, per Tourism Fiji." },
      { q: "What is the Rainbow Reef?", a: "A reef in the Somosomo Strait off Taveuni, one of Fiji's best dive regions, known for soft corals and the Great White Wall." },
      { q: "When is the best time to visit Taveuni?", a: "Year round, per Tourism Fiji. The dry season, May to October, is cooler with the clearest water." },
      { q: "Which private islands are in northern Fiji?", a: "Laucala, in The Exceptional Few, and Matangi, an adults-only island of 240 acres with treehouses." },
    ],
    geo: { lat: -16.6, lng: 179.6 },
    sources: [
      TF("/places-to-go/vanua-levu", "Vanua Levu"),
      TF("/places-to-go/taveuni-island", "Taveuni Island"),
      TF("/places-to-go/taveuni-island/locations/diving-in-the-taveuni-somosomo-strait", "diving the Somosomo Strait"),
      CLIMATE, BY_AIR,
    ],
  },

  kadavu: {
    slug: "kadavu", region: "oceania", country: "fiji", parent: "fiji", name: "Kadavu", path: `${BASE}/kadavu`,
    theme: "sea", stays: ["kokomo-private-island"],
    proofEyebrow: PROOF_EYEBROW,
    seo: {
      title: "Kadavu Travel Guide: The Great Astrolabe Reef and Kokomo Private Island",
      description: "Kadavu, Fiji's fourth largest island in the far south: the Great Astrolabe Reef, endemic birds, and Kokomo Private Island. How to get there, when to go and where to stay.",
      keywords: ["Kadavu travel guide", "Kadavu Fiji", "Great Astrolabe Reef", "Kokomo Private Island", "Kadavu diving"],
    },
    eyebrow: "Destinations · Oceania · Fiji",
    h1: "Kadavu",
    tagline: "Fiji's far south, ringed by the Great Astrolabe Reef",
    slides: [],
    slidesFromStay: { slug: "kokomo-private-island", alt: "Kokomo Private Island and its reef from the air, Kadavu, Fiji", credit: "Photograph courtesy of Kokomo Private Island Fiji" },
    answer: "Kadavu is Fiji's fourth largest island, in the far south of the group: remote and uncrowded, surrounded by the Great Astrolabe Reef, one of the largest barrier reefs in the world, and home to endemic birds, per Tourism Fiji. Fly from Nadi or Suva to Vunisea, then take a boat to the resorts; Kokomo flies its own seaplane and helicopter from Nadi. Kadavu works year round. The house files Kokomo Private Island, whose Sunset Residence is in The Exceptional Few.",
    facts: [
      ["Where", "Fiji's far south; the fourth largest island"],
      ["Getting there", "Fly from Nadi or Suva to Vunisea, then by boat (Tourism Fiji)"],
      ["Best time", "Year round"],
      ["The reef", "The Great Astrolabe Reef"],
      ["Wildlife", "Endemic birds; mantas and reef life on the Astrolabe"],
      ["In the Ledger", "Kokomo Private Island (The Exceptional Few No. 016)"],
    ],
    proof: "James has travelled Fiji, and Kokomo is a vetted partner of the house; its Sunset Residence is in The Exceptional Few. Kristina Larson, the house's Fiji specialist, books the seaplane from Nadi.",
    months: FIJI_MONTHS,
    airports: [NAN, ["Vunisea, Kadavu", "Domestic flights from Nadi and Suva"]],
    transfers: [["Nadi or Suva → Vunisea", "Domestic flight (Tourism Fiji)"], ["Vunisea → the resorts", "By boat"], ["Nadi → Kokomo", "About 45 to 60 minutes by Kokomo's seaplane or helicopter"]],
    highlights: [
      { title: "The Great Astrolabe Reef", line: "Dive and snorkel", body: "One of the largest barrier reefs in the world, around Kadavu (Tourism Fiji)." },
      { title: "Endemic birds", line: "Birdwatching", body: "Kadavu is home to bird species found nowhere else (Tourism Fiji)." },
      { title: "Kokomo", line: "The Exceptional Few", body: "A private island on the Astrolabe, with a six-bedroom Sunset Residence above the reef." },
    ],
    suits: [
      { who: "Families", line: "Residences with a butler and nanny, and a kids' club all day.", href: "/stays/kokomo-private-island", label: "Kokomo" },
      { who: "Divers", line: "The Great Astrolabe Reef at the door.", href: "/stays/kokomo-private-island", label: "Kokomo" },
    ],
    howTo: {
      title: "How to See Kadavu",
      intro: "A short flight south, then the reef.",
      options: [
        { name: "Fly straight in", body: "Kokomo's seaplane or helicopter from Nadi, about 45 to 60 minutes.", href: "/stays/kokomo-private-island", label: "Kokomo" },
        { name: "Combine with the Mamanucas", body: "Back through Nadi, a few nights in the Mamanucas close the trip.", href: `${BASE}/mamanuca-islands`, label: "The Mamanuca Islands" },
      ],
    },
    onwardEyebrow: "Continue through Fiji",
    onward: ONWARD("kadavu"),
    voyageWaters: [],
    faqs: [
      { q: "How do you get to Kadavu?", a: "Fly from Nadi or Suva to Kadavu's Vunisea Airport, then by boat to your resort, per Tourism Fiji. Kokomo flies guests in by seaplane or helicopter from Nadi." },
      { q: "What is the Great Astrolabe Reef?", a: "The barrier reef around Kadavu, one of the largest in the world, per Tourism Fiji." },
      { q: "When is the best time to visit Kadavu?", a: "Year round, per Tourism Fiji; the dry season, May to October, has the clearest water." },
      { q: "Where should I stay on Kadavu?", a: "Kokomo Private Island, on the Great Astrolabe Reef, whose Sunset Residence is in The Exceptional Few." },
    ],
    geo: { lat: -19.05, lng: 178.2 },
    sources: [
      TF("/places-to-go/kadavu-island", "Kadavu Island"),
      TF("/places-to-go/kadavu-island/places/the-great-astrolabe-reef", "the Great Astrolabe Reef"),
      TF("/places-to-go/kadavu-island/locations/how-to-get-to-kadavu", "how to get to Kadavu"),
      CLIMATE,
    ],
  },
};
