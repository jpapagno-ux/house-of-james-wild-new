// Iggi embed feature flag (Stage 2). Off unless NEXT_PUBLIC_IGGI is exactly
// "on", so production is byte-identical until James switches it on in Vercel →
// Settings → Environment Variables (Preview first). Same pattern as the Wild
// Pathways flag in lib/content/pathways/flag.ts.
export function readIggiFlag(env: Record<string, string | undefined>) {
  return env.NEXT_PUBLIC_IGGI === "on";
}
export const IGGI_ON = readIggiFlag({ NEXT_PUBLIC_IGGI: process.env.NEXT_PUBLIC_IGGI });

/** The Iggi Core (Base44 Journey Intelligence) embed host — Contract C1/C3. */
export const IGGI_CORE_ORIGIN = "https://wild-journey-intel.base44.app";
