// Partner Desk feature flag. OFF unless NEXT_PUBLIC_PARTNER_DESK is exactly "on"
// AND Supabase is configured, so production looks identical until James switches it
// on (Vercel → Settings → Environment Variables, Preview only during Stage 1).
// Independent of the Booking Live traveler flags. No imports, so plain Node can test it.

type Env = Record<string, string | undefined>;

export function readPartnerDeskFlag(env: Env): boolean {
  return env.NEXT_PUBLIC_PARTNER_DESK === "on" && Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// NEXT_PUBLIC_* values are inlined at build time, so each is read by name.
export const PARTNER_DESK = readPartnerDeskFlag({
  NEXT_PUBLIC_PARTNER_DESK: process.env.NEXT_PUBLIC_PARTNER_DESK,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Advisor Desk (/advisor). ON wherever Supabase is configured (James, 19 Nov 2026: advisors are invited and must be
// able to sign in); set NEXT_PUBLIC_ADVISOR_DESK to "off" to close it.
export function readAdvisorDeskFlag(env: Env): boolean {
  return env.NEXT_PUBLIC_ADVISOR_DESK !== "off" && Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export const ADVISOR_DESK = readAdvisorDeskFlag({
  NEXT_PUBLIC_ADVISOR_DESK: process.env.NEXT_PUBLIC_ADVISOR_DESK,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
