// Brand films for stay pages (James, 5 and 6 Nov 2026: "videos... in the headers versus the pictures in the heroes...
// full screen, best view... top performance only"). Each film is the brand's own, from its own site, credited to it.
// `hero: true` plays the film full screen behind the page header; the photograph shows first and stays where the film
// cannot play (reduced motion, Save-Data). YouTube Shorts from the Film Desk stay in films.json.
const CLD = "https://res.cloudinary.com/jhlnq5h5/video/upload";

export type WideFilm =
  | { kind: "mp4"; src: string; srcMobile: string; poster: string; title: string; credit: string; hero?: boolean }
  | { kind: "vimeo"; id: string; title: string; credit: string; hero?: boolean };

export const STAY_FILMS: Record<string, WideFilm> = {
  // The brands' own films, from anantara.com, kaabaluum.com and singita.com (James, 27 Nov 2026: "use images and videos").
  "anantara-ubud-bali": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/anantara-ubud-bali/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/anantara-ubud-bali/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/anantara-ubud-bali/film.jpg`, title: "Anantara Ubud in the Payangan rainforest", credit: "Film courtesy of Anantara Ubud Bali Resort", hero: true },
  "kaaba-luum-mexico": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/kaaba-luum-mexico/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/kaaba-luum-mexico/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/kaaba-luum-mexico/film.jpg`, title: "Kaaba Luum in the jungle near Tulum", credit: "Film courtesy of Kaaba Luum", hero: true },
  // Great Plains Conservation's own camp films (720p) from greatplainsconservation.com, and Xigera's own film from xigera.com (James, 26 Nov 2026: "use videos for hero").
  "great-plains-duba-plains": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/duba-plains/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/duba-plains/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/duba-plains/film.jpg`, title: "Duba Plains Camp in the Okavango Delta", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "mara-plains-camp-by-great-plains": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/mara-plains/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/mara-plains/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/mara-plains/film.jpg`, title: "Mara Plains Camp in the Olare Motorogi Conservancy", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "mara-toto-tree-camp-by-great-plains": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/mara-toto/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/mara-toto/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/mara-toto/film.jpg`, title: "Mara Toto Tree Camp in the Maasai Mara", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "great-plains-selinda-main-camp": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/selinda/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/selinda/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/selinda/film.jpg`, title: "Selinda Camp on the Selinda Spillway", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "great-plains-zarafa-camp": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/zarafa/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/zarafa/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/zarafa/film.jpg`, title: "Zarafa Camp on the Zibadianja Lagoon", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "great-plains-zarafa-dhow-suite": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none/jwco/stays/great-plains/dhow-suite/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/great-plains/dhow-suite/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg/jwco/stays/great-plains/dhow-suite/film.jpg`, title: "The Dhow Suite at Zarafa", credit: "Film courtesy of Great Plains Conservation", hero: true },
  "xigera-safari-lodge": { kind: "vimeo", id: "569774036", title: "The Baobab Treehouse at Xigera", credit: "Film courtesy of Xigera Safari Lodge", hero: true },
  // Shipwreck Lodge's own header film (31 s, 1080p) from shipwrecklodge.com.na (James, 26 Nov 2026: "use video").
  "shipwreck-lodge-namibia": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/shipwreck-lodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/shipwreck-lodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/shipwreck-lodge/film.jpg`, title: "Shipwreck Lodge on the Skeleton Coast, Namibia", credit: "Film courtesy of Shipwreck Lodge", hero: true },
  // Tengile MalaMala Collection's own lodge films (10 to 16 s, 1080p) from tengilemalamala.com (James, 26 Nov 2026: "use video and images with credit").
  "tengile-mala-mala-kirkmans-kamp": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/tengile-malamala/kirkmans-kamp/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/tengile-malamala/kirkmans-kamp/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/tengile-malamala/kirkmans-kamp/film.jpg`, title: "Kirkman's Kamp, Tengile MalaMala Collection", credit: "Film courtesy of the Tengile MalaMala Collection", hero: true },
  "tengile-river-lodge-by-mala-mala": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/tengile-malamala/tengile-river-lodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/tengile-malamala/tengile-river-lodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/tengile-malamala/tengile-river-lodge/film.jpg`, title: "Tengile River Lodge, Tengile MalaMala Collection", credit: "Film courtesy of the Tengile MalaMala Collection", hero: true },
  "tengile-mala-mala-rattrays-lodge": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/tengile-malamala/rattrays-lodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/tengile-malamala/rattrays-lodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/tengile-malamala/rattrays-lodge/film.jpg`, title: "Rattray's Lodge, Tengile MalaMala Collection", credit: "Film courtesy of the Tengile MalaMala Collection", hero: true },
  "tengile-mala-mala-camp": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/tengile-malamala/malamala-camp/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/tengile-malamala/malamala-camp/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/tengile-malamala/malamala-camp/film.jpg`, title: "MalaMala Camp, Tengile MalaMala Collection", credit: "Film courtesy of the Tengile MalaMala Collection", hero: true },
  "tengile-mala-mala-sable-camp": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,ac_none,w_1920/jwco/stays/tengile-malamala/sable-camp/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,ac_none,w_960/jwco/stays/tengile-malamala/sable-camp/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/tengile-malamala/sable-camp/film.jpg`, title: "Sable Camp, Tengile MalaMala Collection", credit: "Film courtesy of the Tengile MalaMala Collection", hero: true },
  // Hidden Valley Wilderness Lodge's own film (19 s, 1080p) from hiddenvalleyinn.com and St. George's Caye Resort's own
  // intro film (44 s) from st-georgesresort.com: house partners, credited (James, 21 Nov 2026: "videos on the stay page hero").
  "hidden-valley-lodge": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/hidden-valley-lodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/hidden-valley-lodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/hidden-valley-lodge/film.jpg`, title: "Hidden Valley Wilderness Lodge in the Mountain Pine Ridge", credit: "Film courtesy of Hidden Valley Wilderness Lodge", hero: true },
  // Matachica Resort & Spa's own home-page film (15 s, 1080p) from thelightercollection.com/matachica (James, 21 Nov 2026).
  "matachica-resort-and-spa": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/matachica-resort-and-spa/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/matachica-resort-and-spa/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/matachica-resort-and-spa/film.jpg`, title: "Matachica Resort & Spa on Ambergris Caye", credit: "Film courtesy of Matachica Resort & Spa", hero: true },
  // Gaïa Riverlodge's own home-page film (15 s, 1080p) from thelightercollection.com/gaia (James, 21 Nov 2026).
  "gaia-riverlodge": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/gaia-riverlodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/gaia-riverlodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/gaia-riverlodge/film.jpg`, title: "Gaïa Riverlodge above the Five Sisters Waterfalls", credit: "Film courtesy of Gaïa Riverlodge", hero: true },
  // The farm's own film (43 s) from moreias.com.br, as the stay hero with credit (James, 22 Nov 2026: partners credited).
  "fazenda-moreias": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/fazenda-moreias/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/fazenda-moreias/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/fazenda-moreias/film.jpg`, title: "Fazenda Moréias: river, mangrove and dunes on the coast of Ceará", credit: "Film courtesy of Fazenda Moréias", hero: true },
  "st-george-s-caye-resort": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/st-george-s-caye-resort/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/st-george-s-caye-resort/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/st-george-s-caye-resort/film.jpg`, title: "St. George's Caye Resort, off Belize City", credit: "Film courtesy of St. George's Caye Resort", hero: true },
  // Casali di Casole's own estate film (47 s, 1080p) from casalidicasole.com, full screen for James's presentation (12 Nov 2026).
  // Monasterio's own home-page film (10 s, 1080p) from belmond.com, a house partner (James, 24 Nov 2026: "use video with credit").
  "belmond-monasterio": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/peru/belmond-monasterio/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/peru/belmond-monasterio/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/peru/belmond-monasterio/film.jpg`, title: "Monasterio, A Belmond Hotel, in Cusco", credit: "Film courtesy of Belmond", hero: true },
  // Cap Juluca's own film (15 s, 1080p) from belmond.com, a house partner (James, 21 Nov 2026: "post video"), full screen.
  "belmond-cap-juluca": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/anguilla/belmond-cap-juluca/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/anguilla/belmond-cap-juluca/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/anguilla/belmond-cap-juluca/film.jpg`, title: "Cap Juluca, A Belmond Hotel, on Maundays Bay, Anguilla", credit: "Film courtesy of Belmond", hero: true },
  // Sugar Beach's own film (29 s, 1080p) from viceroyhotelsandresorts.com/sugar-beach (James, 21 Nov 2026: "use video"), full screen.
  "secret-bay-dominica": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/dominica/secret-bay/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/dominica/secret-bay/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/dominica/secret-bay/film.jpg`, title: "Secret Bay, villas on a rainforest clifftop, Dominica", credit: "Film courtesy of Secret Bay", hero: true },
  "sugar-beach-viceroy": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/st-lucia/sugar-beach-viceroy/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/st-lucia/sugar-beach-viceroy/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/st-lucia/sugar-beach-viceroy/film.jpg`, title: "Sugar Beach, A Viceroy Resort, between the Pitons, Saint Lucia", credit: "Film courtesy of Sugar Beach, A Viceroy Resort", hero: true },
  // Wymara's own resort film (97 s, 1080p) from wymara.com (13 Nov 2026).
  wymara: {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/wymara/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/wymara/film.mp4`,
    poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/wymara/film.jpg`,
    title: "Wymara Resort + Villas, Turks and Caicos",
    credit: "Film courtesy of Wymara Resort + Villas",
    // not on the hero: the film reads grainy full screen, so the photograph leads (James, 23 Nov 2026)
  },
  // Awasi Iguazú's own hero film (108 s, 4K) from awasi.com (James, 24 Nov 2026: "grab all you can"). Carries a small
  // Awasi signature in the corner.
  iguazu: {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/iguazu/film.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/iguazu/film.mp4`,
    poster: `${CLD}/so_4,q_auto,f_jpg,w_1920/jwco/stays/iguazu/film.jpg`,
    title: "Awasi Iguazú, Argentina",
    credit: "Film courtesy of Awasi",
    hero: true,
  },
  // Salterra's own resort film (20 s, 4K) from salterra.com (13 Nov 2026).
  salterra: {
    kind: "mp4",
    src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/salterra/film-resort.mp4`,
    srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/salterra/film-resort.mp4`,
    poster: `${CLD}/so_1,q_auto,f_jpg,w_1920/jwco/stays/salterra/film-resort.jpg`,
    title: "Salterra Resort & Spa, South Caicos",
    credit: "Film courtesy of Salterra Resort & Spa",
    hero: true,
  },
  // The Lindis Group's own films from its trade and media page (house partner, James, 16 Nov 2026), full screen.
  "lindis-lodge": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/new-zealand/the-lindis/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/new-zealand/the-lindis/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/new-zealand/the-lindis/film.jpg`, title: "The Lindis in the Ahuriri Valley", credit: "Film courtesy of The Lindis Group", hero: true },
  "mt-isthmus-villa": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/new-zealand/mt-isthmus/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/new-zealand/mt-isthmus/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/new-zealand/mt-isthmus/film.jpg`, title: "Mt Isthmus Villa, between the lakes", credit: "Film courtesy of The Lindis Group", hero: true },
  "paroa-bay": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/new-zealand/paroa-bay/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/new-zealand/paroa-bay/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/new-zealand/paroa-bay/film.jpg`, title: "Paroa Bay above the Bay of Islands", credit: "Film courtesy of The Lindis Group", hero: true },
  "auko": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/vietnam/auko/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/vietnam/auko/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/vietnam/auko/film.jpg`, title: "Auko among the limestone peaks of Phong Nha", credit: "Film courtesy of Auko", hero: true },
  "siempang-forest-lodge": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/cambodia/siempang-forest-lodge/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/cambodia/siempang-forest-lodge/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/cambodia/siempang-forest-lodge/film.jpg`, title: "Siempang Forest Lodge in Siem Pang Wildlife Sanctuary", credit: "Film courtesy of Siempang Forest Lodge", hero: true },
  "song-saa-private-island": { kind: "mp4", src: `${CLD}/q_auto:good,vc_auto,w_1920/jwco/stays/cambodia/song-saa/film.mp4`, srcMobile: `${CLD}/q_auto,vc_auto,w_960/jwco/stays/cambodia/song-saa/film.mp4`, poster: `${CLD}/so_2,q_auto,f_jpg,w_1920/jwco/stays/cambodia/song-saa/film.jpg`, title: "Song Saa Private Island in the Koh Rong archipelago", credit: "Film courtesy of Song Saa Private Island", hero: true },
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
