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
