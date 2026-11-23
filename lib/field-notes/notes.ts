// Field Notes (James, 22 Nov 2026): one short species note with a house watercolour, on destination and
// river pages. Every note files its `sources` here (research paper, museum or conservation body), never printed
// as a link. A note with no sources must not be placed on a page: tests/field-notes.test.ts fails on it.
// Watercolours are house illustrations made with Cloudinary AI; a scene keeps its painted setting.
export type FieldNote = {
  id: string; region: string; no: string; title: string; latin: string; body: string;
  rows: { label: string; text: string }[];
  image: { publicId: string; version: number; alt: string; width: number; height: number; scene?: boolean };
  where: { label: string; href: string };
  sources: string[];
};

export const FIELD_NOTES: Record<string, FieldNote> = {
  "pink-river-dolphin": {
    id: "pink-river-dolphin", region: "Amazon", no: "01",
    title: "The pink river dolphin", latin: "Inia geoffrensis, the boto · Amazon and Orinoco",
    body: "When the rains lift the river into the forest, the boto follows it in, swimming between the trunks. Its neck bones are not fused, so it can turn its head to steer through flooded trees. Males grow pinker with age and with the scars of fighting.",
    rows: [
      { label: "Look for", text: "A long, thin beak and a low ridge where you expect a fin." },
      { label: "Listen for", text: "The soft puff of breath before you see anything." },
      { label: "Ask your guide", text: "Which flooded channels they use in high water." },
      { label: "When", text: "High-water months, when the forest floods." },
    ],
    image: { publicId: "samples/field-notes/pink-river-dolphin-scene-watercolour", version: 1795357148, alt: "Watercolour of a pink river dolphin surfacing in dark water beside flooded forest", width: 1000, height: 747, scene: true },
    where: { label: "See them from the river", href: "/voyages/amazon#ships-h" },
    sources: [
      "Martin, A. R. and da Silva, V. M. F., 'Sexual dimorphism and body scarring in the boto (Amazon River dolphin) Inia geoffrensis', Marine Mammal Science (University of St Andrews research portal): males pinker than females and more heavily scarred by tooth rakes.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Inia geoffrensis': range, body colour changing with age, movement into floodplains and flooded forest in the wet season.",
      "National Geographic, 'Amazon river dolphins (boto)': unfused neck vertebrae letting the boto bend between flooded trees.",
    ],
  },
  "giant-river-otter": {
    id: "giant-river-otter", region: "Amazon", no: "02",
    title: "The giant river otter", latin: "Pteronura brasiliensis · rivers and oxbow lakes",
    body: "The longest of the weasel family, up to 1.8 metres, and unusually social: families of three to eight hunt fish together. Each otter carries a pale throat patch unique to it, which is how researchers tell one from another.",
    rows: [
      { label: "Look for", text: "Heads rising from the water like periscopes, showing a cream throat." },
      { label: "Listen for", text: "A family chorus of screams and snorts that carries across the lake." },
      { label: "Ask your guide", text: "Which oxbow lake has a resident family." },
      { label: "When", text: "Year round. Keep your distance and let them come to you." },
    ],
    image: { publicId: "samples/field-notes/giant-river-otter-scene-watercolour", version: 1795437553, alt: "Watercolour of a giant river otter raised from dark lake water, showing its pale throat patch", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "Noonan, P., Prout, S. and Hayssen, V., 'Pteronura brasiliensis (Carnivora: Mustelidae)', Mammalian Species 49(953), 2017: largest freshwater otter, slow rivers and creeks, fish diet, length to 1,800 mm.",
      "Smithsonian Insider, 'With voices joined in chorus, giant otter families create a distinct sound signature', 2017: family choruses; individuals identified by white throat patches.",
      "World Land Trust species account, 'Giant Otter': throat patches unique to each individual; family groups.",
    ],
  },
  "arapaima": {
    id: "arapaima", region: "Amazon", no: "03",
    title: "The arapaima", latin: "Arapaima gigas · pirarucu in Brazil, paiche in Peru",
    body: "One of the largest freshwater fish on earth, commonly around six feet long, and it breathes air. Every ten to twenty minutes it has to rise and gulp at the surface, with a sound like a cough.",
    rows: [
      { label: "Look for", text: "A red tail rolling at the surface of a still lagoon." },
      { label: "Listen for", text: "The gulp: a cough carried across flat water." },
      { label: "Ask your guide", text: "Which lagoons hold pirarucu." },
      { label: "When", text: "Any calm hour on a quiet lagoon." },
    ],
    image: { publicId: "samples/field-notes/arapaima-scene-watercolour", version: 1795437530, alt: "Watercolour of an arapaima rolling at the surface of dark water beside flooded forest", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "National Geographic, 'Arapaima': obligate air breather, underwater 10 to 20 minutes, cough-like gulp, commonly about six feet and 200 pounds.",
      "Smithsonian's National Zoo, 'Arapaima': air breathing through a modified swim bladder; red tail; pirarucu name.",
    ],
  },
  "giant-water-lily": {
    id: "giant-water-lily", region: "Amazon", no: "04",
    title: "The giant water lily", latin: "Victoria amazonica · backwaters and oxbow lakes",
    body: "Leaves up to two and a half metres across float on the backwaters, ribbed and spined underneath. The flower opens white on its first night, traps the beetles that come to it, and opens again pink on the second.",
    rows: [
      { label: "Look for", text: "Upturned rims with a notch that lets the rain run off." },
      { label: "Smell for", text: "Pineapple, from a first-night flower." },
      { label: "Ask your guide", text: "Whether a skiff can reach a lily lagoon at dusk." },
      { label: "When", text: "Dusk and after dark for flowers; any hour for the leaves." },
    ],
    image: { publicId: "samples/field-notes/giant-water-lily-scene-watercolour", version: 1795437573, alt: "Watercolour of giant Amazon water lily pads with one white and one pink flower on still water", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "Singapore National Parks Board, Flora and Fauna Web, 'Victoria amazonica': leaves to 2.5 m, upturned rims with a notch, spines beneath, white then pink night flowers pollinated by beetles.",
      "University of Bristol Botanic Garden, 'Giant Amazon Waterlily': pineapple scent; flowers hold their beetle pollinators until the second night.",
    ],
  },
  "macaws-clay-lick": {
    id: "macaws-clay-lick", region: "Amazon", no: "05",
    title: "Macaws at a clay lick", latin: "Scarlet and blue-and-yellow macaws · western Amazon",
    body: "Along rivers of the western Amazon, hundreds of parrots and macaws gather on bare clay cliffs to eat the soil. The best explanation is salt: the clay is far richer in sodium than the fruit and seeds they live on.",
    rows: [
      { label: "Look for", text: "Colour stacked on a red clay bank at the river's edge." },
      { label: "Listen for", text: "Quiet as they lift off, then every bird screaming at once." },
      { label: "Ask your guide", text: "Which lick is active, and when to be in the hide." },
      { label: "When", text: "Daily. Your guide will know the hour." },
    ],
    image: { publicId: "samples/field-notes/macaws-clay-lick-scene-watercolour", version: 1795437476, alt: "Watercolour of scarlet and blue-and-yellow macaws on a red clay riverbank cliff", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "Brightsmith, D., 'Macaw and Clay Lick Studies at Tambopata Research Center, Peru', AFA Watchbird: up to 1,000 parrots and macaws daily at a river cliff, eating sodium-rich clay.",
      "Texas A&M University, Tambopata Macaw Project, 'Texas A&M Professor Explores Why Peruvian Parrots Eat Clay', 2017: sodium as the driver; birds quiet at take-off, then screaming.",
      "Brightsmith, D. and Villalobos, E., 'Parrot behavior at a Peruvian clay lick', 2011: mixed-species use of the lick.",
    ],
  },
  "pygmy-marmoset": {
    id: "pygmy-marmoset", region: "Amazon", no: "06",
    title: "The pygmy marmoset", latin: "Cebuella pygmaea · western Amazon",
    body: "The smallest monkey in the world weighs about 119 grams. It gouges small holes in bark with its lower teeth and comes back to feed on the gum that wells up, until the family's tree is riddled with them.",
    rows: [
      { label: "Look for", text: "A trunk pocked with small holes, then a movement no bigger than your hand." },
      { label: "Listen for", text: "High, thin calls passed between the family." },
      { label: "Ask your guide", text: "Whether a gum tree is known near the river edge." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "samples/field-notes/pygmy-marmoset-scene-watercolour", version: 1795437507, alt: "Watercolour of a pygmy marmoset clinging to a tree trunk beside small gum holes", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "Primate Info Net, Wisconsin National Primate Research Center, 'Pygmy marmoset' factsheet: smallest monkey, 119 g and 136 mm on average; Brazil, Ecuador, Bolivia, Colombia and Peru.",
      "Handbook of the Mammals of the World (Plazi treatment), 'Cebuella pygmaea': about two-thirds of feeding time on tree exudates; gouged holes 10 to 20 mm wide.",
      "Encyclopedia of Life (Arkive), 'Cebuella pygmaea': lower teeth suited to gouging; trees riddled with holes; river-edge forest.",
    ],
  },
  "red-ruffed-lemur": {
    id: "red-ruffed-lemur", region: "Madagascar", no: "01",
    title: "The red ruffed lemur", latin: "Varecia rubra · Masoala peninsula",
    body: "This rust-red lemur lives in one corner of the earth: the rainforest of the Masoala peninsula and its edge. It feeds high in the canopy on fruit and nectar, and a group will break into a roar that carries half a mile when something alarms it.",
    rows: [
      { label: "Look for", text: "A red coat, black face and a white patch at the back of the neck." },
      { label: "Listen for", text: "A sudden chorus of barks and roars from the treetops." },
      { label: "Ask your guide", text: "Which trees are in fruit this week." },
      { label: "When", text: "Year round, by day." },
    ],
    image: { publicId: "samples/field-notes/red-ruffed-lemur-scene-watercolour", version: 1795436183, alt: "Watercolour of a red ruffed lemur on a mossy branch above the Masoala rainforest", width: 1000, height: 747, scene: true },
    where: { label: "Stay at Masoala Forest Lodge", href: "/stays/masoala-forest-lodge" },
    sources: [
      "Primate Info Net, Wisconsin National Primate Research Center, 'Ruffed lemur' factsheet: chestnut-red coat with a white nape; primary range the Masoala peninsula east of the Bay of Antongil.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Varecia rubra': upper canopy of rainforest; diet mostly fruit, nectar and pollen; black face, hands, feet and tail; alarm calls; active by day.",
      "Duke Lemur Center, 'Red Ruffed Lemur': loud calls heard up to half a mile away; primary rainforest canopy.",
    ],
  },
};

// Which notes sit on which country page (one or two per page).
export const COUNTRY_FIELD_NOTES: Record<string, string[]> = {
  madagascar: ["red-ruffed-lemur"],
  peru: ["macaws-clay-lick", "giant-river-otter"],
  "ecuador-galapagos": ["pygmy-marmoset"],
  brazil: ["arapaima", "giant-water-lily"],
};

// The Amazon voyages hub: the first note in full, the rest folded.
export const AMAZON_HUB_NOTES = ["pink-river-dolphin", "giant-river-otter", "arapaima", "giant-water-lily", "macaws-clay-lick", "pygmy-marmoset"];

// Species pages (/wildlife/[slug]): the note, then plain questions and answers for search and answer engines.
// Every answer restates facts already sourced on the note; photography lines are craft advice, not facts.
export type SpeciesPage = { noteId: string; title: string; answer: string; qa: { q: string; a: string }[]; photo: string[]; reach: { name: string; href: string; line: string }[] };
export const SPECIES_PAGES: Record<string, SpeciesPage> = {
  "pink-river-dolphin": {
    noteId: "pink-river-dolphin",
    title: "Where to See Pink River Dolphins in the Amazon",
    answer: "Pink river dolphins, or botos, live in the Amazon and Orinoco river systems. The best way to see them is from a small ship or skiff in the high-water months, when the river floods the forest and the dolphins swim in among the trees. James Wild & Co files six small ships on Amazon rivers in Peru, Ecuador and Brazil.",
    qa: [
      { q: "Why are pink river dolphins pink?", a: "Males are pinker than females and carry more scars from fighting. Colour also changes with age: the young are grey and adults turn pink or blotched pink." },
      { q: "When is the best time to see them?", a: "In the high-water months, when the river spills into the forest and the dolphins follow it in. In low water they keep to the main channels." },
      { q: "How do they swim between the trees?", a: "Their neck bones are not fused, so they can turn their heads and bend through flooded trunks and branches." },
      { q: "Can you swim with pink river dolphins?", a: "That depends on the ship, the river and the season. Ask the house and we will check with the operator before you book." },
    ],
    photo: [
      "They surface without warning and rarely leap. Watch for the breath, then hold on the same patch of water.",
      "Use a fast shutter and a mid-length zoom from a low skiff rather than the top deck.",
      "Flat morning water shows the colour best. Dark river water under forest shade hides it.",
    ],
    reach: [
      { name: "Aria Amazon", href: "/voyages/ships/aria-amazon", line: "Peru, 3 to 7 nights" },
      { name: "Aqua Nera", href: "/voyages/ships/aqua-nera", line: "Peru, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "MV Premium", href: "/voyages/ships/amazon-clipper-premium", line: "Brazil, 2 to 5 nights" },
    ],
  },
};

