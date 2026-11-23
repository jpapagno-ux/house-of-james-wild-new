// Field Notes (James, 22 Nov 2026): one short species note with a house watercolour, on destination and
// river pages. Every note files its `sources` here (research paper, museum or conservation body), never printed
// as a link. A note with no sources must not be placed on a page: tests/field-notes.test.ts fails on it.
// Watercolours are house illustrations made with Cloudinary AI, filed under jwco/illustrations/field-notes; a scene keeps its painted setting.
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
    image: { publicId: "jwco/illustrations/field-notes/pink-river-dolphin", version: 1795449968, alt: "Watercolour of a pink river dolphin surfacing in dark water beside flooded forest", width: 1000, height: 747, scene: true },
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
    image: { publicId: "jwco/illustrations/field-notes/giant-river-otter", version: 1795449975, alt: "Watercolour of a giant river otter raised from dark lake water, showing its pale throat patch", width: 1000, height: 747, scene: true },
    where: { label: "See the Amazon ships", href: "/voyages/amazon#ships-h" },
    sources: [
      "World Land Trust, 'Giant Otter': IUCN Red List status Endangered.",
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
    image: { publicId: "jwco/illustrations/field-notes/arapaima", version: 1795449973, alt: "Watercolour of an arapaima rolling at the surface of dark water beside flooded forest", width: 1000, height: 747, scene: true },
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
    image: { publicId: "jwco/illustrations/field-notes/giant-water-lily", version: 1795449976, alt: "Watercolour of giant Amazon water lily pads with one white and one pink flower on still water", width: 1000, height: 747, scene: true },
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
    image: { publicId: "jwco/illustrations/field-notes/macaws-clay-lick", version: 1795449971, alt: "Watercolour of scarlet and blue-and-yellow macaws on a red clay riverbank cliff", width: 1000, height: 747, scene: true },
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
    image: { publicId: "jwco/illustrations/field-notes/pygmy-marmoset", version: 1795449972, alt: "Watercolour of a pygmy marmoset clinging to a tree trunk beside small gum holes", width: 1000, height: 747, scene: true },
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
    image: { publicId: "jwco/illustrations/field-notes/red-ruffed-lemur", version: 1795449969, alt: "Watercolour of a red ruffed lemur on a mossy branch above the Masoala rainforest", width: 1000, height: 747, scene: true },
    where: { label: "Stay at Masoala Forest Lodge", href: "/stays/masoala-forest-lodge" },
    sources: [
      "Marwell Wildlife, 'Red-ruffed lemur': Critically Endangered; threats from hunting, logging and cyclones on the Masoala peninsula; protected in Masoala National Park.",
      "Primate Info Net, Wisconsin National Primate Research Center, 'Ruffed lemur' factsheet: chestnut-red coat with a white nape; primary range the Masoala peninsula east of the Bay of Antongil.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Varecia rubra': upper canopy of rainforest; diet mostly fruit, nectar and pollen; black face, hands, feet and tail; alarm calls; active by day.",
      "Duke Lemur Center, 'Red Ruffed Lemur': loud calls heard up to half a mile away; primary rainforest canopy.",
    ],
  },
  "black-lemur": {
    id: "black-lemur", region: "Madagascar", no: "02",
    title: "The black lemur", latin: "Eulemur macaco · Nosy Komba, Nosy Be and the far northwest",
    body: "Only the males are black. Females are chestnut brown with white tufts at the ears, and a male is born his mother's colour and turns black within weeks. They live in the far northwest, including the islands of Nosy Be and Nosy Komba.",
    rows: [
      { label: "Look for", text: "A black male and a brown female sitting side by side." },
      { label: "Listen for", text: "Movement overhead at any hour: they are active by day and by night." },
      { label: "Ask your guide", text: "Why they rub millipedes into their fur." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/black-lemur", version: 1795450026, alt: "Watercolour of a black male and a brown, white-tufted female black lemur on a branch", width: 1000, height: 747, scene: true },
    where: { label: "Stay at Tsara Komba", href: "/stays/time-tide-tsara-komba" },
    sources: [
      "Duke Lemur Center, 'Common Black Lemur': males solid black, females brown with white ear tufts; males born the female's colour and turn black within 5 to 6 weeks; millipede rubbing.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Eulemur macaco': sexual dichromatism; active by day and night; Nosy Be and Nosy Komba.",
      "Handbook of the Mammals of the World (Plazi treatment), 'Eulemur macaco': distribution on Nosy Be, Nosy Komba and the coast north-east of Ambanja.",
    ],
  },
  "aye-aye": {
    id: "aye-aye", region: "Madagascar", no: "03",
    title: "The aye-aye", latin: "Daubentonia madagascariensis · the largest nocturnal primate",
    body: "The aye-aye hunts by sound. It taps along a branch with one long, thin middle finger, listens for grubs moving under the bark, gnaws a hole and hooks them out with the same finger. It works only at night.",
    rows: [
      { label: "Look for", text: "Large bare ears and a bushy tail longer than its body." },
      { label: "Listen for", text: "Quick tapping on dead wood after dark." },
      { label: "Ask your guide", text: "Whether a night walk is possible during your stay." },
      { label: "When", text: "After dark." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/aye-aye", version: 1795449848, alt: "Watercolour of an aye-aye at night tapping a mossy branch with its long middle finger", width: 1000, height: 747, scene: true },
    where: { label: "Plan Madagascar with James", href: "/plan?destination=madagascar" },
    sources: [
      "WWF, 'Meet the aye-aye, the world's weirdest primate': Endangered; threats are hunting and loss of habitat.",
      "Duke Lemur Center, 'Aye-aye (Daubentonia madagascariensis)': world's largest nocturnal primate; large ears; skeletal middle finger; tail longer than the body.",
      "National Geographic, 'Aye-aye': taps trees with the long middle finger, listens for larvae under the bark and fishes them out; nocturnal.",
      "Erickson, C. J. et al., 'Percussive foraging: stimuli for prey location by aye-ayes', Duke University: taps wood to find cavities, then gnaws to extract prey.",
    ],
  },
  "helmet-vanga": {
    id: "helmet-vanga", region: "Madagascar", no: "04",
    title: "The helmet vanga", latin: "Euryceros prevostii · northeast rainforest",
    body: "A black and chestnut bird with a massive arched bill of pale blue, found only in the rainforests of northeast Madagascar. Masoala National Park is one of the few places it is recorded, and birders cross the world for one sighting.",
    rows: [
      { label: "Look for", text: "The blue bill in the dim understorey, often among a mixed flock of vangas." },
      { label: "Listen for", text: "A short call from inside a passing flock." },
      { label: "Ask your guide", text: "Whether a nest is known this season." },
      { label: "When", text: "Any day in the forest. Patience helps." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/helmet-vanga", version: 1795449879, alt: "Watercolour of a helmet vanga with its large pale blue bill on a mossy rainforest branch", width: 1000, height: 747, scene: true },
    where: { label: "Stay at Masoala Forest Lodge", href: "/stays/masoala-forest-lodge" },
    sources: [
      "BirdLife International, species factsheet 'Helmet Vanga Euryceros prevostii': restricted to north-eastern Madagascar; black with massive pale blue bill and chestnut mantle; recorded in Masoala National Park.",
      "Safford, R., 'Photospot: Helmet Vanga', Bulletin of the African Bird Club: primary rainforest, often in mixed-species flocks with other large vangas; Masoala and Marojejy.",
      "La Marca, G. and Thorstrom, R., 'Breeding biology, diet and vocalization of the Helmet Vanga on the Masoala Peninsula, Madagascar', Ostrich 71, 2000.",
    ],
  },
  "humpback-whale": {
    id: "humpback-whale", region: "Madagascar", no: "05",
    title: "Humpbacks of Antongil Bay", latin: "Megaptera novaeangliae · the southern winter",
    body: "Each southern winter, humpback whales come up from Antarctic feeding grounds to breed and calve in Madagascar's coastal waters. Antongil Bay, beside Masoala, is one of the main places they are studied. The first arrive off the south in May and the last leave in December.",
    rows: [
      { label: "Look for", text: "A blow on the horizon, then a tail lifting before a dive." },
      { label: "Listen for", text: "Song through the hull on a still day." },
      { label: "Ask your guide", text: "How close the boats may go, and why." },
      { label: "When", text: "The southern winter. Ask the house for the bay's best weeks." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/humpback-whale-antongil-bay", version: 1795449908, alt: "Watercolour of a humpback whale breaching in a calm bay below forested hills", width: 1000, height: 747, scene: true },
    where: { label: "Stay at Masoala Forest Lodge", href: "/stays/masoala-forest-lodge" },
    sources: [
      "Wildlife Conservation Society Madagascar, news release on satellite tagging: about 7,000 to 8,000 humpbacks estimated to migrate to Madagascar each year; strictly protected under Malagasy fisheries law.",
      "Wildlife Conservation Society Madagascar, 'Humpback whale': migration from Antarctic feeding grounds, arriving off southern Madagascar in May, last whales leaving in December; breeding and calving habitat including Antongil Bay; studied by WCS since 1996.",
      "Royal Society Open Science (2018), humpback song study with recordings at Antongil Bay, Madagascar.",
    ],
  },
  "mouse-lemur": {
    id: "mouse-lemur", region: "Madagascar", no: "06",
    title: "The mouse lemur", latin: "Genus Microcebus · the smallest primates",
    body: "Mouse lemurs are the smallest primates on earth. The smallest of them, Madame Berthe's, averages about 30 grams. They sleep aloft by day, forage at night for insects, fruit and flowers, and store fat in their tails for the lean months.",
    rows: [
      { label: "Look for", text: "Two points of eyeshine in a headlamp beam." },
      { label: "Ask your guide", text: "Which species lives in this forest." },
      { label: "Range", text: "Different species across the island. Madame Berthe's lives in the dry forests of the west." },
      { label: "When", text: "After dark." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/mouse-lemur", version: 1795449955, alt: "Watercolour of a mouse lemur with large shining eyes on a twig at night", width: 1000, height: 747, scene: true },
    where: { label: "Plan Madagascar with James", href: "/plan?destination=madagascar" },
    sources: [
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Microcebus berthae': smallest known living primate, average 30.6 g; dry deciduous forest of western Madagascar; tapetum lucidum for night foraging.",
      "National Geographic, 'Mouse Lemurs': sleep aloft by day, forage at night for insects, fruit and flowers; fat stored in the tail.",
      "Animal Diversity Web, 'Cheirogaleidae': nocturnal and arboreal; fat stored in the tail to carry them through dry seasons.",
    ],
  },
  "galapagos-giant-tortoise": {
    id: "galapagos-giant-tortoise", region: "Galápagos", no: "01",
    title: "The giant tortoise", latin: "Chelonoidis · the animal the islands are named for",
    body: "The islands take their name from it: galápago is an old Spanish word for tortoise. It can live beyond a hundred years. Shells come in two shapes, domed on the large, humid islands and saddle-backed where the animal has to stretch up to reach its food.",
    rows: [
      { label: "Look for", text: "The shell: domed in the misty highlands, saddle-backed on the dry islands." },
      { label: "Pace", text: "Slow. They rest for nearly sixteen hours a day." },
      { label: "Ask your guide", text: "Which species lives on this island. There are thirteen." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/galapagos-giant-tortoise", version: 1795460423, alt: "Watercolour of a Galápagos giant tortoise walking through highland grass and ferns", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "Galapagos Conservation Trust, 'Galapagos giant tortoise': name of the islands; lifespan 100 years and more; domed and saddle-backed shells and the islands each suits; Endangered.",
      "National Geographic, 'Galápagos tortoise': 13 living species; saddleback shells let the neck reach tall cacti; rests nearly 16 hours a day; hunting by sailors.",
      "San Diego Zoo Wildlife Alliance Library, 'Galápagos Giant Tortoises fact sheet': shell types and size.",
    ],
  },
  "marine-iguana": {
    id: "marine-iguana", region: "Galápagos", no: "02",
    title: "The marine iguana", latin: "Amblyrhynchus cristatus · the only lizard that feeds at sea",
    body: "No other lizard on earth feeds in the sea. It dives to graze algae off the rocks, hauls out on black lava to warm up in the sun, and sneezes out the salt it has swallowed through glands in its nose.",
    rows: [
      { label: "Look for", text: "A white crust of salt on a dark head, and whole piles of them basking together." },
      { label: "Listen for", text: "The snort of a salty sneeze." },
      { label: "Ask your guide", text: "When the big males swim out to feed." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/marine-iguana", version: 1795460446, alt: "Watercolour of a marine iguana basking on black lava beside the surf", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "Encyclopaedia Britannica, 'marine iguana': the one living lizard that feeds on algae in the sea; basks on lava rocks.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Amblyrhynchus cristatus': feeds almost only on marine algae; salt excreted from a nasal gland; basking to regulate temperature.",
      "Oceana Marine Life Encyclopedia, 'Marine Iguana': restricted to the Galápagos; salt glands; dives of more than 20 metres.",
      "National Geographic, 'Marine Iguana': Vulnerable on the IUCN Red List.",
    ],
  },
  "blue-footed-booby": {
    id: "blue-footed-booby", region: "Galápagos", no: "03",
    title: "The blue-footed booby", latin: "Sula nebouxii · half the world's pairs nest here",
    body: "The bluer the feet, the better the match. The colour comes from pigments in the fish it eats, and a male shows his feet to a female with a slow, high-stepping strut. About half of all breeding pairs nest in the Galápagos.",
    rows: [
      { label: "Look for", text: "The dance on land, and at sea a bird folding its wings and dropping from as high as 80 feet." },
      { label: "Listen for", text: "The male whistles. The female honks." },
      { label: "Ask your guide", text: "Which islands have pairs courting now. They breed when conditions suit." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/blue-footed-booby", version: 1795460470, alt: "Watercolour of a blue-footed booby lifting one bright blue foot in its courtship dance", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "National Geographic, 'Blue-footed booby': foot display in courtship; plunge dives from as high as 80 feet; about half of all breeding pairs in the Galápagos.",
      "PBS Nature, 'Blue-footed booby': foot colour from carotenoids in the fish diet; brighter feet and mating success.",
      "Cornell Lab of Ornithology, All About Birds, 'Blue-footed Booby': courtship display; ground nest; diving.",
      "Cornell University, Galápagos curriculum, 'The Blue-footed Booby Mating Dance': opportunistic breeding; female honks and male whistles.",
    ],
  },
  "galapagos-penguin": {
    id: "galapagos-penguin", region: "Galápagos", no: "04",
    title: "The Galápagos penguin", latin: "Spheniscus mendiculus · the only penguin north of the equator",
    body: "This is the only penguin found north of the equator. About 95 percent live on Isabela and Fernandina in the west, where cold, rich currents reach the islands. It is one of the smallest penguins, and fewer than 2,000 remain.",
    rows: [
      { label: "Look for", text: "A thin white line curving from the eye round to the chin." },
      { label: "Where", text: "The western islands, Isabela and Fernandina, with small colonies elsewhere." },
      { label: "Ask your guide", text: "Whether your route reaches the west." },
      { label: "When", text: "Year round. They breed whenever cold water brings food." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/galapagos-penguin", version: 1795460493, alt: "Watercolour of two Galápagos penguins on black lava beside turquoise water", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "BirdLife International, species factsheet 'Galapagos Penguin Spheniscus mendiculus': most northerly penguin; about 95% on Isabela and Fernandina; breeds through the year with upwelling; Endangered.",
      "WWF, 'Galápagos penguins': only penguin north of the equator; population fewer than 2,000.",
      "Galapagos Conservation Trust, 'The Galapagos Penguin': Humboldt and Cromwell currents; distribution.",
      "Encyclopaedia Britannica, 'Galapagos penguin': C-shaped band of white from eye to chin; among the smallest penguins; small colonies on Bartolomé, Santiago and Floreana.",
    ],
  },
  "waved-albatross": {
    id: "waved-albatross", region: "Galápagos", no: "05",
    title: "The waved albatross", latin: "Phoebastria irrorata · Española Island",
    body: "Almost every waved albatross on earth nests on one island, Española. Pairs stay together for life and greet each other with a long dance of bowing, bill circling and bill clacking. The wings span seven to eight feet.",
    rows: [
      { label: "Look for", text: "Two birds fencing with their bills on the clifftop." },
      { label: "Listen for", text: "Honking, hooting and the clatter of bills." },
      { label: "Ask your guide", text: "Whether your route calls at Española in season." },
      { label: "When", text: "Roughly April to December, on Española." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/waved-albatross", version: 1795460516, alt: "Watercolour of two waved albatrosses touching bills in their courtship dance on a clifftop", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "American Bird Conservancy, 'Waved Albatross': 7 to 8 foot wingspan; breeds on Española with a small colony on Isla de la Plata; noisy displays with sky-pointing, bowing and bill clacking; Critically Endangered.",
      "BirdLife International, species factsheet 'Waved Albatross Phoebastria irrorata': breeds primarily on the south coast of Española.",
      "Galápagos Conservancy, on the waved albatross nesting season: returns each year to Española; courtship dance and bill rattling; single egg.",
      "EDGE of Existence, Zoological Society of London, 'Waved albatross': pairs mate for life.",
      "Animal Diversity Web, 'Phoebastria irrorata': young leave the island by mid-December.",
    ],
  },
  "galapagos-sea-lion": {
    id: "galapagos-sea-lion", region: "Galápagos", no: "06",
    title: "The Galápagos sea lion", latin: "Zalophus wollebaeki · the mammal you will see most",
    body: "This is the most common mammal in the islands and the smallest of the sea lions. It breeds only here and on one island off the mainland. The young are curious enough to swim up to a snorkeller, and it is listed as Endangered.",
    rows: [
      { label: "Look for", text: "Pups. There are dependent pups in the colonies in every month." },
      { label: "In the water", text: "The young ones come to you. Let them, and keep your hands to yourself." },
      { label: "Ask your guide", text: "How close you may go on the beach, and why." },
      { label: "When", text: "Year round." },
    ],
    image: { publicId: "jwco/illustrations/field-notes/galapagos-sea-lion", version: 1795460540, alt: "Watercolour of a Galápagos sea lion mother and pup nose to nose on a sand beach", width: 1000, height: 747, scene: true },
    where: { label: "See the Galápagos ships", href: "/voyages/galapagos#ships-h" },
    sources: [
      "WWF, 'Sea lion': the most common mammal in the Galápagos.",
      "BBC Wildlife (Discover Wildlife), Galápagos sea lion guide written with the Galapagos Conservation Trust: smallest sea lion species; inquisitive and playful underwater; breeds in the Galápagos and on Isla de la Plata; Endangered; population fell 60 to 65 percent from 1978 to 2001.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Zalophus wollebaeki': endemic to the Galápagos.",
    ],
  },
};

// Which notes sit on which country page (one or two per page).
export const COUNTRY_FIELD_NOTES: Record<string, string[]> = {
  madagascar: ["red-ruffed-lemur", "black-lemur", "aye-aye", "helmet-vanga", "humpback-whale", "mouse-lemur"],
  peru: ["macaws-clay-lick", "giant-river-otter"],
  "ecuador-galapagos": ["pygmy-marmoset"],
  brazil: ["arapaima", "giant-water-lily"],
};

// The Amazon voyages hub: the first note in full, the rest folded.
export const AMAZON_HUB_NOTES = ["pink-river-dolphin", "giant-river-otter", "arapaima", "giant-water-lily", "macaws-clay-lick", "pygmy-marmoset"];

// The Galápagos voyages hub: the first note in full, the rest folded.
export const GALAPAGOS_HUB_NOTES = ["galapagos-giant-tortoise", "marine-iguana", "blue-footed-booby", "galapagos-penguin", "waved-albatross", "galapagos-sea-lion"];

// Species pages (/wildlife/[slug]): the note, then plain questions and answers for search and answer engines.
// Every answer restates facts already sourced on the note; photography lines are craft advice, not facts.
export type SpeciesPage = { noteId: string; title: string; answer: string; qa: { q: string; a: string }[]; photo: string[]; parent?: { name: string; path: string }[]; reachTitle?: string; reach: { name: string; href: string; line: string }[] };
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
  "giant-river-otter": {
    noteId: "giant-river-otter",
    title: "Where to See Giant River Otters in the Amazon",
    answer: "Giant river otters live on slow rivers, creeks and oxbow lakes across the Amazon basin. They are the longest of the weasel family, up to 1.8 metres, and hunt fish in noisy family groups. The surest way to see them is from a quiet skiff or canoe on a lake where a family is resident. James Wild & Co files small ships and lodges on Amazon waters in Peru, Ecuador and Brazil.",
    qa: [
      { q: "How big is a giant river otter?", a: "Up to 1.8 metres from nose to tail, which makes it the longest member of the weasel family and the largest freshwater otter." },
      { q: "How do researchers tell giant otters apart?", a: "By the pale patch on the throat. Each otter's patch is different, so a photograph of it identifies the animal." },
      { q: "Do giant river otters live in groups?", a: "Yes. Families of three to eight hunt together and call to each other constantly. Each family's chorus is distinct." },
      { q: "Are giant river otters endangered?", a: "The IUCN Red List classes the giant otter as Endangered. Threats include habitat loss and illegal hunting." },
    ],
    photo: [
      "Wait for the periscope: an otter lifts its head and chest clear of the water to look at the boat, and that is when the throat patch shows.",
      "Stay low and still in the skiff. A family that is not pressed will often come closer on its own.",
      "They are fast and dark against dark water. Use a fast shutter and expose for the face, not the lake.",
    ],
    reachTitle: "Lodges and Small Ships on Otter Waters",
    reach: [
      { name: "Inkaterra Reserva Amazonica", href: "/stays/inkaterra-reserva-amazonica", line: "Peru, lodge" },
      { name: "Inkaterra Hacienda Concepcion", href: "/stays/inkaterra-hacienda-concepcion", line: "Peru, lodge" },
      { name: "Napo Wildlife Center", href: "/stays/napo-wildlife-center", line: "Ecuador, lodge" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
    ],
  },
  "arapaima": {
    noteId: "arapaima",
    title: "Where to See Arapaima, the Giant Fish of the Amazon",
    answer: "The arapaima, called pirarucu in Brazil and paiche in Peru, is one of the largest freshwater fish on earth. It breathes air and has to surface every ten to twenty minutes, so on a calm lagoon you hear it before you see it. James Wild & Co files small ships on Amazon rivers in Peru, Ecuador and Brazil.",
    qa: [
      { q: "How big does an arapaima get?", a: "Commonly about six feet long and 200 pounds. The largest recorded reach around ten feet and 440 pounds, though fish that size have not been reported for many years." },
      { q: "Why does the arapaima come up for air?", a: "It is an air breather. Its gills are small, and it takes in air through a modified swim bladder that works as a lung, so it must surface every ten to twenty minutes." },
      { q: "What does pirarucu mean?", a: "It is the fish's name in Brazil, from the Tupi language, and translates roughly as red fish. The tail is red." },
      { q: "Where does the arapaima live?", a: "In the rivers, lakes and flooded forest of the Amazon basin. When the rivers overflow, the fish spread out into the flooded forest." },
    ],
    photo: [
      "Listen first. The gulp sounds like a cough, and the ring on the water tells you where to point.",
      "Pick one stretch of lagoon and wait with the camera up. The roll at the surface lasts a second or two.",
      "Low, flat light shows the red in the tail. Midday glare off the water hides it.",
    ],
    reachTitle: "Small Ships on These Rivers",
    reach: [
      { name: "Aria Amazon", href: "/voyages/ships/aria-amazon", line: "Peru, 3 to 7 nights" },
      { name: "Aqua Nera", href: "/voyages/ships/aqua-nera", line: "Peru, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "MV Premium", href: "/voyages/ships/amazon-clipper-premium", line: "Brazil, 2 to 5 nights" },
    ],
  },
  "giant-water-lily": {
    noteId: "giant-water-lily",
    title: "Where to See the Giant Amazon Water Lily",
    answer: "The giant water lily, Victoria amazonica, grows in the backwaters and oxbow lakes of the Amazon. Its floating leaves reach two and a half metres across. The flower opens white on its first night and pink on its second, so the best time to visit a lily lagoon is dusk. James Wild & Co files small ships on Amazon rivers in Peru, Ecuador and Brazil.",
    qa: [
      { q: "How big are the leaves of the giant water lily?", a: "Up to about two and a half metres across, with upturned rims and a notch that lets rainwater run off. The underside is ribbed and covered in spines." },
      { q: "Why does the flower change colour?", a: "It opens white and scented on the first night to draw in beetles, closes around them, then opens pink on the second night and lets them go, dusted with pollen." },
      { q: "What does the flower smell of?", a: "Pineapple, on its first night." },
      { q: "When is the best time of day to see the flowers?", a: "From dusk into the night. The flower opens after dark; the leaves can be seen at any hour." },
    ],
    photo: [
      "Go at dusk and stay into the dark. A first-night flower is white; a second-night flower is pink.",
      "Shoot from as high as the skiff allows, so the round leaves read as circles and not as ovals.",
      "Still water gives you the reflection. Ask the boatman to cut the engine early and drift in.",
    ],
    reachTitle: "Small Ships on These Rivers",
    reach: [
      { name: "Aria Amazon", href: "/voyages/ships/aria-amazon", line: "Peru, 3 to 7 nights" },
      { name: "Aqua Nera", href: "/voyages/ships/aqua-nera", line: "Peru, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "MV Premium", href: "/voyages/ships/amazon-clipper-premium", line: "Brazil, 2 to 5 nights" },
    ],
  },
  "macaws-clay-lick": {
    noteId: "macaws-clay-lick",
    title: "Where to See Macaws at a Clay Lick in the Amazon",
    answer: "Along rivers of the western Amazon, hundreds of macaws and parrots gather each day on bare clay cliffs to eat the soil. The best-studied licks are on the Tambopata River in southeast Peru. You watch from a hide across the water, and your guide will know the hour. James Wild & Co files lodges and small ships in the western Amazon of Peru and Ecuador.",
    qa: [
      { q: "Why do macaws eat clay?", a: "The leading explanation is salt. Clay at the licks is far richer in sodium than the fruit and seeds the birds live on, and the western Amazon is short of it." },
      { q: "How many birds come to a clay lick?", a: "At the large lick beside the Tambopata Research Center in Peru, up to 1,000 parrots and macaws have been counted in a day." },
      { q: "Where are the clay licks?", a: "Along exposed river banks in the western Amazon basin. Parrots elsewhere in the world do not gather to eat clay in this way." },
      { q: "Which lodge should I choose for a clay lick?", a: "Ask the house. Licks go quiet and come back, and we will check with the lodge which one is active before you book." },
    ],
    photo: [
      "Be in the hide before the birds arrive and stay seated. They are wary on the approach and one movement empties the cliff.",
      "A long lens for birds on the clay, and a second, wider frame ready for the moment the whole flock lifts.",
      "The lift is silent for a second, then loud. Keep shooting through it.",
    ],
    reachTitle: "Lodges and Small Ships in the Western Amazon",
    reach: [
      { name: "Inkaterra Reserva Amazonica", href: "/stays/inkaterra-reserva-amazonica", line: "Peru, lodge" },
      { name: "Inkaterra Hacienda Concepcion", href: "/stays/inkaterra-hacienda-concepcion", line: "Peru, lodge" },
      { name: "Napo Wildlife Center", href: "/stays/napo-wildlife-center", line: "Ecuador, lodge" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
    ],
  },
  "pygmy-marmoset": {
    noteId: "pygmy-marmoset",
    title: "Where to See the Pygmy Marmoset, the World's Smallest Monkey",
    answer: "The pygmy marmoset is the smallest monkey in the world, at about 119 grams. It lives in river-edge forest in the western Amazon, in Brazil, Colombia, Ecuador, Peru and Bolivia, and feeds mostly on tree gum. The way to find one is to find its tree: a trunk riddled with small holes. James Wild & Co files lodges and small ships in the western Amazon of Peru and Ecuador.",
    qa: [
      { q: "How small is a pygmy marmoset?", a: "About 119 grams and 136 millimetres from head to rump on average, with a longer tail. It fits in a hand." },
      { q: "What do pygmy marmosets eat?", a: "Mostly tree gum and sap. They gouge small holes in bark with their lower teeth and return to feed on what wells up. They also eat insects." },
      { q: "Where do pygmy marmosets live?", a: "In the rainforests of the western Amazon basin, usually in forest along river edges." },
      { q: "How do you find one?", a: "Look for the tree first. Each family keeps one or more trunks riddled with gum holes, and the monkeys come back to them." },
    ],
    photo: [
      "Find the gum tree and wait. The animals return to the same holes, so the tree is your frame.",
      "They cling upright to the trunk. Turn the camera on its side.",
      "They are tiny and the forest is dim. Use the longest lens you can hold steady and raise the sensitivity.",
    ],
    reachTitle: "Lodges and Small Ships in the Western Amazon",
    reach: [
      { name: "Inkaterra Reserva Amazonica", href: "/stays/inkaterra-reserva-amazonica", line: "Peru, lodge" },
      { name: "Inkaterra Hacienda Concepcion", href: "/stays/inkaterra-hacienda-concepcion", line: "Peru, lodge" },
      { name: "Napo Wildlife Center", href: "/stays/napo-wildlife-center", line: "Ecuador, lodge" },
      { name: "Anakonda", href: "/voyages/ships/anakonda-amazon-cruise", line: "Ecuador, 3 to 7 nights" },
      { name: "Delfin III", href: "/voyages/ships/delfin-iii", line: "Peru, 3 to 4 nights" },
    ],
  },
  "red-ruffed-lemur": {
    noteId: "red-ruffed-lemur",
    title: "Where to See the Red Ruffed Lemur in Madagascar",
    answer: "The red ruffed lemur lives in one corner of the earth: the rainforest of the Masoala peninsula in northeast Madagascar, east of Antongil Bay. It keeps to the upper canopy, eats mostly fruit, and is active by day, so you find it by ear first. James Wild & Co files Masoala Forest Lodge on the peninsula.",
    qa: [
      { q: "Where does the red ruffed lemur live?", a: "Its main range is the Masoala peninsula, east of the Bay of Antongil, in the canopy of primary rainforest. It is found nowhere else in the wild." },
      { q: "What does it eat?", a: "Mostly fruit, with nectar and pollen. Feeding on nectar, it carries pollen from flower to flower and helps pollinate some of the forest's hardwood trees." },
      { q: "How loud is a red ruffed lemur?", a: "Very. A group's calls can be heard up to half a mile away, and they use alarm calls to warn each other of predators." },
      { q: "Is the red ruffed lemur endangered?", a: "Yes. It is listed as Critically Endangered, with logging, hunting and cyclones on the peninsula among the threats." },
    ],
    photo: [
      "Follow the noise. When a group calls, your guide can walk you under them before they move on.",
      "They sit high. Bring your longest lens and expect to shoot up into bright sky; expose for the fur, not the gaps in the leaves.",
      "A fruiting tree is worth an hour. They come back to it.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Where the House Sends You",
    reach: [
      { name: "Masoala Forest Lodge", href: "/stays/masoala-forest-lodge", line: "Masoala peninsula, Antongil Bay" },
    ],
  },
  "black-lemur": {
    noteId: "black-lemur",
    title: "Where to See Black Lemurs in Madagascar",
    answer: "Black lemurs live in the far northwest of Madagascar, including the islands of Nosy Be and Nosy Komba. Only the males are black; the females are brown with white ear tufts. They are active by day and by night, so they are among the easier lemurs to see. James Wild & Co files Tsara Komba on Nosy Komba.",
    qa: [
      { q: "Why are only the males black?", a: "The species is sexually dichromatic: males are solid black and females are brown with white tufts around the ears. A male is born his mother's colour and turns black within five to six weeks." },
      { q: "Where do black lemurs live?", a: "In northwest Madagascar, on the islands of Nosy Be and Nosy Komba and in the coastal forests of the mainland opposite." },
      { q: "When are black lemurs active?", a: "Around the clock. They are active in bursts through both day and night." },
      { q: "Why do black lemurs rub millipedes on their fur?", a: "They gently bite a millipede so it releases its toxins, then rub it through their fur. The toxins work as an insect repellent." },
    ],
    photo: [
      "Photograph a pair together. The black male beside the brown female is the picture that explains the species.",
      "Black fur in forest shade loses its detail. Expose for the male and let the background go bright.",
      "They are often low and unhurried. A short zoom is enough; leave the long lens behind.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Where the House Sends You",
    reach: [
      { name: "Time + Tide Tsara Komba", href: "/stays/time-tide-tsara-komba", line: "Nosy Komba, near Nosy Be" },
    ],
  },
  "aye-aye": {
    noteId: "aye-aye",
    title: "Where to See an Aye-Aye in Madagascar",
    answer: "The aye-aye lives only in Madagascar and only comes out at night. It is the world's largest nocturnal primate, and it finds its food by tapping on wood with one long, thin finger and listening. Seeing one takes a night walk with a guide who knows where they feed. Ask the house which of its Madagascar stays can arrange one.",
    qa: [
      { q: "What is the aye-aye's long finger for?", a: "It taps along a branch with its thin middle finger, listens for insect larvae moving under the bark, gnaws a hole and hooks the larvae out with the same finger." },
      { q: "Is the aye-aye a lemur?", a: "Yes. It is a lemur, the largest primate that is active only at night, with large ears, a bushy tail longer than its body and front teeth that never stop growing." },
      { q: "Where does the aye-aye sleep?", a: "By day it curls up in a ball-shaped nest of leaves and branches in the fork of a large tree." },
      { q: "Is the aye-aye endangered?", a: "Yes. It is listed as Endangered. Hunting and loss of forest are the main threats." },
    ],
    photo: [
      "This is a night subject. Ask your guide what light is allowed, and use it; do not use flash on the animal without asking.",
      "Raise the sensitivity and accept the grain. A sharp, grainy aye-aye is better than a smooth blur.",
      "Listen for the tapping before you look. It tells you which branch to frame.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Stays the House Files in Madagascar",
    reach: [
      { name: "Masoala Forest Lodge", href: "/stays/masoala-forest-lodge", line: "Masoala peninsula, Antongil Bay" },
      { name: "Expedition Blue Lagoon", href: "/stays/expedition-blue-lagoon", line: "Cap Masoala, by boat and kayak" },
      { name: "Miavana by Time + Tide", href: "/stays/miavana-by-time-tide", line: "Private island, northeast coast" },
      { name: "Time + Tide Tsara Komba", href: "/stays/time-tide-tsara-komba", line: "Nosy Komba, near Nosy Be" },
    ],
  },
  "helmet-vanga": {
    noteId: "helmet-vanga",
    title: "Where to See the Helmet Vanga in Madagascar",
    answer: "The helmet vanga is found only in the rainforests of northeast Madagascar. It is black and chestnut with a massive pale blue bill, and it is recorded in a handful of protected forests, Masoala National Park among them. James Wild & Co files Masoala Forest Lodge on the Masoala peninsula.",
    qa: [
      { q: "Where does the helmet vanga live?", a: "Only in the lowland and lower mountain rainforests of northeast Madagascar. It is recorded in Masoala, Marojejy and Mantadia national parks." },
      { q: "What does a helmet vanga look like?", a: "Black, with a chestnut back and tail and a huge arched bill of pale blue. It is hard to mistake for anything else." },
      { q: "How do you find one?", a: "It is a bird of primary rainforest and often travels in mixed flocks with other large vangas. A guide who knows the flocks, or a known nest, is the way in." },
      { q: "Why do birders travel so far for it?", a: "It is rare, local, and lives in forest that was once an expedition to reach. For a long time most birdwatchers visiting Madagascar never saw one." },
    ],
    photo: [
      "The forest floor is dark. Open the lens wide, raise the sensitivity and brace against a tree.",
      "The bill is the picture. Wait for the bird to turn side on.",
      "When a mixed flock passes, stay put and let it move through you. Chasing it loses the bird.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Where the House Sends You",
    reach: [
      { name: "Masoala Forest Lodge", href: "/stays/masoala-forest-lodge", line: "Masoala peninsula, Antongil Bay" },
      { name: "Expedition Blue Lagoon", href: "/stays/expedition-blue-lagoon", line: "Cap Masoala, by boat and kayak" },
    ],
  },
  "humpback-whale": {
    noteId: "humpback-whale",
    title: "When and Where to See Humpback Whales in Madagascar",
    answer: "Humpback whales come to Madagascar each southern winter to breed and calve. The first arrive off the south in May and the last leave in December. Antongil Bay in the northeast and the waters around Nosy Be in the northwest are among the places they gather. James Wild & Co files stays on both coasts.",
    qa: [
      { q: "When is whale season in Madagascar?", a: "The first humpbacks arrive off southern Madagascar in May and the last leave in December. Ask the house for the best weeks in the bay you choose." },
      { q: "Why do humpbacks come to Madagascar?", a: "To breed and to calve. They migrate up from feeding grounds in the Antarctic to the island's coastal waters." },
      { q: "How many whales come?", a: "Wildlife Conservation Society scientists estimate that about 7,000 to 8,000 humpbacks migrate to Madagascar each year." },
      { q: "Are the whales protected?", a: "Yes. Humpbacks are strictly protected under Malagasy fisheries law, and conservation scientists have studied them in Antongil Bay since 1996." },
    ],
    photo: [
      "Watch the water after a breach. Humpbacks often breach more than once, and the second is the one you are ready for.",
      "Use a fast shutter and keep both eyes open. A whale gives no warning.",
      "Keep the horizon level and leave room in the frame. A breach is taller than you expect.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Stays on the Whale Coasts",
    reach: [
      { name: "Masoala Forest Lodge", href: "/stays/masoala-forest-lodge", line: "Masoala peninsula, Antongil Bay" },
      { name: "Expedition Blue Lagoon", href: "/stays/expedition-blue-lagoon", line: "Cap Masoala, by boat and kayak" },
      { name: "Time + Tide Tsara Komba", href: "/stays/time-tide-tsara-komba", line: "Nosy Komba, near Nosy Be" },
    ],
  },
  "mouse-lemur": {
    noteId: "mouse-lemur",
    title: "Where to See Mouse Lemurs, the World's Smallest Primates",
    answer: "Mouse lemurs live only in Madagascar and are the smallest primates on earth. The smallest species, Madame Berthe's mouse lemur, weighs about 30 grams. They are active at night, so you look for them on a night walk, by the shine of their eyes in a headlamp. Different species live in different forests across the island.",
    qa: [
      { q: "How small is a mouse lemur?", a: "Mouse lemurs weigh from about one ounce to four. Madame Berthe's mouse lemur, at an average of 30.6 grams and around nine to eleven centimetres in body length, is the smallest living primate." },
      { q: "Where does the smallest one live?", a: "Madame Berthe's mouse lemur lives in the dry deciduous forests of western Madagascar, in the Menabe region." },
      { q: "What do mouse lemurs eat?", a: "Insects, fruit, flowers and other plants, gathered at night." },
      { q: "Why do they have fat tails?", a: "They store fat in the tail in the wet season and live off it through the dry season." },
    ],
    photo: [
      "Find the eyeshine first with a headlamp held at eye level, then bring the camera up.",
      "Ask your guide before using any light on the animal, and keep it brief.",
      "They freeze for a moment when found. That moment is the photograph.",
    ],
    parent: [{ name: "Destinations", path: "/destinations" }, { name: "Africa", path: "/destinations/africa" }, { name: "Madagascar", path: "/destinations/africa/madagascar" }],
    reachTitle: "Stays the House Files in Madagascar",
    reach: [
      { name: "Masoala Forest Lodge", href: "/stays/masoala-forest-lodge", line: "Masoala peninsula, Antongil Bay" },
      { name: "Expedition Blue Lagoon", href: "/stays/expedition-blue-lagoon", line: "Cap Masoala, by boat and kayak" },
      { name: "Miavana by Time + Tide", href: "/stays/miavana-by-time-tide", line: "Private island, northeast coast" },
      { name: "Time + Tide Tsara Komba", href: "/stays/time-tide-tsara-komba", line: "Nosy Komba, near Nosy Be" },
    ],
  },
  "galapagos-giant-tortoise": {
    noteId: "galapagos-giant-tortoise",
    title: "Where to See Giant Tortoises in the Galápagos",
    answer: "Giant tortoises live only in the Galápagos, and the islands are named for them. The dome-shelled kind lives in the misty highlands of the larger islands; the saddle-backed kind lives on drier islands. You see them on foot with a guide, at walking pace. James Wild & Co files small ships and lodges across the islands.",
    qa: [
      { q: "How long do giant tortoises live?", a: "More than a hundred years. They are among the longest-lived of all land animals." },
      { q: "How big do they get?", a: "On average about 1.5 metres long and 250 kilograms, and up to 1.8 metres and 400 kilograms." },
      { q: "Why do the shells differ from island to island?", a: "Domed shells belong to tortoises on large, humid islands with plenty to graze. Saddle-backed shells rise at the front, so the tortoise can stretch its neck up to reach tall cactus on dry islands." },
      { q: "Are giant tortoises endangered?", a: "Yes. Sailors killed between 100,000 and 200,000 for food from the 17th to the 19th century, and the tortoises remain under protection today." },
    ],
    photo: [
      "Get low. A tortoise photographed from its own eye level looks its size.",
      "They move slowly but they do move. Set up ahead of one and let it walk into the frame.",
      "Mist in the highlands is flat light. Use it for the texture of the shell and skin.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
  "marine-iguana": {
    noteId: "marine-iguana",
    title: "Where to See Marine Iguanas in the Galápagos",
    answer: "Marine iguanas live only in the Galápagos and are the only lizards on earth that feed in the sea. You find them on rocky shores and black lava, basking in groups between dives for algae. James Wild & Co files small ships and lodges across the islands.",
    qa: [
      { q: "Do marine iguanas really swim?", a: "Yes. They dive to graze algae off the rocks, and they can go down more than 20 metres." },
      { q: "Why do marine iguanas sneeze?", a: "To get rid of salt. Glands in the nose filter the salt they swallow with their food, and they sneeze it out. It dries as a white crust on the head." },
      { q: "Why do they lie in the sun?", a: "They cannot make their own heat. After a cold dive they warm up again by basking on the rocks." },
      { q: "Are marine iguanas endangered?", a: "They are listed as Vulnerable." },
    ],
    photo: [
      "Dark animal on dark rock: find one against the sea or the sky.",
      "Wait for the sneeze. Keep the camera up on a basking group and you will get one.",
      "Go wide for the heap, then close for one face with its crust of salt.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
  "blue-footed-booby": {
    noteId: "blue-footed-booby",
    title: "Where to See Blue-Footed Boobies Dance in the Galápagos",
    answer: "About half the world's blue-footed boobies nest in the Galápagos. They court on bare ground, where the male lifts his blue feet one at a time for the female, and they hunt by plunging into the sea from as high as 80 feet. James Wild & Co files small ships and lodges across the islands.",
    qa: [
      { q: "Why are their feet blue?", a: "The colour comes from pigments called carotenoids in the fish they eat. Brighter feet signal a well-fed, healthy bird, and both sexes prefer partners with brighter feet." },
      { q: "When do blue-footed boobies dance?", a: "They breed when conditions suit, not in one fixed season, so courtship can be seen at different times of year. Ask your guide which islands have pairs courting." },
      { q: "How do they fish?", a: "They fold their wings back and plunge from as high as 80 feet, sometimes in groups." },
      { q: "Where do they nest?", a: "On the ground, in a shallow scrape ringed with guano." },
    ],
    photo: [
      "Shoot the dance from the bird's level, with the feet in the frame.",
      "For the dive, follow one bird circling over the water and fire as the wings fold.",
      "They nest on the ground beside the path. Stay on the trail and use a longer lens.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
  "galapagos-penguin": {
    noteId: "galapagos-penguin",
    title: "Where to See Penguins in the Galápagos",
    answer: "The Galápagos penguin is the only penguin found north of the equator. About 95 percent of them live on Isabela and Fernandina in the west of the islands, so a route that reaches the west gives you the best chance. James Wild & Co files small ships and lodges across the islands.",
    qa: [
      { q: "How can a penguin live on the equator?", a: "Cold, nutrient-rich water reaches the islands on the Humboldt and Cromwell currents. The penguins also pant and keep to the shade in the heat of the day." },
      { q: "How many Galápagos penguins are there?", a: "Fewer than 2,000. The species is listed as Endangered." },
      { q: "Which islands have penguins?", a: "Isabela and Fernandina hold about 95 percent. There are small colonies on Bartolomé, Santiago and Floreana." },
      { q: "When do they breed?", a: "At any time of year, when upwelling cold water brings food." },
    ],
    photo: [
      "On the rocks they stand still. Take your time and wait for two to face each other.",
      "In the water they are fast. Use a fast shutter and follow one bird.",
      "Black lava and white bellies fool a camera. Check the first frame and adjust.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
  "waved-albatross": {
    noteId: "waved-albatross",
    title: "When and Where to See the Waved Albatross",
    answer: "Almost the entire world population of waved albatrosses nests on Española, in the south of the Galápagos, with a few pairs on Isla de la Plata off the mainland. The birds are on Española from roughly April to December. To see the courtship dance you need a route that calls at Española in those months. James Wild & Co files small ships across the islands.",
    qa: [
      { q: "When are waved albatrosses on Española?", a: "Eggs are laid between April and June, and the young leave the island by about mid-December." },
      { q: "What is the courtship dance?", a: "A long, set routine of bowing, bill circling, sky-pointing and bill clacking, with honking and hooting. Pairs stay together for life." },
      { q: "How big is a waved albatross?", a: "The wings span seven to eight feet." },
      { q: "Is the waved albatross endangered?", a: "Yes. It is listed as Critically Endangered, with a world population estimated at 50,000 to 70,000." },
    ],
    photo: [
      "The dance repeats. Watch one round, then shoot the next.",
      "Keep both birds in the frame and wait for the bills to cross.",
      "For flight, stand where they launch from the cliff edge and let them come past.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
  "galapagos-sea-lion": {
    noteId: "galapagos-sea-lion",
    title: "Where to Swim with Sea Lions in the Galápagos",
    answer: "The Galápagos sea lion is the most common mammal in the islands, and you will meet it on beaches and in the water on most routes. It is the smallest sea lion species, the young are curious about swimmers, and it is listed as Endangered. James Wild & Co files small ships and lodges across the islands.",
    qa: [
      { q: "Can you swim with sea lions in the Galápagos?", a: "Often, yes. Young sea lions are inquisitive and will approach a snorkeller. Your guide sets the rules in the water and on the beach." },
      { q: "Are Galápagos sea lions found anywhere else?", a: "They breed in the Galápagos and on Isla de la Plata, just off mainland Ecuador." },
      { q: "Are they endangered?", a: "Yes. The population fell by 60 to 65 percent between 1978 and 2001." },
      { q: "When are there pups?", a: "In every month. The breeding season is long, so there are dependent pups in the colonies all year." },
    ],
    photo: [
      "Underwater, stay still and let them circle you. They come closer to a swimmer who is not chasing.",
      "On the beach, lie down at their level, at the distance your guide gives.",
      "Wet fur is dark and dry fur is gold. Dry animals in low sun photograph best.",
    ],
    parent: [{ name: "Voyages", path: "/voyages" }, { name: "The Galápagos", path: "/voyages/galapagos" }],
    reachTitle: "Small Ships and Lodges in the Galápagos",
    reach: [
      { name: "Galapagos Safari Camp", href: "/stays/galapagos-safari-camp", line: "Santa Cruz highlands, lodge" },
      { name: "Pikaia Lodge", href: "/stays/pikaia-lodge", line: "Santa Cruz, lodge" },
      { name: "Galápagos yachts and catamarans", href: "/voyages/galapagos#ships-h", line: "Small ships filed in the Ledger" },
    ],
  },
};

