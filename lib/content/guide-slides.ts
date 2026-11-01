import type { Guide } from "./guides";
import type { TripImg } from "./trips";
import { stayBySlug } from "./stays";
import { DEFAULT_SHARE } from "@/lib/seo";

// A place guide's hero frames. Its own slides first; a place with none yet (IMAGE FOLLOW-UP)
// borrows its selected stay's photographs from the library export, the property's own frames,
// credited. Kept out of guides.ts so plain Node can still test the guide records.
export function guideSlides(g: Guide): TripImg[] {
  if (g.slides.length) return g.slides;
  const f = g.slidesFromStay;
  const s = f ? stayBySlug(f.slug) : undefined;
  const urls = s ? [...s.gallery, ...(s.hero ? [s.hero] : [])].filter((u, i, a) => a.indexOf(u) === i).slice(0, 4) : [];
  return urls.length && f ? urls.map((url) => ({ url, alt: f.alt, credit: f.credit })) : [DEFAULT_SHARE];
}
