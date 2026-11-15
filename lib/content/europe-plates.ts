// Watercolour plates for Volume V (Europe) stays: the "old Europe" art layer
// from James's Not So Wild · Europe sample. Each plate is painted on
// Cloudinary (AI image-to-image) from the house's own hero photograph, except
// Dá Licença, whose plate came from the original sample. Design only: a stay
// without a plate renders exactly as before.
import type { Plate } from "@/components/stays/EuropePlate";

const C = "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1600/q_auto:good/f_auto/jwco/stays/europe";
const p = (slug: string, caption: string, extra: Partial<Plate> = {}): Plate => ({ url: `${C}/${slug}/plate-i`, caption, ...extra });
// The house hare in the paintings (James, 15 Nov 2026: "do it like this"): small, dressed for the place, and only in
// some plates so finding him is a small reward; Iggi the chameleon now and then (the Douro). Same paintings otherwise.
const hare = (id: string) => ({ url: `${C}/${id}` });

export const EUROPE_PLATES: Record<string, Plate> = {
  "da-licenca": p("da-licenca", "The estate among the olive hills, with the marble tower of Estremoz beyond", { emblem: "stork", emblemNote: "The stork · emblem of the Alentejo chimneys" }),
  "six-senses-douro-valley": p("six-senses-douro-valley", "The quinta above the terraced vineyards of the Douro", { ...hare("_concepts/hare-iggi-douro") }),
  "ariel-house": p("ariel-house", "The Victorian house in Ballsbridge, Dublin"),
  "castle-leslie": p("castle-leslie", "The castle and its estate in County Monaghan", { ...hare("_concepts/hare-castle-leslie") }),
  "corks-vienna-woods": p("corks-vienna-woods", "The country house in the woods above Cork"),
  "hayfield-manor": p("hayfield-manor", "The manor in its walled gardens, Cork"),
  "no-1-pery-square-limerick": p("no-1-pery-square-limerick", "The Georgian townhouse on Pery Square, Limerick"),
  "wren-urban-nest": p("wren-urban-nest", "The house in the heart of Dublin"),
  "nomade-temple-ibiza": p("nomade-temple-ibiza", "The temple among the pines of Ibiza"),
  "six-senses-ibiza": p("six-senses-ibiza", "Xarraca Bay on Ibiza's north coast", { ...hare("six-senses-ibiza/plate-hare") }),
  "six-senses-rome": p("six-senses-rome", "The palazzo in the centro storico, Rome", { ...hare("six-senses-rome/plate-hare") }),
  "six-senses-crans-montana": p("six-senses-crans-montana", "The lodge on the slopes of Crans-Montana", { ...hare("six-senses-crans-montana/plate-hare") }),
  "six-senses-residences-courchevel": p("six-senses-residences-courchevel", "The residences above Courchevel"),
};
