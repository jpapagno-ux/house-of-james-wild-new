// The price builder's arithmetic, shared by Journey (Overland) and Voyage
// pages (audit addendum, 25 Oct 2026):
//   subtotal = (option pp + add-ons pp) × travellers
//   tax      = the destination's own tax, when the rate excludes it (taxRate)
//   fl tax   = none. The house adds no Florida sales tax (James, 15 Nov 2026; the 7% rule of 27 Oct 2026 is withdrawn)
//   total    = subtotal + tax
//   deposit  = US$500 × travellers;  balance = total − deposit
// Every figure is per person, double occupancy, until real prices are filed.
// Kept free of imports so it can be tested with plain Node.

export type PriceInput = { optionPP: number; addOnsPP: number[]; travellers: number; taxRate?: number; depositPP?: number };
export type PriceResult = { perPersonBase: number; subtotal: number; tax: number; flTax: number; total: number; perPerson: number; deposit: number; balance: number };

/** Destination tax added on top when a rate excludes it (default none). */
export const TAX_RATE = 0;
/** Florida sales tax: none (James, 15 Nov 2026). Kept as a named zero so the result shape and stored quotes stay readable. */
export const FL_TAX_RATE = 0;
export const DEPOSIT_PP = 500;

export function priceTrip({ optionPP, addOnsPP, travellers, taxRate = TAX_RATE, depositPP = DEPOSIT_PP }: PriceInput): PriceResult {
  const n = Math.max(1, Math.floor(travellers));
  const perPersonBase = optionPP + addOnsPP.reduce((a, b) => a + b, 0);
  const subtotal = perPersonBase * n;
  const tax = Math.round(subtotal * taxRate);
  const flTax = Math.round((subtotal + tax) * FL_TAX_RATE);
  const total = subtotal + tax + flTax;
  const deposit = depositPP * n;
  return { perPersonBase, subtotal, tax, flTax, total, perPerson: Math.round(total / n), deposit, balance: total - deposit };
}

export const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
