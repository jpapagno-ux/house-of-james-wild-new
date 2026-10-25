// The price builder's arithmetic, shared by Journey (Overland) and Voyage
// pages (audit addendum, 25 Oct 2026):
//   subtotal = (option pp + add-ons pp) × travellers
//   tax      = 7% of subtotal (basis still to confirm)
//   total    = subtotal + tax
//   deposit  = US$500 × travellers;  balance = total − deposit
// Every figure is per person, double occupancy, until real prices are filed.
// Kept free of imports so it can be tested with plain Node.

export type PriceInput = { optionPP: number; addOnsPP: number[]; travellers: number; taxRate?: number; depositPP?: number };
export type PriceResult = { perPersonBase: number; subtotal: number; tax: number; total: number; perPerson: number; deposit: number; balance: number };

export const TAX_RATE = 0.07;
export const DEPOSIT_PP = 500;

export function priceTrip({ optionPP, addOnsPP, travellers, taxRate = TAX_RATE, depositPP = DEPOSIT_PP }: PriceInput): PriceResult {
  const n = Math.max(1, Math.floor(travellers));
  const perPersonBase = optionPP + addOnsPP.reduce((a, b) => a + b, 0);
  const subtotal = perPersonBase * n;
  const total = Math.round(subtotal * (1 + taxRate));
  const tax = total - subtotal;
  const deposit = depositPP * n;
  return { perPersonBase, subtotal, tax, total, perPerson: Math.round(total / n), deposit, balance: total - deposit };
}

export const usd = (n: number) => `US$${n.toLocaleString("en-US")}`;
