// Wild Pathways feature flag. On site-wide since the Voyages launch (James, 1 Nov 2026:
// "pathway chips switch ON site-wide when Voyages launches"), in every build, whatever the
// Vercel environment says; NEXT_PUBLIC_PATHWAYS=off is the emergency off switch.
// Import-free so plain Node can test it; same pattern as lib/booking-live/flags.ts.
export function readPathwaysFlag(env: Record<string, string | undefined>) {
  return env.NEXT_PUBLIC_PATHWAYS !== "off";
}
export const PATHWAYS_ON = readPathwaysFlag({ NEXT_PUBLIC_PATHWAYS: process.env.NEXT_PUBLIC_PATHWAYS });

/** Live hrefs when the flag is on; the preview pages otherwise (so nothing links to a 404). */
export const pathwayHref = (key: string) => (PATHWAYS_ON ? `/pathways/${key}` : `/preview/pathways/${key}`);
export const PATHWAYS_INDEX_HREF = PATHWAYS_ON ? "/pathways" : "/preview/pathways/stays#all-pathways";
