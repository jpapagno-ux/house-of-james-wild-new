// Ambient brand films for stay pages, played silent and looped as a full-bleed band (James, 5 Nov 2026:
// "a masterful creation on Laucala"). Hosted in Cloudinary from the brand's own site, credited to the brand.
// YouTube films from the Film Desk stay in films.json; this is only for short brand loops we hold ourselves.
const CLD = "https://res.cloudinary.com/jhlnq5h5/video/upload";

export type AmbientFilm = { src: string; poster: string; title: string; credit: string };

export const STAY_FILMS: Record<string, AmbientFilm> = {
  laucala: {
    src: `${CLD}/q_auto,vc_auto,w_1920/jwco/stays/fiji/laucala/film.mp4`,
    poster: `${CLD}/so_0,q_auto,f_jpg,w_1920/jwco/stays/fiji/laucala/film.jpg`,
    title: "Laucala, from the air and the water",
    credit: "Film courtesy of Laucala",
  },
};
