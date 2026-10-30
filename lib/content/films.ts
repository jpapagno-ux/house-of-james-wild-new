// Short films filed against a vessel or place. Embedded from the owner's own
// YouTube channel in privacy mode; swap in the original file later to burn the
// house logo into the picture.
export type ShortFilm = { id: string; title: string; description: string; poster: string; alt: string; credit: string; channel: { name: string; url: string }; place: string };

export const FILMS: Record<string, ShortFilm> = {
  aliikai: {
    id: "HChJAzZgQIM",
    title: "Discover Komodo National Park Aboard Aliikai Voyage",
    description: "Komodo National Park from the deck of Aliikai, a handcrafted phinisi: Padar's ridges, pink sand, mantas and the dragons of Rinca.",
    poster: "https://res.cloudinary.com/jhlnq5h5/image/upload/c_limit,w_1440/q_auto:good/f_jpg/jwco/site/home/aliikai-komodo-short-poster",
    alt: "Komodo National Park from the deck of the phinisi Aliikai",
    credit: "Aliikai in Komodo · Film: Aliikai Voyage",
    channel: { name: "Aliikai Voyage", url: "https://www.youtube.com/@AliikaiVoyage" },
    place: "Komodo National Park, Indonesia",
  },
};

/** VideoObject for a film (add uploadDate when known, for video rich results). */
export function filmSchema(f: ShortFilm, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${pageUrl}#film`,
    name: f.title,
    description: f.description,
    thumbnailUrl: [f.poster],
    embedUrl: `https://www.youtube.com/embed/${f.id}`,
    url: `https://www.youtube.com/shorts/${f.id}`,
    author: { "@type": "Organization", name: f.channel.name, url: f.channel.url },
    contentLocation: { "@type": "Place", name: f.place },
  };
}

// Credits for the films the house embeds from someone else's camera, by
// YouTube id. StayFilm prints the credit under the player wherever the film
// plays, and the page's VideoObject carries it.
// Wild Together is James and Miriam's own series (James, 30 Oct 2026); this
// episode was filmed by Felix Studios with Monwana. It is not a MORE film.
export type FilmCredit = { title: string; credit: string; series: string; seriesLine: string; creator: string; partner: string };

export const FILM_CREDITS: Record<string, FilmCredit> = {
  YR_8uiBObZ4: {
    title: "Wild Together: My Wife's First Safari — Monwana Lodge, Thornybush, South Africa",
    credit: "Film by Felix Studios and Monwana",
    series: "Wild Together",
    seriesLine: "From Wild Together, James and Miriam's own series",
    creator: "Felix Studios",
    partner: "Monwana",
  },
};

/** The credit fields for a VideoObject: Felix Studios made it, the partner is credited alongside, and the series it belongs to. */
export function filmCreditSchema(id: string) {
  const c = FILM_CREDITS[id];
  if (!c) return {};
  const studio = { "@type": "Organization", name: c.creator };
  return {
    creditText: c.credit,
    creator: studio,
    productionCompany: studio,
    contributor: { "@type": "Organization", name: c.partner },
    isPartOf: { "@type": "CreativeWorkSeries", name: c.series, description: "James and Miriam's own series." },
  };
}
