// Brand films for stay pages (James, 5 and 6 Nov 2026: "videos... in the headers versus the pictures in the heroes...
// full screen, best view... top performance only"). Each film is the brand's own, from its own site, credited to it.
// `hero: true` plays the film full screen behind the page header; the photograph shows first and stays where the film
// cannot play (reduced motion, Save-Data). YouTube Shorts from the Film Desk stay in films.json.
const CLD = "https://res.cloudinary.com/jhlnq5h5/video/upload";

export type WideFilm =
  | { kind: "mp4"; src: string; srcMobile: string; poster: string; title: string; credit: string; hero?: boolean }
  | { kind: "vimeo"; id: string; title: string; credit: string; hero?: boolean };

export const STAY_FILMS: Record<string, WideFilm> = {
  laucala: {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/fiji/laucala/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/fiji/laucala/film.mp4`,
    poster: `${CLD}/so_0,q_auto,f_jpg,w_1920/jwco/stays/fiji/laucala/film.jpg`,
    title: "Laucala, from the air and the water",
    credit: "Film courtesy of Laucala",
    hero: true,
  },
  // 4K brand film "To Wander" (80 s), played from Kokomo's own Vimeo in background mode (adaptive, so phones get a light stream).
  "matangi-island": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/fiji/matangi-island/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/fiji/matangi-island/film.mp4`, poster: `${CLD}/so_0,q_auto,f_jpg,w_1920/jwco/stays/fiji/matangi-island/film.jpg`, title: "Matangi Island from the air", credit: "Film courtesy of Matangi Private Island Resort", hero: true },
  "kokomo-private-island": {
    kind: "vimeo",
    id: "1128730742",
    title: "Kokomo, To Wander",
    credit: "Film courtesy of Kokomo Private Island Fiji",
    hero: true,
  },
};

/** Back-compat for the in-page film band (components/stay/AmbientFilm). */
export type AmbientFilm = Extract<WideFilm, { kind: "mp4" }>;
