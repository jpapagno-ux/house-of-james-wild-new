// Hand-picked imagery that overrides or adds to the Ledger export, kept here so
// a re-export of stays.json never loses it. Cloudinary URLs are delivered at up
// to 2560px; smaller originals go through Cloudinary's upscaler (e_upscale).

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const B44 = "https://media.base44.com/images/public/6a7932161e9318dca1f24474";
const LEEU = "wildco/south-africa/leeu-estates-franschhoek";
const big = (id: string, upscale = false) => `${CLD}/${upscale ? "e_upscale/" : ""}c_limit,w_2560/q_auto:good/f_jpg/${id}`;

export type FullFrame = { src: string; alt: string; caption: string };

// The library's Pacuare hero is 400×500, which pixelates as a full-screen
// slide; this is the lodge's canopy-suite aerial, upscaled.
export const HERO_OVERRIDE: Record<string, string> = {
  "pacuare-lodge": big("jwco/site/stays/pacuare-lodge-canopy-aerial", true),
};

export const FULL_FRAME: Record<string, FullFrame[]> = {
  "leeu-estates": [
    { src: big(`${LEEU}/leeu-estates-franschhoek-01`), alt: "Leeu Estates: vineyards and the Franschhoek mountains", caption: "The estate, under the Franschhoek mountains" },
    { src: big(`${LEEU}/leeu-estates-manor-house-aerial-franschhoek`, true), alt: "Leeu Estates: the manor house from the air", caption: "The manor house from the air" },
    { src: big(`${LEEU}/leeu-estates-franschhoek-02`), alt: "Leeu Estates: the vineyard estate", caption: "Vineyard, estate and mountain" },
    { src: big(`${LEEU}/leeu-estates-franschhoek-03`), alt: "Leeu Estates in the Franschhoek Valley", caption: "The Franschhoek Valley" },
  ],
  "aguas-claras": [
    { src: `${B44}/5615363d9_960a62e41_6835e605544aed8e2c19bce5_Beach_0060.jpg`, alt: "Aguas Claras: the beach on Costa Rica's south Caribbean coast", caption: "The beach on the south Caribbean coast" },
    { src: `${B44}/8745303d9_e9e810600_6835e7103e72084545ff7a02_Coral_0049.jpg`, alt: "Aguas Claras on Costa Rica's south Caribbean coast", caption: "Colour on the Caribbean coast" },
    { src: `${B44}/40f2b52ce_6103400fc_6835e297ff2e3b864f9ddef7_Beach_0030.jpg`, alt: "Aguas Claras: the beach and the forest behind it", caption: "Beach in front, forest behind" },
    { src: `${B44}/a713a2463_6a72a5f07_6835dc42a179c63790ead1c0_Beach_0025.jpg`, alt: "Aguas Claras: the shoreline in front of the hotel", caption: "The shoreline out front" },
  ],
};
