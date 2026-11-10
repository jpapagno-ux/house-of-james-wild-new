import FLAGGED from "./interior-photos.json";

// No room shots as the first view (James, 10 Nov 2026: "we don't want views of inside the rooms on the hero page ... a rule
// for stays and gatherings ... more experience, scenery, overhead, more dramatic hero photos"). Library file names are
// mostly upload hashes, so the alt text cannot tell a bedroom from a beach: every stay's first-screen photographs were
// looked at by eye (10 Nov 2026 audit, 498 stays) and the interiors (rooms, bathrooms, lounges, dining rooms, spas, food
// close-ups, award badges) are filed here by stay. A filed photograph never leads a stay: not the hero, not a card, not an
// arrival frame or the close. It stays in the gallery and in the rooms, further down the page.

/** One key per photograph, the same however it is delivered: the Cloudinary public id without transformations or
 *  version, or the original Webflow file name inside a Base44 copy (media.base44.com or the /img/b44 mirror). */
export function photoKey(url: string): string {
  const u = url.split("?")[0];
  const c = u.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.*)$/);
  if (c) return c[1].replace(/^(?:(?:[a-z]{1,3}_[^/]*|v\d+)\/)*/, "").replace(/\.(jpe?g|png|webp|avif)$/i, "");
  const b = u.match(/\/[0-9a-f]{9}_[0-9a-f]{9}_([^/]+?)(?:\.[a-z0-9]+)?$/);
  if (b) return `b44:${b[1]}`;
  return u;
}

const ALL = new Set(Object.values(FLAGGED as Record<string, string[]>).flat());
export const isInteriorPhoto = (url: string | null | undefined) => !!url && ALL.has(photoKey(url));

/** The same list with the filed interiors moved to the end, order otherwise kept. */
export function outdoorFirst<T>(xs: T[], url: (x: T) => string): T[] {
  return [...xs.filter((x) => !isInteriorPhoto(url(x))), ...xs.filter((x) => isInteriorPhoto(url(x)))];
}
