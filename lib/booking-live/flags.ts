// Booking Live feature flags. Every flag is OFF unless its env var is exactly
// "on", so production looks identical until James switches a flag on in
// Vercel → Settings → Environment Variables. Kept free of imports so plain
// Node can test it.
//
// Phase 1
//   NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS  /account pages, sign-in, /api/v1/me/*
//   NEXT_PUBLIC_BOOKING_LIVE_SAVE      "Save to My Folio" on stay pages (needs ACCOUNTS)
//   NEXT_PUBLIC_BOOKING_LIVE_SHARE     shared Folios and invitations (needs ACCOUNTS)
// Phase 2
//   NEXT_PUBLIC_BOOKING_LIVE_QUOTES    Check Availability, contracted-card quotes, Request to Reserve (needs ACCOUNTS)
// Phase 3b
//   NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS  Pay deposit / balance on a booking (needs QUOTES; the gateway itself is server env: PAYMENTS_PROVIDER, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)

export type FlagName = "accounts" | "save" | "share" | "quotes" | "payments";

type Env = Record<string, string | undefined>;

export function readFlags(env: Env) {
  const on = (k: string) => env[k] === "on";
  const accounts = on("NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS") && Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return {
    accounts,
    save: accounts && on("NEXT_PUBLIC_BOOKING_LIVE_SAVE"),
    share: accounts && on("NEXT_PUBLIC_BOOKING_LIVE_SHARE"),
    quotes: accounts && on("NEXT_PUBLIC_BOOKING_LIVE_QUOTES"),
    payments: accounts && on("NEXT_PUBLIC_BOOKING_LIVE_QUOTES") && on("NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS"),
  } satisfies Record<FlagName, boolean>;
}

// NEXT_PUBLIC_* values are inlined at build time, so each is read by name.
export const FLAGS = readFlags({
  NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS: process.env.NEXT_PUBLIC_BOOKING_LIVE_ACCOUNTS,
  NEXT_PUBLIC_BOOKING_LIVE_SAVE: process.env.NEXT_PUBLIC_BOOKING_LIVE_SAVE,
  NEXT_PUBLIC_BOOKING_LIVE_SHARE: process.env.NEXT_PUBLIC_BOOKING_LIVE_SHARE,
  NEXT_PUBLIC_BOOKING_LIVE_QUOTES: process.env.NEXT_PUBLIC_BOOKING_LIVE_QUOTES,
  NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS: process.env.NEXT_PUBLIC_BOOKING_LIVE_PAYMENTS,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});
