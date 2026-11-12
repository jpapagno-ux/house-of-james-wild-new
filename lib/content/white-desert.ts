// White Desert, Antarctica (James, 12 Nov 2026: "It's the only stay that we're promoting in Antarctica, which we
// need a special section for"). Every fact and rate below is from white-desert.com (home, /camps, /prices),
// read 12 Nov 2026; photographs courtesy of White Desert, in Cloudinary under jwco/stays/white-desert. Rates are the
// brand's published rates for the 2026 to 2027 season, per person sharing; the house confirms them before you book.

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
export const wd = (id: string, w = 2400) => `${CLD}/c_limit,w_${w}/q_auto:good/f_auto/jwco/stays/white-desert/${id}`;
export const WD_CREDIT = "Photographs courtesy of White Desert";

export const WD = {
  slug: "white-desert",
  path: "/stays/white-desert",
  name: "White Desert",
  country: "Antarctica",
  tagline: "Three camps of six suites on the ice of Queen Maud Land, five and a half hours' flight south of Cape Town",
  answer:
    "White Desert is the only way James Wild & Co sends guests into Antarctica's interior rather than to its coast. Between November and February it flies guests from Cape Town to its own blue ice runway at Wolf's Fang, about five and a half hours and 4,220 km south, and keeps three camps of six heated pods each: Whichaway, Echo and Explorer. Trips run from a single day on the ice at US $16,500 to the South Pole from US $95,000 per person sharing, as published for the 2026 to 2027 season. Ages 10 to 85; solo travellers, families and groups taking a camp whole are welcome. Plan it with James.",
  // James, 12 Nov 2026: "it's founder vetted. I haven't been yet ... mark it as quite a remarkable experience. I'm
  // looking forward to going myself and helping anybody that wants to consider this experience of a lifetime."
  founder: {
    proof: "James has vetted White Desert and filed it in the Ledger. He has not been yet, and says so.",
    note: "Quite a remarkable experience, and one I'm looking forward to making myself. Until then, I'm here to help anyone considering it. This is the experience of a lifetime.",
  },
  hero: { url: wd("wd03"), alt: "Wolf's Fang and the nunataks of Queen Maud Land rising from the ice, from the air" },
  flight: [
    ["From", "Cape Town, South Africa"],
    ["To", "Wolf's Fang blue ice runway, 71° 31' S, 08° 48' E"],
    ["Flying time", "About 5 hours 30 minutes"],
    ["Distance", "4,220 km / 2,610 mi"],
    ["Aircraft", "Airbus, business class"],
    ["On the ice", "About -5°C / 23°F on average in summer, with 24 hours of daylight"],
  ] as [string, string][],
  facts: [
    ["Ledger ID", "STY-2026-000647"],
    ["Season", "November to February, the polar summer"],
    ["Camps", "Whichaway, Echo and Explorer, six suites each"],
    ["Guests", "Up to 12 a camp; ages 10 to 85"],
    ["Best suited to", "Explorers, Couples & honeymooners, Families & generations, Solo travellers"],
    ["From · To", "Cape Town (CPT) · Wolf's Fang runway"],
    ["The Ledger", "Founder vetted · not yet visited · 2026"],
  ] as [string, string][],
  camps: [
    {
      key: "whichaway", name: "Whichaway Camp", coords: "70° 48' S, 11° 23' E",
      line: "The original camp, reimagined: six pods with glass conservatories on rare ice-free rock above more than a hundred freshwater lakes.",
      body: [
        "Whichaway opened in 2005 on the site of a former East German science base, in one of the ice-free oases that make up less than 3% of the continent. Glacial ice meets exposed rock here, above a chain of more than a hundred freshwater lakes.",
        "Six pods sit on the rock, each with a private en-suite bathroom and shower and a glass conservatory with one-way mirrored panels, a lounge chair and the glacier beyond.",
      ],
      has: ["Heated pod with electric blankets and hot-water bottles", "En-suite shower and bathroom", "Glass conservatory with one-way mirrored panels", "Writing desk, coffee machine, kettle and teas"],
      days: ["Ice climbing", "Rappelling", "Glacier trek", "Nunatak hikes", "Crystal cave", "Lake traverse", "Sauna and cold plunge"],
      photos: [
        { url: wd("whichaway-2"), alt: "Whichaway's white pods on the rock above a frozen lake, the sun low over the ice" },
        { url: wd("whichaway-4"), alt: "A climber on an ice wall near Whichaway" },
      ],
    },
    {
      key: "echo", name: "Echo Base", coords: "71° 32' S, 8° 50' E",
      line: "Conceived in conversation with Buzz Aldrin: six space-age pods on a glacier, with floor-to-ceiling one-way glass.",
      body: [
        "The idea for Echo came out of a conversation with astronaut Buzz Aldrin during his visit to Antarctica. The camp sits alone on a vast glacier, with clean lines and floor-to-ceiling windows framing the ice.",
        "Every pod has a private en-suite shower, and the glass is one-way: the continent laid out before you, the interior entirely your own.",
      ],
      has: ["Heated pod with electric blankets and hot-water bottles", "En-suite shower and bathroom", "Floor-to-ceiling one-way glass", "Writing desk, coffee machine, kettle and teas"],
      days: ["Ice climbing", "Rappelling", "Fat biking", "Glacier trek", "Nunatak hikes", "Ice caves", "Rock climbing", "Cross-country skiing", "Zipline", "Sauna"],
      photos: [
        { url: wd("echo-1"), alt: "Echo's pods on the glacier below a ridge of rock" },
        { url: wd("echo-4"), alt: "Three guests fat biking on the ice below the peaks" },
      ],
    },
    {
      key: "explorer", name: "Explorer Camp", coords: "71° 31' S, 8° 51' E",
      line: "Chalet-style and rustic beneath T-Rex Mountain: heated bedroom tents and the launch point for the South Pole.",
      body: [
        "Explorer sits beneath the profile of T-Rex Mountain, surrounded by ice fields that run to the horizon. It is the simplest of the three, true to the company's expedition roots, and the base for the South Pole journey.",
        "Heated bedroom tents with translucent panels have private toilet and washing facilities, with shared showers; there is an ice bar and the Aurora movie theatre.",
      ],
      has: ["Heated pod with electric blankets and hot-water bottles", "Private toilet and washing facilities; shared showers", "Floor-to-ceiling windows", "Writing desk, coffee machine, kettle and teas"],
      days: ["Rappelling", "Ice climbing", "Glacier trek", "Nunatak hikes", "Fat biking", "Rock climbing", "Zipline", "Ice caves", "Cross-country skiing"],
      photos: [
        { url: wd("explorer-1"), alt: "A nunatak glowing in the low sun above wind-carved snow" },
        { url: wd("explorer-3"), alt: "A guest climbing a fixed line up the ice" },
      ],
    },
  ],
  trips: [
    { name: "Antarctica in a Day", season: "Entire season", camps: "No overnight", rate: 16500, line: "Cape Town to Antarctica and back: an ice cave, a rappel down a glacier and champagne in the ice bar.", photo: { url: wd("wd05", 1600), alt: "The Airbus on the blue ice runway below the mountains" } },
    { name: "Discovery Week", season: "Set dates", camps: "Explorer Camp", rate: 45000, line: "A week on the ice led by scientists and guided by polar experts.", photo: { url: wd("wd14", 1600), alt: "A roped team walking across the white plateau" } },
    { name: "Baby Penguins & Blue Tunnels", season: "Early season", camps: "Whichaway & Echo, or Explorer from US $65,000", rate: 75250, line: "The Emperor chicks' first steps, and the Blue Ice Tunnels.", photo: { url: wd("wd10", 1600), alt: "Emperor penguin chicks huddled on the snow" } },
    { name: "South Pole & Penguins", season: "Most popular", camps: "Whichaway & Echo, or Explorer from US $95,000", rate: 115500, line: "The South Pole, reached by fewer than 500 people a year, and the Emperor colony.", photo: { url: wd("wd06", 1600), alt: "The flat white polar plateau under a blue sky" } },
    { name: "South Pole & Blue Rivers", season: "Late season", camps: "Whichaway & Echo", rate: 115500, line: "The South Pole and Antarctica's rarely seen Blue Rivers.", photo: { url: wd("wd11", 1600), alt: "A meltwater river cutting blue through the ice, from the air" } },
    { name: "The Long Stay", season: "Late season", camps: "Whichaway and Echo", rate: 110500, line: "Both main camps on the longest itinerary, with the South Pole and the Blue Rivers.", photo: { url: wd("wd12", 1600), alt: "Climbers above a blue river in an ice canyon" } },
  ],
  how: [
    ["Consult", "Talk it through with James: the itinerary, the camp, your dates and availability."],
    ["Confirm", "A deposit secures your dates; travel insurance and a medical check within 30 days of travel are required."],
    ["Arrive early", "Fly into Cape Town at least two days before your Antarctic flight, and leave two days after you return, in case weather moves the flight."],
    ["Kit", "White Desert tells you what to pack and can have a full polar kit ready in Cape Town."],
    ["Brief", "A safety briefing at White Desert's office in Cape Town, then a kit check."],
    ["Fly", "On the day you are collected from your hotel, fast-tracked through the airport and flown direct to the ice."],
  ] as [string, string][],
  faqs: [
    { q: "How do you get to White Desert in Antarctica?", a: "By air from Cape Town: a direct flight of about five and a half hours, 4,220 km, in business class aboard an Airbus, landing on White Desert's own blue ice runway at Wolf's Fang in Queen Maud Land." },
    { q: "When does White Desert operate?", a: "Between November and February, during the short polar summer, when there are 24 hours of daylight and the average temperature on the ice is about -5°C (23°F)." },
    { q: "How much does White Desert cost?", a: "For the 2026 to 2027 season White Desert publishes Antarctica in a Day at US $16,500, Discovery Week at US $45,000, Baby Penguins & Blue Tunnels from US $65,000, South Pole & Penguins from US $95,000, the Long Stay at US $110,500 and South Pole & Blue Rivers at US $115,500, per person sharing. The house confirms every rate before you book." },
    { q: "Who can travel with White Desert?", a: "Guests from 10 to 85 years old. Each camp takes no more than 12 guests; solo travellers are welcome, as are families and groups taking a camp for their own use." },
    { q: "Is White Desert a cruise?", a: "No. It is a fly-in camp stay in Antarctica's interior, on the ice of Queen Maud Land. The ships James Wild & Co books sail to the Antarctic Peninsula instead." },
  ],
} as const;
