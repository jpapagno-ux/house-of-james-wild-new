// Wild Pathways feature flag. Off unless NEXT_PUBLIC_PATHWAYS is exactly "on",
// so production is byte-identical until James switches it on in Vercel →
// Settings → Environment Variables (Preview first). Import-free so plain Node
// can test it; same pattern as lib/booking-live/flags.ts.
export function readPathwaysFlag(env: Record<string, string | undefined>) {
  return env.NEXT_PUBLIC_PATHWAYS === "on";
}
export const PATHWAYS_ON = readPathwaysFlag({ NEXT_PUBLIC_PATHWAYS: process.env.NEXT_PUBLIC_PATHWAYS });

/** Live hrefs when the flag is on; the preview pages otherwise (so nothing links to a 404). */
export const pathwayHref = (key: string) => (PATHWAYS_ON ? `/pathways/${key}` : `/preview/pathways/${key}`);
export const PATHWAYS_INDEX_HREF = PATHWAYS_ON ? "/pathways" : "/preview/pathways/stays#all-pathways";
