// The Ledger, counted: live records in the Base44 Intelligence Library.
// Counted 24 Oct 2026 (Stay site_status "live"; every Vessel; live
// LandItinerary + live VesselVoyage = journeys). The Ledger export in step 5
// rewrites this file on each publish, so the home page tally never drifts
// from the library and never needs a client-side call.
export const LEDGER_COUNTS = {
  stays: 488,
  vessels: 28,
  journeys: 19,
  countedOn: "2026-10-24",
} as const;
