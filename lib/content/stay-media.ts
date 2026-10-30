// Hand-picked imagery that overrides or adds to the Ledger export, kept here so
// a re-export of stays.json never loses it. Cloudinary URLs are delivered at up
// to 2560px; smaller originals go through Cloudinary's upscaler (e_upscale).

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";
const big = (id: string, upscale = false) => `${CLD}/${upscale ? "e_upscale/" : ""}c_limit,w_2560/q_auto:good/f_jpg/${id}`;

import photos from "./stay-photos.json";
import stays from "./stays.json";

// pos: CSS object-position, for photos whose subject sits off-centre.
export type FullFrame = { src: string; alt: string; caption: string; pos?: string };

// The library's Pacuare hero is 400×500, which pixelates as a full-screen
// slide; this is the lodge's canopy-suite aerial, upscaled.
export const HERO_OVERRIDE: Record<string, string> = {
  "pacuare-lodge": big("jwco/site/stays/pacuare-lodge-canopy-aerial", true),
};

const HAND: Record<string, FullFrame[]> = {
  "leeu-estates": [
    { src: big(`${LEEU}/leeu-estates-manor-house-morning`, true), alt: "Leeu Estates: the Manor House and gardens in morning light", caption: "The Manor House, first light" },
    { src: big(`${LEEU}/leeu-estates-manor-house-deck-sundowners`, true), alt: "Leeu Estates: sundowners on the Manor House deck", caption: "Sundowners on the deck", pos: "50% 80%" },
    { src: big(`${LEEU}/mullineux-leeu-wine-studio`, true), alt: "Leeu Estates: the Mullineux & Leeu wine studio", caption: "The way in to the wine studio" },
    { src: big(`${LEEU}/leeu-spa-lily-pond`, true), alt: "Leeu Estates: the spa lily pond above the valley", caption: "The spa, over the valley" },
  ],
  "aguas-claras": [
    { src: `${B44}/5615363d9_960a62e41_6835e605544aed8e2c19bce5_Beach_0060.jpg`, alt: "Aguas Claras: the beach on Costa Rica's south Caribbean coast", caption: "The beach on the south Caribbean coast" },
    { src: `${B44}/8745303d9_e9e810600_6835e7103e72084545ff7a02_Coral_0049.jpg`, alt: "Aguas Claras on Costa Rica's south Caribbean coast", caption: "Colour on the Caribbean coast" },
    { src: `${B44}/40f2b52ce_6103400fc_6835e297ff2e3b864f9ddef7_Beach_0030.jpg`, alt: "Aguas Claras: the beach and the forest behind it", caption: "Beach in front, forest behind" },
    { src: `${B44}/a713a2463_6a72a5f07_6835dc42a179c63790ead1c0_Beach_0025.jpg`, alt: "Aguas Claras: the shoreline in front of the hotel", caption: "The shoreline out front" },
  ],
};

// Hand-written sets above win; every other stay with photos picked in
// stay-photos.json gets its full frames from there.
export const FULL_FRAME: Record<string, FullFrame[]> = {
  ...Object.fromEntries(Object.entries(photos.stays as Record<string, { frames: FullFrame[] }>).filter(([, v]) => v.frames.length).map(([k, v]) => [k, v.frames])),
  ...HAND,
};

// Who owns each stay's photographs (stay-photos.json "credit"). Printed under the
// full frames and written into every image's structured data.
// Wilderness supplies the photographs for every Wilderness camp (James, 30 Oct
// 2026), so each "wilderness-" stay is credited to Wilderness unless its own
// entry names someone else.
export const PHOTO_CREDIT: Record<string, string> = {
  ...Object.fromEntries((stays.stays as { slug: string }[]).filter((x) => x.slug.startsWith("wilderness-")).map((x) => [x.slug, "Wilderness"])),
  ...Object.fromEntries((stays.stays as { slug: string }[]).filter((x) => x.slug.endsWith("-ted-turner-reserve")).map((x) => [x.slug, "Ted Turner Reserves"])),
  ...Object.fromEntries(
    Object.entries(photos.stays as Record<string, { credit?: string }>).filter(([, v]) => v.credit).map(([k, v]) => [k, v.credit as string]),
  ),
};
