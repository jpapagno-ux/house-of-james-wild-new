// Price and commission check (house only, D-25/D-26/D-32). Pure: takes a priced stay from the
// booking engine and the partner's commission term, and splits it the way the commission ledger
// will at booking. Money is whole cents; rates are basis points.
//
//   commissionable  = room rate after offers, less any tax the rate already includes (VAT)
//   gross           = commissionable x partner rate
//   advisor         = gross x the advisor's tier share (Tier 1 75%, Tier 2 70%, Tier 3 55%)
//   house           = gross - advisor
import { advisorShareForTier, applyBp, calculateCommission, type AdvisorTier, type CommissionResult } from "./commission.ts";

export type PricedStay = {
  currency: string;
  roomSubtotalMinor: number;
  discountsMinor: number;
  charges: { kind: string; included: boolean; amountMinor: number }[];
  grandTotalMinor: number;
};

export type CommissionCheck = CommissionResult & {
  currency: string;
  travelerPaysCents: number;
  roomAfterOffersCents: number;
  includedTaxCents: number;
  /** Gross commission if the partner pays on the rate including its VAT (to compare with the contract). */
  grossOnInclusiveRateCents: number;
};

export function checkCommission(stay: PricedStay, rateBp: number, tier: AdvisorTier | null): CommissionCheck {
  const roomAfterOffers = Math.max(0, stay.roomSubtotalMinor - stay.discountsMinor);
  const includedTax = stay.charges.filter((c) => c.included && c.kind !== "house_tax").reduce((s, c) => s + c.amountMinor, 0);
  const base = Math.max(0, roomAfterOffers - includedTax);
  const result = calculateCommission({
    basis: "commission",
    lines: [{ kind: "accommodation", cents: base }, { kind: "tax", cents: includedTax }],
    rateBp,
    advisorShareBp: advisorShareForTier(tier),
  });
  return {
    ...result,
    currency: stay.currency,
    travelerPaysCents: stay.grandTotalMinor,
    roomAfterOffersCents: roomAfterOffers,
    includedTaxCents: includedTax,
    grossOnInclusiveRateCents: applyBp(roomAfterOffers, rateBp),
  };
}

/** Form input, checked: nothing reaches the engine unless it is a sensible stay. */
export type CheckInput = { slug: string; room: string; arrival: string; nights: number; adults: number; tier: AdvisorTier };
export function parseCheckInput(sp: Record<string, string | undefined>, fallback: { slug: string; arrival: string }): CheckInput {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(sp.arrival ?? "") ? sp.arrival! : fallback.arrival;
  const int = (v: string | undefined, d: number, min: number, max: number) => {
    const n = Number(v); return Number.isInteger(n) && n >= min && n <= max ? n : d;
  };
  const tier = (["tier_1", "tier_2", "tier_3"] as const).find((t) => t === sp.tier) ?? "tier_2";
  return {
    slug: /^[a-z0-9-]{1,80}$/.test(sp.p ?? "") ? sp.p! : fallback.slug,
    room: /^[a-z0-9-]{1,120}$/.test(sp.room ?? "") ? sp.room! : "",
    arrival: date,
    nights: int(sp.nights, 3, 1, 30),
    adults: int(sp.adults, 2, 1, 12),
    tier,
  };
}
