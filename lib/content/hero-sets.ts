// Five hero photographs per record (scripts/hero-sets.py → hero-sets.json).
import sets from "./hero-sets.json";
import photos from "./stay-photos.json";

const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
// Base44 serves AVIF as octet-stream, so those go through the /img/b44 proxy.
const fix = (u: string) => (u.startsWith(B44) && /\.avif$/i.test(u) ? `/img/b44/${u.slice(B44.length)}` : u);

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const big = (id: string, upscale = false) => `${CLD}/${upscale ? "e_upscale/" : ""}c_limit,w_2560/q_auto:good/f_jpg/${id}`;
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";

// Hand-picked hero sets: place and people first, rooms left to the rooms section.
const PICKS: Record<string, { url: string; alt: string }[]> = {
  // Tswalu (photographs: Tswalu Kalahari; Loapi by Andrew Morgan, some Tarkuni by Dook).
  "reserve:tswalu-reserve": [
    { url: big("jwco/journal/africa-inspired-wild-and-co-safaris/tswalu-loapi-kalahari-hills"), alt: "A daybed on the Loapi deck at Tswalu looking out over the Kalahari grassland to the Korannaberg hills" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni-boma-sunset"), alt: "Tswalu Kalahari: the boma at Tarkuni at sunset" },
    { url: big("wildco/south-africa/tswalu/loapi/loapi-firepit-at-dusk"), alt: "Tswalu Kalahari: the fire pit at Loapi at dusk" },
    { url: big("wildco/south-africa/tswalu/motse/motse-pool"), alt: "Tswalu Kalahari: the pool at The Motse" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni"), alt: "Tswalu Kalahari: Tarkuni, the private homestead" },
  ],
  "camp:tswalu-reserve/motse": [
    { url: big("wildco/south-africa/tswalu/motse/motse-pool"), alt: "The Motse, Tswalu Kalahari: the pool" },
    { url: big("wildco/south-africa/tswalu/motse/motse-patio"), alt: "The Motse, Tswalu Kalahari: a legae patio" },
    { url: big("wildco/south-africa/tswalu/motse/motse-walkway"), alt: "The Motse, Tswalu Kalahari: the walkway between the legae" },
    { url: big("wildco/south-africa/tswalu/motse/motse-daybed"), alt: "The Motse, Tswalu Kalahari: a daybed" },
    { url: big("wildco/south-africa/tswalu/motse/motse-suite"), alt: "The Motse, Tswalu Kalahari: inside a legae suite" },
  ],
  "camp:tswalu-reserve/loapi": [
    { url: big("wildco/south-africa/tswalu/loapi/loapi-firepit-at-dusk"), alt: "Loapi, Tswalu Kalahari: the fire pit at dusk" },
    { url: big("wildco/south-africa/tswalu/loapi/loapi-deck"), alt: "Loapi, Tswalu Kalahari: the deck of a private home" },
    { url: big("wildco/south-africa/tswalu/loapi/loapi-lounge-at-dusk"), alt: "Loapi, Tswalu Kalahari: the lounge at dusk" },
    { url: big("wildco/south-africa/tswalu/loapi/loapi-indoor-dining"), alt: "Loapi, Tswalu Kalahari: the dining room" },
    { url: big("wildco/south-africa/tswalu/loapi/loapi-bedroom"), alt: "Loapi, Tswalu Kalahari: a bedroom" },
  ],
  "camp:tswalu-reserve/tarkuni": [
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni"), alt: "Tarkuni, Tswalu Kalahari: the private homestead" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni-boma-sunset"), alt: "Tarkuni, Tswalu Kalahari: the boma at sunset" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni-deck"), alt: "Tarkuni, Tswalu Kalahari: the deck" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni-pool"), alt: "Tarkuni, Tswalu Kalahari: the pool" },
    { url: big("wildco/south-africa/tswalu/tarkuni/tarkuni-firepit"), alt: "Tarkuni, Tswalu Kalahari: the fire pit" },
  ],
  "stay:leeu-estates": [
    { url: big(`${LEEU}/leeu-estates-franschhoek-03`), alt: "Leeu Estates Manor House at dusk, guests on the lawn below the Franschhoek mountains" },
    { url: big(`${LEEU}/leeu-estates-manor-house-aerial-franschhoek`, true), alt: "Leeu Estates from the air: vineyards, the Manor House and the Franschhoek Valley" },
    { url: big(`${LEEU}/leeu-locally-grown-gardens`, true), alt: "Harvesting in the kitchen gardens at Leeu Estates, Franschhoek" },
    { url: big(`${LEEU}/leeu-estates-franschhoek-01`), alt: "Evening on the Leeu Estates terrace facing the Franschhoek mountains" },
    { url: big(`${LEEU}/leeu-estates-franschhoek-04`, true), alt: "Afternoon on the lawn at Leeu Estates under the Franschhoek peaks, Cape Winelands" },
  ],
};

export function heroSlides(key: string, name: string, where?: string | null) {
  if (PICKS[key]) return PICKS[key];
  const picked = (photos.stays as Record<string, { hero: { url: string; alt: string }[] }>)[key.replace(/^stay:/, "")];
  if (key.startsWith("stay:") && picked?.hero.length) return picked.hero;
  const list = ((sets as Record<string, string[]>)[key] ?? []).map(fix);
  return list.map((url, i) => ({ url, alt: `${name}${where ? `, ${where}` : ""}${i ? `: photograph ${i + 1} of ${list.length}` : ""}` }));
}
