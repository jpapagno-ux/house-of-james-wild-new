// Five hero photographs per record (scripts/hero-sets.py → hero-sets.json).
import sets from "./hero-sets.json";

const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474/";
// Base44 serves AVIF as octet-stream, so those go through the /img/b44 proxy.
const fix = (u: string) => (u.startsWith(B44) && /\.avif$/i.test(u) ? `/img/b44/${u.slice(B44.length)}` : u);

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const big = (id: string, upscale = false) => `${CLD}/${upscale ? "e_upscale/" : ""}c_limit,w_2560/q_auto:good/f_jpg/${id}`;
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";

// Hand-picked hero sets: place and people first, rooms left to the rooms section.
const PICKS: Record<string, { url: string; alt: string }[]> = {
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
  const list = ((sets as Record<string, string[]>)[key] ?? []).map(fix);
  return list.map((url, i) => ({ url, alt: `${name}${where ? `, ${where}` : ""}${i ? `: photograph ${i + 1} of ${list.length}` : ""}` }));
}
