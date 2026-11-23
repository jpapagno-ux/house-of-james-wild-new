// The Founder's Sketchbook (James, 15 Nov 2026: "what about places I've been… my favourite places… like Costa Rica
// and Galápagos"). One watercolour per place James has been, with the year in pencil. No hare in the
// paintings (James, 23 Nov 2026). Painted on Cloudinary in the house watercolour style. Every place
// and year is James's own (memory, stated): nothing about a trip is invented in the pictures or the lines.
// Shown on the founder page as a sketchbook, and as a single plate on the page for that place where one exists.
const C = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1600/q_auto:good/f_auto/jwco/founder/sketchbook";

export type Sketch = { id: string; year: string; place: string; line: string; img: string; alt: string; stays?: string[]; countries?: string[]; paths?: string[] };

export const SKETCHBOOK: Sketch[] = [
  { id: "eleuthera", year: "1983", place: "North Eleuthera, Bahamas", line: "Where it started: friends asked James to take them surfing, and a trip became a life's work. Still his favourite island.", img: `${C}/eleuthera-1983-plain`, alt: "Watercolour: two surfboards stood in the pink sand of a beach in Eleuthera, 1983", countries: ["bahamas"] },
  { id: "playa-grande", year: "1992", place: "Playa Grande, Costa Rica", line: "Nine years as a surf travel planner and guide, most of them at Playa Grande, running his own adventure travel company.", img: `${C}/playa-grande-1992-plain`, alt: "Watercolour: a wave breaking at Playa Grande, Costa Rica, 1992", countries: ["costa-rica"] },
  { id: "leon-dormido", year: "1992", place: "León Dormido, Galápagos", line: "Diving with sea lions under Kicker Rock, off San Cristóbal.", img: `${C}/leon-dormido-1992-plain`, alt: "Watercolour: two sea lions swimming below León Dormido, Galápagos, 1992", countries: ["ecuador-galapagos"], paths: ["/voyages/galapagos", "/destinations/south-america/ecuador-galapagos/galapagos"] },
  { id: "uluru", year: "2011", place: "Uluru, Australia", line: "Longitude 131°, and the rock changing colour at sunset.", img: `${C}/uluru-2011-plain`, alt: "Watercolour: Uluru at sunset, 2011", stays: ["beckon-longitude-131"] },
  { id: "kalahari", year: "2012", place: "Tswalu, the Kalahari", line: "His number one. “Changed the way I see Africa completely.”", img: `${C}/kalahari-2012-plain`, alt: "Watercolour: a safari vehicle in the red dunes of the Kalahari at dusk, 2012", stays: ["tswalu-reserve"] },
  { id: "serengeti", year: "2018", place: "The Serengeti, Tanzania", line: "His daughter's first safari, with Masaa John as their guide.", img: `${C}/serengeti-2018-plain`, alt: "Watercolour: a lone acacia and the herds on the Serengeti plain, 2018", stays: ["gibbs-farm"] },
  { id: "antarctica", year: "2020", place: "The Antarctic Peninsula", line: "HX's Antarctic Circle voyage on the Roald Amundsen, at the Vernadsky base as the world shut down.", img: `${C}/antarctica-2020-plain`, alt: "Watercolour: an expedition ship among the ice of the Antarctic Peninsula, 2020", paths: ["/destinations/polar-antarctica", "/voyages/polar"] },
  { id: "raja-ampat", year: "2024", place: "Raja Ampat, Indonesia", line: "Aboard Aliikai with his son Anthony.", img: `${C}/raja-ampat-2024-plain`, alt: "Watercolour: the bow of a phinisi among the karst islands of Raja Ampat, 2024" }, // James, 18 Nov 2026: Raja Ampat watercolours only on the profiles and the Aliikai page
  { id: "bora-bora", year: "2025", place: "Bora Bora, French Polynesia", line: "With Miriam, at the Thalasso, after the Star Breeze.", img: `${C}/bora-bora-2025-plain`, alt: "Watercolour: overwater bungalows on the lagoon of Bora Bora, 2025" },
];

export const sketchForStay = (slug: string) => SKETCHBOOK.find((s) => s.stays?.includes(slug)) ?? null;
export const sketchForCountry = (slug: string) => SKETCHBOOK.find((s) => s.countries?.includes(slug)) ?? null;
export const sketchForPath = (path: string) => SKETCHBOOK.find((s) => s.paths?.includes(path)) ?? null;
