// Photographs sourced from a brand's own website or media kit for a subject a stay's copy names (a balloon flight,
// the spa, a dance) and its gallery does not show (James, 12 Nov 2026). Each lives in Cloudinary under
// jwco/stays/<slug>/<subject>, with alt text written for this site; momentsFor() places it only beside a row that
// names the same subject. Add new ones here; the photo-gaps audit (scripts/photo-gaps.mjs) lists what is missing.

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
const pic = (id: string) => `${CLD}/c_fill,g_auto,ar_16:10,w_1600/q_auto:good/f_jpg/jwco/stays/${id}`;

export type SubjectPhoto = { url: string; alt: string; credit: string };

const TG = "Photograph courtesy of Tanah Gajah, a Resort by Hadiprana";

export const SUBJECT_PHOTOS: Record<string, SubjectPhoto[]> = {
  // tanahgajahubud.com/en/experiences, 12 Nov 2026
  "tanah-gajah": [
    { url: pic("tanah-gajah/balloon"), alt: "A hot air balloon over the rice fields, from above", credit: TG },
    { url: pic("tanah-gajah/spa"), alt: "A flower bath with two glasses, prepared at the spa", credit: TG },
    { url: pic("tanah-gajah/cooking-class"), alt: "A chef at a cooking class table beside the rice fields", credit: TG },
    { url: pic("tanah-gajah/kecak"), alt: "Kecak dancers by firelight", credit: TG },
    { url: pic("tanah-gajah/elephant-gate-dinner"), alt: "Dinner laid before the Elephant Gate at dusk", credit: TG },
    { url: pic("tanah-gajah/boat-picnic"), alt: "A couple's picnic on a wooden boat on the lake", credit: TG },
  ],
};

export { pic as subjectPic };
