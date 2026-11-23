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
    where: { label: "See them from the river", href: "#ships-h" },
    sources: [
      "Martin, A. R. and da Silva, V. M. F., 'Sexual dimorphism and body scarring in the boto (Amazon River dolphin) Inia geoffrensis', Marine Mammal Science (University of St Andrews research portal): males pinker than females and more heavily scarred by tooth rakes.",
      "Animal Diversity Web, University of Michigan Museum of Zoology, 'Inia geoffrensis': range, body colour changing with age, movement into floodplains and flooded forest in the wet season.",
      "National Geographic, 'Amazon river dolphins (boto)': unfused neck vertebrae letting the boto bend between flooded trees.",
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
export const COUNTRY_FIELD_NOTES: Record<string, string[]> = { madagascar: ["red-ruffed-lemur"] };
