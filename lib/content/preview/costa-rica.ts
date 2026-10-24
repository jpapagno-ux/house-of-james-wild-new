// Costa Rica destination record, snapshot from the Base44 Ledger (Destination
// 6a870232e522e60d07f24d0f, 24 Oct 2026). Replaced by the Ledger export in
// step 7; the page template reads the same shape.
import ledger from "./costa-rica-ledger.json";

const WF = "https://cdn.prod.website-files.com/679d1c7de0254ea4d176361b";

export const COSTA_RICA = {
  name: "Costa Rica",
  slug: "costa-rica",
  region: { name: "Central America", slug: "central-america" },
  siblings: [
    { name: "Belize", slug: "belize" },
    { name: "Costa Rica", slug: "costa-rica" },
    { name: "Panama", slug: "panama" },
  ],
  subtitle: "Where Nature Leads the Way",
  leading:
    "Cloud forests, volcanic slopes, and wildlife filled jungles create a landscape alive with natural energy. Rivers carve through dense vegetation, and coastlines stretch between two warm oceans. Stays focus on sustainability, comfort, and proximity to thriving ecosystems.",
  hero: { src: `${WF}/6863018671b62ea7c452cea0_CostaRicaMAHero1.jpg`, alt: "Costa Rica: rainforest, volcano and coastline" },
  section1: {
    title: "A Living Paradise of Rainforest, Volcanoes, and Coastlines",
    paragraphs: [
      "Costa Rica is a place where nature feels alive in every direction. Dense rainforests, active volcanoes, misty cloud forests, and both Pacific and Caribbean coastlines create a landscape rich in biodiversity and contrast.",
      "Travel here is about connection to life in its most vibrant form. Walking through jungle canopies, soaking in natural hot springs, exploring wildlife rich reserves, and moving between ocean and forest reveal a rhythm that is balanced, lush, and energizing.",
      "Costa Rica is globally recognized for its strong conservation ethic, protecting vast portions of its land as national parks and reserves.",
    ],
    image: { src: `${WF}/69ea4b8595c2a2baa95a6699_Costa%20Rica%20-%20Section%201%20Image.jpg`, alt: "Costa Rica rainforest canopy" },
  },
  section2: {
    eyebrow: "Find Your Rhythm in Costa Rica",
    title: "Where Jungle, Ocean, and Wellness Align",
    paragraphs: [
      "Nature lovers drawn to biodiversity, wellness travelers seeking restoration, adventure seekers exploring rainforest and surf, and conscious travelers focused on sustainability.",
      "Zipline through rainforest canopies, surf along tropical coastlines, explore volcanic landscapes, and encounter wildlife in some of the most biodiverse habitats on Earth.",
    ],
    image: { src: `${WF}/69ea4b8bb3fd5ebd4135a7bc_Costa%20Rica%20-%20Section%202%20Image.jpg`, alt: "Costa Rica coastline where the jungle meets the sea" },
  },
  quote: { text: "Costa Rica feels alive in every moment, where nature is not something you visit, but something you move through and become part of.", by: "James Papagno, Founder" },
  ledger: ledger as {
    snapshot: string;
    items: { id: string; name: string; slug: string; ledgerId: string; kind: string; tagline: string; bestMonths: string; lat: number | null; lng: number | null; area: string | null; image: string | null; created: string }[];
    notes: [string, string, string][];
  },
};
