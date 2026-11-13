// Brand films for stay pages (James, 5 and 6 Nov 2026: "videos... in the headers versus the pictures in the heroes...
// full screen, best view... top performance only"). Each film is the brand's own, from its own site, credited to it.
// `hero: true` plays the film full screen behind the page header; the photograph shows first and stays where the film
// cannot play (reduced motion, Save-Data). YouTube Shorts from the Film Desk stay in films.json.
const CLD = "https://res.cloudinary.com/jhlnq5h5/video/upload";

export type WideFilm =
  | { kind: "mp4"; src: string; srcMobile: string; poster: string; title: string; credit: string; hero?: boolean }
  | { kind: "vimeo"; id: string; title: string; credit: string; hero?: boolean };

export const STAY_FILMS: Record<string, WideFilm> = {
  // Casali di Casole's own estate film (47 s, 1080p) from casalidicasole.com, full screen for James's presentation (12 Nov 2026).
  // Wymara's own resort film (97 s, 1080p) from wymara.com (13 Nov 2026).
  wymara: {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/wymara/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/wymara/film.mp4`,
    poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/wymara/film.jpg`,
    title: "Wymara Resort + Villas, Turks and Caicos",
    credit: "Film courtesy of Wymara Resort + Villas",
    hero: true,
  },
  "casali-di-casole": {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/casali-di-casole/film-estate.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/casali-di-casole/film-estate.mp4`,
    poster: `${CLD}/so_0,q_auto,f_jpg,w_1920/jwco/stays/casali-di-casole/film-estate.jpg`,
    title: "Casali di Casole, a Tuscan estate",
    credit: "Film courtesy of Casali di Casole",
    hero: true,
  },
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
  // Viceroy's own resort film (59 s, 1920 x 816) from viceroybali.com, full screen behind the header (James, 12 Nov 2026).
  "viceroy-bali": {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/viceroy-bali/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/viceroy-bali/film.mp4`,
    poster: `${CLD}/so_0,q_auto,f_jpg,w_1920/jwco/stays/viceroy-bali/film.jpg`,
    title: "Viceroy Bali, above the Petanu valley",
    credit: "Film courtesy of Viceroy Bali",
    hero: true,
  },
  // The Ungasan's homepage film (14 s, published at 720p), full screen at James's request (12 Nov 2026).
  "ungasan-clifftops": {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto/jwco/stays/ungasan-clifftops/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/ungasan-clifftops/film.mp4`,
    poster: `${CLD}/so_0,q_auto,f_jpg/jwco/stays/ungasan-clifftops/film.jpg`,
    title: "The Ungasan, on the Uluwatu cliffs",
    credit: "Film courtesy of The Ungasan Clifftop Resort",
    hero: true,
  },
  // Soori's own resort film (172 s, 720p) from sooribali.com, full screen at James's request (12 Nov 2026).
  "soori-bali": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto/jwco/stays/soori-bali/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/soori-bali/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/soori-bali/film.jpg`, title: "Soori Bali, between the ocean and the rice fields", credit: "Film courtesy of Soori Bali", hero: true },
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

// A second film further down the page, where the brand has one of what you do there (James, 13 Nov 2026: "if you
// have a video, you can go ahead and embed it"). Muted, looping, below the overview; the hero film stays the estate.
export const STAY_CLIPS: Record<string, { film: Extract<WideFilm, { kind: "mp4" }>; line: string }> = {
  "casali-di-casole": {
    film: { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/casali-di-casole/clip-truffle-biking.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/casali-di-casole/clip-truffle-biking.mp4`, poster: `${CLD}/so_3,q_auto,f_jpg,w_1920/jwco/stays/casali-di-casole/clip-truffle-biking.jpg`, title: "Truffle hunting and biking on the Casali di Casole estate", credit: "Film courtesy of Casali di Casole" },
    line: "Truffle hunting and biking on the estate",
  },
};
