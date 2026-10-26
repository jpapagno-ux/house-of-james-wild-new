// Photographs (and, where James has signed off a line, a note) for the
// "what sets it apart" and "how to fill the days" rows on a stay page.
// Matched by the row's wording; rows with no match borrow from the stay's own photographs.

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const pic = (id: string) => `${CLD}/e_upscale/c_fill,ar_16:10,w_1600/q_auto:good/f_jpg/${id}`;
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";

type Moment = { match: RegExp; image: string; alt: string; note?: string };

// Notes are DRAFTED in James Wild's voice for review.
export const MOMENTS: Record<string, Moment[]> = {
  "leeu-estates": [
    { match: /wine/i, image: pic(`${LEEU}/mullineux-leeu-wine-studio`), alt: "The garden walk to the Mullineux & Leeu wine studio, Leeu Estates", note: "Book the studio tasting early in the stay. You'll spend the rest of it knowing what to order." },
    { match: /wellness|spa/i, image: pic(`${LEEU}/leeu-spa-lily-pond`), alt: "The Leeu Spa lily pond above the Franschhoek valley", note: "The spa looks over the vines. Nobody has ever regretted the extra hour." },
    { match: /award|restaurant/i, image: pic(`${LEEU}/leeu-estates-dining-room-conservatory`), alt: "The conservatory dining room at Leeu Estates", note: "Breakfast in the conservatory sets the tone. Linger; it's allowed." },
    { match: /fine dining|dining/i, image: pic(`${LEEU}/la-petite-colombe-cuisine-leeu-estates`), alt: "A course at La Petite Colombe, Leeu Estates", note: "La Petite Colombe is the dinner people fly in for. You only have to walk." },
    { match: /\bart\b|gallery/i, image: pic(`${LEEU}/everard-read-gallery-leeu-estates`), alt: "The Everard Read gallery at Leeu Estates", note: "Everard Read on the estate: serious art, no velvet rope. Go before lunch." },
    { match: /garden/i, image: pic(`${LEEU}/leeu-locally-grown-gardens`), alt: "Harvesting in the kitchen gardens at Leeu Estates", note: "Walk the kitchen gardens in the morning and you'll recognise dinner." },
    { match: /franschhoek exploration|explor/i, image: pic(`${LEEU}/leeu-estates-manor-house-aerial-franschhoek`), alt: "Leeu Estates and the Franschhoek valley from the air", note: "The village is five minutes away. Go once, then come back to the lawn." },
    { match: /estate setting/i, image: pic(`${LEEU}/leeu-estates-manor-house-morning`), alt: "The Leeu Estates Manor House in morning light", note: "A working wine estate under the mountains, not a hotel pretending to be one." },
    { match: /country house|boutique/i, image: pic(`${LEEU}/leeu-estates-franschhoek-02`), alt: "The Manor House lounge and bar at Leeu Estates", note: "It runs like a private house: they learn your name and your drink by day two." },
    { match: /views/i, image: pic(`${LEEU}/leeu-estates-franschhoek-04`), alt: "The Leeu Estates lawn under the Franschhoek peaks", note: "Every chair faces the mountains. Choose one and stay put." },
    { match: /complimentary|experiences/i, image: pic(`${LEEU}/leeu-estates-manor-house-deck-sundowners`), alt: "Sundowners on the Manor House deck at Leeu Estates", note: "The estate experiences come with the room. Say yes to most of them." },
  ],
};

export function momentsFor(slug: string, items: string[], fallback: { url: string; alt: string }[], offset = 0) {
  const list = MOMENTS[slug] ?? [];
  const used = new Set<number>();
  return items.map((title, k) => {
    const i = list.findIndex((m, j) => !used.has(j) && m.match.test(title));
    if (i >= 0) { used.add(i); const m = list[i]; return { title, image: m.image, alt: m.alt, note: m.note }; }
    const f = fallback.length ? fallback[(k + offset) % fallback.length] : undefined;
    return { title, image: f?.url, alt: f ? f.alt : undefined };
  });
}
