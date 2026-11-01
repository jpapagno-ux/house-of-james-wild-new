// Media adapter: Cloudinary is the production master; a unit that has no
// Cloudinary id yet falls back to the source URLs Booking Live carried over
// from the migration (Webflow CDN). Pure, testable.

import type { StayImage } from "../contract";

const CLD = "https://res.cloudinary.com/jhlnq5h5/image/upload";
export const cloudinaryUrl = (publicId: string, w = 1600) => `${CLD}/c_limit,w_${w}/q_auto:good/f_auto/${publicId}`;

// Hosts the site may render (next.config.ts remotePatterns). Anything else is dropped, never a broken image.
const ALLOWED = [/\.supabase\.co$/, /^res\.cloudinary\.com$/, /^cdn\.prod\.website-files\.com$/, /^media\.base44\.com$/, /^base44\.app$/];
// Retired media stores: the WES v1 Supabase project is inactive, so its storage URLs no longer resolve.
const RETIRED = [/^xagdnmohexklddgsqdpd\.supabase\.co$/];

export function usableUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const h = new URL(u).hostname;
    if (RETIRED.some((r) => r.test(h))) return null;
    return ALLOWED.some((r) => r.test(h)) ? u : null;
  } catch { return null; }
}

export function unitMedia(input: { name: string; stayName: string; heroMediaId: string | null; galleryMediaIds: string[] | null; sourceHeroUrl: string | null; sourceGalleryUrls: string[] | null }): { hero: StayImage | null; gallery: StayImage[] } {
  const alt = (i: number) => (i === 0 ? `${input.name} at ${input.stayName}` : `${input.name} at ${input.stayName}, photograph ${i + 1}`);
  const seen = new Set<string>();
  const list: StayImage[] = [];
  const push = (url: string | null, source: StayImage["source"]) => { if (url && !seen.has(url)) { seen.add(url); list.push({ url, alt: alt(list.length), source }); } };
  if (input.heroMediaId) push(cloudinaryUrl(input.heroMediaId), "cloudinary");
  for (const id of input.galleryMediaIds ?? []) push(cloudinaryUrl(id), "cloudinary");
  push(usableUrl(input.sourceHeroUrl), "legacy_cdn");
  for (const u of input.sourceGalleryUrls ?? []) push(usableUrl(u), "legacy_cdn");
  return { hero: list[0] ?? null, gallery: list };
}
