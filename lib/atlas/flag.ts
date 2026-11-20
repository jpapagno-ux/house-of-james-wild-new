// Atlas Search, Phase 01: a staging pilot (James, 20 Nov 2026). OFF everywhere unless NEXT_PUBLIC_ATLAS is exactly
// "on", or the build is the Vercel PREVIEW of the pilot's own branch. Production (VERCEL_ENV "production") can never
// satisfy the second test, so merging this file changes nothing on the live site until the flag is set by hand.
// Read on the server only (the home page and /atlas pass the answer down), so no client bundle depends on it.
export const ATLAS_BRANCH = "feature/atlas-search-phase-01";
type Env = Record<string, string | undefined>;
export function readAtlasFlag(env: Env): boolean {
  if (env.NEXT_PUBLIC_ATLAS === "on") return true;
  if (env.NEXT_PUBLIC_ATLAS === "off") return false;
  return env.VERCEL_ENV === "preview" && env.VERCEL_GIT_COMMIT_REF === ATLAS_BRANCH;
}
export const ATLAS_ON = readAtlasFlag({ NEXT_PUBLIC_ATLAS: process.env.NEXT_PUBLIC_ATLAS, VERCEL_ENV: process.env.VERCEL_ENV, VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF });
