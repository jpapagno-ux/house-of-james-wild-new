// Journey Cart (Booking & Checkout Studio, Session 03). The cart's arithmetic and rules.
//
// Pure functions, no imports, so plain Node can test them (tests/journey-cart.test.ts).
// Money is INTEGER MINOR UNITS with an ISO-4217 currency, as in the pricing engine.
//
// The rules this file holds (project brief, 15 Nov 2026):
//   - An indicative price is not a confirmed rate: a live engine price, a contracted card and a supplier's own
//     published rate (approved by James, 15 Nov 2026) count as priced; a "from" fare never does.
//   - A supplier quotation is not confirmed inventory: nothing here ever says "confirmed".
//   - Payment success is not supplier acceptance: three statuses, kept apart.
//   - Florida sales tax is never added automatically.
//   - No rate, tax, deposit or payment method appears unless its source is on file.
//   - Commission is not calculated here: only the commissionable base is handed across.
//   - Payments are simulated: no card data is accepted, and anything card-shaped is refused.

export type Kind = "stay" | "voyage" | "journey" | "experience";
export type PriceSource = "albie_live" | "rate_card" | "published_rate" | "published_from" | "none";

export type Price = {
  source: PriceSource;
  /** Display amount, always USD. Null when no figure is on file. */
  usdMinor: number | null;
  /** The supplier's own figure, kept beside the USD display. */
  sourceMinor: number | null;
  sourceCurrency: string | null;
  fx: Fx | null;
  basis: string;
  provenance: string;
  fetchedAt: string | null;
  /** A card figure the house has marked as an estimate ("to be confirmed"). Shown, never counted as verified. */
  estimate?: boolean;
};

export type Fx = { rate: number; date: string; source: string };

export type Line = {
  id: string;
  kind: Kind;
  productKey: string;
  ledgerId: string;
  name: string;
  supplier: string;
  /** Stay: room. Voyage: cabin category. Experience: empty. */
  unit: string;
  unitKey: string;
  /** Voyage: the itinerary's name and slug, and the Airtable Departure Code where the departure is filed there. */
  voyage?: { slug: string; name: string; code?: string | null } | null;
  start: string;
  end: string;
  adults: number;
  plan?: string | null;
  parentId?: string | null;
  price: Price;
};

const PRICED: PriceSource[] = ["albie_live", "rate_card", "published_rate"];
export const verified = (p: Price) => PRICED.includes(p.source) && !p.estimate && p.usdMinor != null && p.usdMinor > 0;
/** A figure worth showing that is not this booking's price: a published from fare, or a card rate still marked as an estimate. */
export const indicative = (p: Price) => (p.source === "published_from" || (PRICED.includes(p.source) && Boolean(p.estimate))) && p.usdMinor != null && p.usdMinor > 0;
/** Priced by its source in the supplier's currency, with no conversion rate on file to show it in US dollars. */
export const pricedAbroad = (p: Price) => PRICED.includes(p.source) && !p.estimate && p.usdMinor == null && p.sourceMinor != null && p.sourceMinor > 0 && Boolean(p.sourceCurrency);

export const nightsBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
export const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

export const NO_PRICE = (basis: string, provenance: string): Price => ({ source: "none", usdMinor: null, sourceMinor: null, sourceCurrency: null, fx: null, basis, provenance, fetchedAt: null });

/** Source currency to USD. `rate` is units of the source currency per one US dollar (fx.json). */
export function toUsdMinor(sourceMinor: number, currency: string, fx: Fx | null): number | null {
  if (currency === "USD") return sourceMinor;
  if (!fx || !(fx.rate > 0)) return null;
  return Math.round(sourceMinor / fx.rate);
}

export function fmtMoney(minor: number, currency: string): string {
  const n = (minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (currency === "USD") return `US$${n}`;
  if (currency === "ZAR") return `R${n} ZAR`;
  if (currency === "EUR") return `€${n}`;
  return `${n} ${currency}`;
}

// ---------- Contracted seasonal cards (Ellerman House, once its card is published)

export type SeasonRule = { season: string; roomKey: string; stayStart: string; stayEnd: string; baseOccupancy: number; amountMinor: number; priority?: number; /** The rate applies only to stays of at least this many nights. */ minNights?: number };
export type SeasonNight = { date: string; season: string; amountMinor: number };

/** Night by night from a published card. Null when any night has no rule, or the party exceeds the base occupancy: the house then prices it. */
export function priceNights(rules: SeasonRule[], roomKey: string, arrival: string, departure: string, adults: number): { totalMinor: number; nights: SeasonNight[]; seasons: { season: string; nights: number; amountMinor: number }[] } | null {
  const n = nightsBetween(arrival, departure);
  if (!(n > 0) || n > 60) return null;
  const mine = rules.filter((r) => r.roomKey === roomKey && (r.minNights ?? 0) <= n);
  const nights: SeasonNight[] = [];
  for (let i = 0; i < n; i++) {
    const date = addDays(arrival, i);
    const hit = mine.filter((r) => r.stayStart <= date && date <= r.stayEnd).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
    if (!hit || adults > hit.baseOccupancy) return null;
    nights.push({ date, season: hit.season, amountMinor: hit.amountMinor });
  }
  const seasons: { season: string; nights: number; amountMinor: number }[] = [];
  for (const x of nights) {
    const s = seasons.find((y) => y.season === x.season && y.amountMinor === x.amountMinor);
    if (s) s.nights += 1; else seasons.push({ season: x.season, nights: 1, amountMinor: x.amountMinor });
  }
  return { totalMinor: nights.reduce((a, b) => a + b.amountMinor, 0), nights, seasons };
}

// ---------- Totals

export type Totals = { verifiedMinor: number; verifiedCount: number; fromMinor: number; fromCount: number; awaitingCount: number; abroad: { currency: string; minor: number }[] };

/** Piles that are never mixed: priced in US dollars, priced in another currency with no rate on file, indicative figures (from fares and estimated rates), and lines with no figure. */
export function cartTotals(lines: Line[]): Totals {
  const t: Totals = { verifiedMinor: 0, verifiedCount: 0, fromMinor: 0, fromCount: 0, awaitingCount: 0, abroad: [] };
  for (const l of lines) {
    if (verified(l.price)) { t.verifiedMinor += l.price.usdMinor as number; t.verifiedCount += 1; }
    else if (pricedAbroad(l.price)) { const c = l.price.sourceCurrency as string, a = t.abroad.find((x) => x.currency === c); if (a) a.minor += l.price.sourceMinor as number; else t.abroad.push({ currency: c, minor: l.price.sourceMinor as number }); }
    else if (indicative(l.price)) { t.fromMinor += l.price.usdMinor as number; t.fromCount += 1; }
    else t.awaitingCount += 1;
  }
  return t;
}

// ---------- Payment methods, by what the supplier's policy on file allows

export type Method = "pay_now" | "deposit_now" | "pay_at_property" | "advisor_assisted";
export const METHODS: Method[] = ["pay_now", "deposit_now", "pay_at_property", "advisor_assisted"];
export const METHOD_NAMES: Record<Method, string> = { pay_now: "Pay Now", deposit_now: "Deposit Now", pay_at_property: "Pay at Property", advisor_assisted: "Advisor Assisted" };

export type Policy = {
  payNow: { supported: boolean; basis: string };
  /** Deposit terms exactly as the supplier or its card states them. Null = not on file. */
  deposit: { percentBp: number | null; fixedMinor: number | null; basis: string } | null;
  depositNote: string;
  payAtProperty: { supported: boolean; basis: string };
  balance: string;
  cancellation: string;
  /** A term worth telling the traveler in plain words, where the supplier publishes one. */
  travelerNote?: string;
  /**
   * How a booking is confirmed, which is a separate question from where its price comes from.
   * "instant": the booking engine confirms as it takes payment (ALBIE by TAG).
   * "enquire": the house checks the dates with the supplier by hand, so nothing is paid until the house has confirmed.
   */
  confirm: { mode: "instant" | "enquire"; basis: string };
};

/** The words for the enquiry route, in one place (James, 18 Nov 2026: the traveler is told to enquire and the team confirms). */
export const ENQUIRE = {
  action: "Enquire to Confirm",
  line: "Please enquire, and the team at James Wild & Co will confirm your booking.",
  long: (supplier: string) => `Please enquire. The team at James Wild & Co checks your dates with ${supplier} and confirms your booking. Nothing is paid until they do.`,
};

export type Option = { method: Method; available: boolean; amountMinor: number | null; reason: string };

export function paymentOptions(line: Line, policy: Policy): Option[] {
  const ok = verified(line.price);
  const amount = ok ? (line.price.usdMinor as number) : null;
  const noFigure = line.price.estimate ? "The rate on file is an estimate, to be confirmed by the house." : line.price.source === "published_from" ? "The figure on file is a published from fare, not this booking's fare." : "No verified price is on file for this line.";
  const dep = policy.deposit;
  const depAmount = ok && dep ? (dep.fixedMinor ?? Math.round(((amount as number) * (dep.percentBp ?? 0)) / 10000)) : null;
  // Where the house confirms by hand, no charge opens before that confirmation, whatever the price source.
  const held = policy.confirm.mode === "enquire";
  const wait = `${line.supplier} is confirmed by hand, so nothing is paid until the house has confirmed your dates.`;
  return [
    { method: "pay_now", available: ok && policy.payNow.supported && !held, amountMinor: ok && policy.payNow.supported && !held ? amount : null, reason: !ok ? noFigure : policy.payNow.supported && held ? wait : policy.payNow.basis },
    { method: "deposit_now", available: Boolean(ok && dep && depAmount && depAmount > 0 && !held), amountMinor: depAmount && depAmount > 0 && !held ? depAmount : null, reason: !dep ? policy.depositNote : !ok ? `${dep.basis} ${noFigure}` : held ? `${dep.basis} ${wait}` : dep.basis },
    { method: "pay_at_property", available: policy.payAtProperty.supported, amountMinor: null, reason: policy.payAtProperty.basis },
    { method: "advisor_assisted", available: true, amountMinor: null, reason: held ? ENQUIRE.long(line.supplier) : "Your advisor confirms the rate and the supplier's terms with you, then takes payment by the house's approved method." },
  ];
}

// ---------- How far along each line is, in the traveler's words

export type Readiness = "ready" | "priced" | "from" | "quote";
export const READINESS_ORDER: Readiness[] = ["ready", "priced", "from", "quote"];
export const READINESS: Record<Readiness, { label: string; note: string }> = {
  ready: { label: "Ready to book", note: "A price and a way to pay are both on file. You can complete these today." },
  priced: { label: "Priced · please enquire", note: "The price is on file. Please enquire, and the team at James Wild & Co checks your dates and confirms your booking before anything is paid." },
  from: { label: "Indicative price · please enquire", note: "A from fare or an estimated rate, not a final price. Please enquire, and the team at James Wild & Co confirms the price and the space." },
  quote: { label: "Quoted by the house", note: "No price is on file yet. The house prices these against your dates and writes to you." },
};

/** Ready only when the price is verified, the booking confirms on the engine, AND the supplier's own policy opens a way to pay beyond the advisor. */
export function readiness(line: Line, policy: Policy): Readiness {
  if (line.kind === "experience") return "quote";
  if (verified(line.price) && paymentOptions(line, policy).some((o) => o.available && o.method !== "advisor_assisted")) return "ready";
  if (verified(line.price) || pricedAbroad(line.price)) return "priced";
  if (indicative(line.price)) return "from";
  return "quote";
}

// ---------- Dates that overlap across the journey

export type Clash = { a: string; b: string; from: string; to: string };

/** Pairs of chapters whose nights overlap. Leaving one on the day the next begins is not a clash. Experiences carry no dates. */
export function dateClashes(lines: Line[]): Clash[] {
  const xs = lines.filter((l) => l.kind !== "experience" && isDate(l.start) && isDate(l.end) && l.end > l.start);
  const out: Clash[] = [];
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
    const a = xs[i], b = xs[j];
    if (a.start < b.end && b.start < a.end) out.push({ a: a.id, b: b.id, from: a.start > b.start ? a.start : b.start, to: a.end < b.end ? a.end : b.end });
  }
  return out;
}

// ---------- The simulated payment provider. No network, no keys, no card data.

const CARD_KEY = /card|cvv|cvc|pan\b|expiry|exp_month|exp_year|security.?code/i;

function luhn(d: string) {
  let s = 0;
  for (let i = d.length - 1, alt = false; i >= 0; i--, alt = !alt) { let n = d.charCodeAt(i) - 48; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; }
  return s % 10 === 0;
}

/** True when a payload carries anything shaped like card data: a card-ish key, or 13 to 19 digits that pass Luhn. */
export function hasCardLikeData(v: unknown, depth = 0): boolean {
  if (depth > 6 || v == null) return false;
  if (typeof v === "string" || typeof v === "number") {
    const digits = String(v).replace(/[\s-]/g, "");
    return /^\d{13,19}$/.test(digits) && luhn(digits);
  }
  if (Array.isArray(v)) return v.some((x) => hasCardLikeData(x, depth + 1));
  if (typeof v === "object") return Object.entries(v as Record<string, unknown>).some(([k, x]) => CARD_KEY.test(k) || hasCardLikeData(x, depth + 1));
  return false;
}

export function hash(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36).padStart(7, "0");
}

/** One key per cart line, method and amount: a repeat of the same request is the same transaction. */
export const idempotencyKey = (cartId: string, lineId: string, method: Method, amountMinor: number | null) => `jc:${cartId}:${lineId}:${method}:${amountMinor ?? "na"}`;

export type SimRequest = { idempotencyKey: string; method: Method; amountMinor: number | null; currency: string; lineId: string; outcome?: "decline" | null };
export type SimStatus = "succeeded" | "declined" | "no_charge_due_at_property" | "no_charge_advisor_to_follow";
export type SimResponse = { provider: "simulation"; livemode: false; reference: string; idempotencyKey: string; lineId: string; method: Method; status: SimStatus; amountMinor: number; currency: string; message: string };

/** Deterministic: the same idempotency key always answers with the same reference and status. */
export function simulatePayment(r: SimRequest): SimResponse | { error: string } {
  if (!METHODS.includes(r.method)) return { error: "Unknown payment method" };
  if (!/^jc:[A-Za-z0-9:_-]{6,160}$/.test(r.idempotencyKey)) return { error: "Missing or malformed idempotency key" };
  const charge = r.method === "pay_now" || r.method === "deposit_now";
  if (charge && !(Number.isInteger(r.amountMinor) && (r.amountMinor as number) > 0)) return { error: "No verified amount for this method" };
  const base = { provider: "simulation" as const, livemode: false as const, reference: `sim_${hash(r.idempotencyKey)}`, idempotencyKey: r.idempotencyKey, lineId: r.lineId, method: r.method, currency: r.currency };
  if (!charge) {
    return r.method === "pay_at_property"
      ? { ...base, status: "no_charge_due_at_property", amountMinor: 0, message: "Nothing charged. Payment is due at the property, on the supplier's terms." }
      : { ...base, status: "no_charge_advisor_to_follow", amountMinor: 0, message: "Nothing charged. Your advisor will confirm the rate and terms, then arrange payment." };
  }
  if (r.outcome === "decline") return { ...base, status: "declined", amountMinor: 0, message: "Simulated decline. Nothing was charged. Choose another method or try again." };
  return { ...base, status: "succeeded", amountMinor: r.amountMinor as number, message: "Simulated payment accepted. No money moved." };
}

// ---------- Three statuses per line, never merged

export type Statuses = { request: { label: string; note: string }; payment: { label: string; note: string }; supplier: { label: string; note: string } };

export function lineStatuses(line: Line, pay: SimResponse | null, enquire = false): Statuses {
  const payment = !pay ? { label: "No payment", note: "No payment was started for this line." }
    : pay.status === "succeeded" ? { label: `Payment received (simulated) · ${fmtMoney(pay.amountMinor, pay.currency)}`, note: `${METHOD_NAMES[pay.method]} · reference ${pay.reference}. A payment is not a confirmed booking.` }
    : pay.status === "declined" ? { label: "Payment declined (simulated)", note: `Reference ${pay.reference}. Nothing was charged.` }
    : pay.status === "no_charge_due_at_property" ? { label: "No payment taken · due at the property", note: `Reference ${pay.reference}.` }
    : { label: "No payment taken · advisor to follow", note: `Reference ${pay.reference}.` };
  return {
    request: { label: enquire ? "Enquiry recorded (simulated)" : "Booking request recorded (simulated)", note: enquire ? `The team at James Wild & Co checks your dates with ${line.supplier} and writes to you. Nothing is booked until they confirm.` : verified(line.price) ? "Requested at the price shown, which the house re-checks before sending to the supplier." : "Requested without a verified price. The house prices it before anything is sent." },
    payment,
    supplier: { label: "Supplier confirmation pending", note: `${line.supplier} has not been asked and has not confirmed. No space is held.` },
  };
}

// ---------- What would be handed to the Advisor Rates & Commissions system (nothing is calculated here)

export function commissionHandoff(line: Line, advisorLedgerId: string) {
  return {
    lineId: line.id,
    ledgerId: line.ledgerId,
    supplier: line.supplier,
    advisorLedgerId,
    /** Room, cabin or fare only, and only when verified. Taxes, levies and fees are never commissionable. */
    commissionableBaseUsdMinor: line.kind !== "experience" && verified(line.price) ? line.price.usdMinor : null,
    commissionRate: "resolved by Advisor Rates & Commissions (Airtable Partner Brands and Contract Terms)",
    advisorShare: "resolved by Advisor Rates & Commissions",
  };
}

export type Traveler = { first: string; last: string };
export type Lead = Traveler & { email: string; phone: string; country: string };

export function validLead(l: Lead): string | null {
  if (l.first.trim().length < 1 || l.last.trim().length < 1) return "Please give the lead traveler's first and last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email.trim())) return "Please give an email address the house can reach you on.";
  if (hasCardLikeData(l)) return "Please do not type card numbers here. This preview never takes card details.";
  return null;
}

/** The records a real run would write through the existing Travel Ledger tables. Built for review; never written in simulation. */
export function ledgerHandoff(a: { cartId: string; lines: Line[]; lead: Lead; party: Traveler[]; advisor: { slug: string; ledgerId: string; name: string }; externalAdvisor: string; payments: Record<string, SimResponse | null>; confirm?: Record<string, "instant" | "enquire"> }) {
  return {
    written: false,
    mode: "simulation",
    journey: { reference: `SIMULATION-${hash(a.cartId).toUpperCase()}`, note: "Not a Ledger ID. The Library issues Folio and booking IDs when a real request is recorded." },
    advisor: { slug: a.advisor.slug, ledgerId: a.advisor.ledgerId, name: a.advisor.name, external: a.externalAdvisor.trim() || null },
    leadTraveler: { name: `${a.lead.first.trim()} ${a.lead.last.trim()}`.trim(), email: a.lead.email.trim(), country: a.lead.country.trim() || null, partySize: 1 + a.party.filter((p) => p.first.trim() || p.last.trim()).length },
    lines: a.lines.map((l) => ({
      table: l.kind === "experience" ? "folio_items" : l.kind === "journey" ? "advisor_requests, then quotes" : "quotes, then bookings",
      ledgerId: l.ledgerId, productKey: l.productKey, unitKey: l.unitKey || null, voyage: l.voyage?.slug ?? null, departureCode: l.voyage?.code ?? null,
      start: l.start || null, end: l.end || null, adults: l.adults,
      price: { source: l.price.source, verified: verified(l.price), estimate: Boolean(l.price.estimate), usdMinor: l.price.usdMinor, sourceMinor: l.price.sourceMinor, sourceCurrency: l.price.sourceCurrency, fx: l.price.fx, provenance: l.price.provenance, fetchedAt: l.price.fetchedAt },
      availability: "on_request",
      confirmation: a.confirm?.[l.id] ?? "enquire",
      statuses: lineStatuses(l, a.payments[l.id] ?? null, (a.confirm?.[l.id] ?? "enquire") === "enquire"),
      payment: a.payments[l.id] ? { table: "payments", provider: "simulation", reference: a.payments[l.id]!.reference, idempotencyKey: a.payments[l.id]!.idempotencyKey, status: a.payments[l.id]!.status, amountMinor: a.payments[l.id]!.amountMinor } : null,
      commission: commissionHandoff(l, a.advisor.ledgerId),
    })),
  };
}

// ---------- A journey as a link: what was chosen, never what it costs and never who is traveling

export type Pick = { productKey: string; unit: string; start: string; end: string; adults: number; experiences: string[] };
const B64 = { to: (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""), from: (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0))) };

/** The choices in a cart, for a link an advisor sends a client. No price travels in the link: every price is asked again from its source when it opens. */
export function encodeJourney(lines: Line[]): string {
  const picks = lines.filter((l) => l.kind !== "experience").map((l) => [l.productKey, l.unit, l.start, l.end, l.adults, lines.filter((x) => x.parentId === l.id).map((x) => x.name)]);
  return B64.to(JSON.stringify({ v: 1, l: picks }));
}

/** Null for anything malformed, oversized or card-shaped. The caller still checks each pick against the catalogue. */
export function decodeJourney(code: string): Pick[] | null {
  if (!code || code.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const j = JSON.parse(B64.from(code)) as { v?: unknown; l?: unknown };
    if (j.v !== 1 || !Array.isArray(j.l) || j.l.length < 1 || j.l.length > 12 || hasCardLikeData(j.l)) return null;
    const str = (x: unknown, max: number) => typeof x === "string" && x.length <= max;
    const out: Pick[] = [];
    for (const r of j.l as unknown[]) {
      if (!Array.isArray(r) || r.length !== 6) return null;
      const [productKey, unit, start, end, adults, exp] = r as unknown[];
      if (!str(productKey, 160) || !/^[a-z0-9:-]+$/.test(productKey as string) || !str(unit, 120) || !isDate(start as string) || !isDate(end as string) || (end as string) <= (start as string)) return null;
      if (!Number.isInteger(adults) || (adults as number) < 1 || (adults as number) > 20) return null;
      if (!Array.isArray(exp) || exp.length > 12 || !exp.every((e) => str(e, 160))) return null;
      out.push({ productKey: productKey as string, unit: unit as string, start: start as string, end: end as string, adults: adults as number, experiences: exp as string[] });
    }
    return out;
  } catch { return null; }
}
