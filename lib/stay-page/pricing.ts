// Pricing-state resolution for one accommodation. Pure functions, no imports
// beyond types, so plain Node can test them (tests/stay-page.test.ts).
//
// The question answered here, per unit and per search, is "what may the
// traveler be told about price and availability right now?" The answer is
// built from three separate facts:
//   1. what the live source said for the dates searched (if anything);
//   2. whether Booking Live holds an APPROVED rate card for the unit;
//   3. the unit's declared pricing mode.
// A legacy_reference price is never one of the inputs that reaches the
// traveler: it stays on the contract for provenance and QA only.

import type { AccommodationPricingState, AccommodationUnit, DisplayPrice, PricingProvenance, PricingSourceType } from "./contract";

export type LiveSearch = { checkIn: string; checkOut: string; adults: number };
/** One live-engine answer, as /api/rates returns it (lib/rates.ts shape). */
export type LiveResult = {
  status: "idle" | "loading" | "ok" | "none" | "error";
  nights: number;
  currency: string;
  fetchedAt: string | null;
  provider: string;
  plans: { plan: string; rooms: { name: string; total: number }[] }[];
};

/** Normalise a room name for matching the engine's heading to a Booking Live unit. */
export const matchKey = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]/g, "");

export function liveOptionsFor(unit: AccommodationUnit, search: LiveSearch, live: LiveResult): DisplayPrice[] {
  const key = matchKey(unit.liveMatchKey || unit.name);
  const out: DisplayPrice[] = [];
  for (const plan of live.plans) {
    for (const room of plan.rooms) {
      if (matchKey(room.name) !== key) continue;
      const provenance: PricingProvenance = {
        sourceType: "LIVE_DYNAMIC", provider: live.provider, currency: live.currency,
        retrievedAt: live.fetchedAt, verifiedAt: null, validFrom: search.checkIn, validTo: search.checkOut,
        availability: "available", availabilityCheckedAt: live.fetchedAt, reference: plan.plan,
      };
      out.push({
        total: { amount: room.total, currency: live.currency },
        perNight: live.nights > 0 ? { amount: room.total / live.nights, currency: live.currency } : null,
        nights: live.nights > 0 ? live.nights : null,
        label: plan.plan,
        provenance,
      });
    }
  }
  return out.sort((a, b) => a.total.amount - b.total.amount);
}

/** The property-level mode: live if any unit is live, hybrid if mixed, else the common mode. */
export function propertyPricingMode(units: { pricingMode: PricingSourceType }[], hasLiveEngine: boolean): PricingSourceType {
  const modes = new Set(units.map((u) => u.pricingMode));
  if (modes.has("HYBRID") || modes.size > 1) return "HYBRID";
  const only = [...modes][0];
  if (!only) return hasLiveEngine ? "LIVE_DYNAMIC" : "REQUEST_QUOTE";
  return only;
}

/** Map Booking Live's room_types.pricing_mode text onto the contract. Unknown → REQUEST_QUOTE (never a price). */
export function pricingModeFrom(raw: string | null | undefined, hasLiveEngine: boolean): PricingSourceType {
  switch ((raw ?? "").toLowerCase()) {
    case "live": case "live_dynamic": return "LIVE_DYNAMIC";
    case "rate_card": case "card": return "RATE_CARD";
    case "fixed_departure": return "FIXED_DEPARTURE";
    case "fit": case "fit_priced": return "FIT_PRICED";
    case "hybrid": return "HYBRID";
    case "request": case "request_quote": case "quote": return "REQUEST_QUOTE";
    case "legacy_reference": case "reference": return "LEGACY_REFERENCE";
    default: return hasLiveEngine ? "HYBRID" : "REQUEST_QUOTE";
  }
}

/**
 * Resolve the traveler-facing state for one unit.
 *  • LIVE_DYNAMIC / HYBRID units ask the live source first; a live answer wins.
 *  • No live answer for the dates → an approved rate card (rate known, availability
 *    on request) if there is one, else Request Pricing. The legacy reference rate is
 *    never a fallback.
 *  • RATE_CARD units never show live prices even if the engine happens to list them.
 *  • LEGACY_REFERENCE as a declared mode means "nothing approved": Request Pricing.
 */
export function resolvePricingState(unit: AccommodationUnit, search: LiveSearch | null, live: LiveResult | null): AccommodationPricingState {
  const mode = unit.pricingMode;
  const card = unit.rateCardFrom && unit.rateCardFrom.provenance.sourceType === "RATE_CARD" ? unit.rateCardFrom : null;

  if (mode === "RATE_CARD") return card ? { kind: "rate_card", from: card } : { kind: "request_quote", reason: "no_approved_source" };
  if (mode === "REQUEST_QUOTE" || mode === "LEGACY_REFERENCE" || mode === "FIT_PRICED" || mode === "FIXED_DEPARTURE") {
    return card ? { kind: "rate_card", from: card } : { kind: "request_quote", reason: mode === "REQUEST_QUOTE" ? "manual_pricing" : "no_approved_source" };
  }

  // LIVE_DYNAMIC or HYBRID from here.
  if (!search || !live || live.status === "idle" || live.status === "loading") return { kind: "checking" };
  if (live.status === "error") return card ? { kind: "rate_card", from: card } : { kind: "source_error" };
  const options = liveOptionsFor(unit, search, live);
  if (options.length) return { kind: "live", options, dates: search };
  if (card) return { kind: "rate_card", from: card };
  if (live.status === "none") return { kind: "unavailable_for_dates", dates: { checkIn: search.checkIn, checkOut: search.checkOut } };
  return { kind: "request_quote", reason: "no_live_rate_for_dates", dates: { checkIn: search.checkIn, checkOut: search.checkOut } };
}

/** The short, calm words for a state (collapsed card). */
export function pricingStatusLabel(state: AccommodationPricingState): { label: string; tone: "live" | "quiet" | "muted" } {
  switch (state.kind) {
    case "checking": return { label: "Checking availability", tone: "muted" };
    case "live": return { label: "Live rate", tone: "live" };
    case "rate_card": return { label: "Rates available", tone: "quiet" };
    case "unavailable_for_dates": return { label: "Not open on these dates", tone: "muted" };
    case "source_error": return { label: "Rate on request", tone: "quiet" };
    case "request_quote": return { label: "Designed for you", tone: "quiet" };
  }
}

/** Money formatting shared by the components. USD → "US$1,589"; others → "ZAR 16,500". */
export function formatMoney(amount: number, currency: string): string {
  const n = Math.round(amount).toLocaleString("en-US");
  return currency === "USD" ? `US$${n}` : `${currency} ${n}`;
}

/** A plain-words provenance line: "Live · Tag Albie booking engine · checked 1 Nov, 05:51". */
export function provenanceLine(p: PricingProvenance): string {
  const when = p.retrievedAt ?? p.availabilityCheckedAt ?? p.verifiedAt;
  const stamp = when ? new Date(when).toLocaleString("en-US", { dateStyle: "medium", timeStyle: p.retrievedAt ? "short" : undefined, timeZone: "UTC" }) : null;
  const head = p.sourceType === "LIVE_DYNAMIC" ? "Live" : p.sourceType === "RATE_CARD" ? "Contracted rate" : "Reference";
  const avail = p.availability === "available" ? "available for your dates" : p.availability === "on_request" ? "availability confirmed on request" : p.availability === "unavailable" ? "not open on these dates" : null;
  return [head, p.provider, stamp ? `${p.retrievedAt ? "checked" : "verified"} ${stamp}` : null, avail].filter(Boolean).join(" · ");
}
