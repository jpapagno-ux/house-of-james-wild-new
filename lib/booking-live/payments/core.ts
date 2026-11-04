// Payments, the pure part: which amount a traveler may pay next on a booking.
// No imports, so plain Node tests it (tests/payments.test.ts) and the client
// bundle may import it. The webhook signature check lives in webhook.ts
// (Node crypto, server only).

export type PayKind = "deposit" | "balance";
export type BookingMoney = { status: string; grand_total_minor: number | string; deposit_due_minor: number | string; deposit_paid_minor: number | string; balance_paid_minor: number | string; balance_due_date: string | null };

/** What the traveler can pay now: the outstanding deposit first, then the balance. Null when nothing is payable. */
export function nextPayment(b: BookingMoney): { kind: PayKind; amountMinor: number } | null {
  if (b.status === "cancelled" || b.status === "stayed") return null;
  const total = Number(b.grand_total_minor), dep = Number(b.deposit_due_minor), depPaid = Number(b.deposit_paid_minor), balPaid = Number(b.balance_paid_minor);
  const owed = total - depPaid - balPaid;
  if (owed <= 0) return null;
  if (depPaid < dep) return { kind: "deposit", amountMinor: Math.min(dep - depPaid, owed) };
  return { kind: "balance", amountMinor: owed };
}

/** Currencies Stripe treats as zero-decimal (minor unit = major unit). */
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
/** Our minor units are ISO minor units; Stripe's "amount" is the same except it has no decimals for zero-decimal currencies — identical in practice. Kept explicit so a future currency can't surprise us. */
export function stripeAmount(amountMinor: number, currency: string): number { return ZERO_DECIMAL.has(currency) ? amountMinor : amountMinor; }
