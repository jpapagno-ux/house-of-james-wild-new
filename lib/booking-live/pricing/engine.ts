// Booking Live · Phase 2 · contracted rate-card pricing engine (spec §6).
//
// Pure functions, no imports, so plain Node can test them. Money is always
// INTEGER MINOR UNITS (cents) with an ISO-4217 currency; percentages are
// BASIS POINTS (700 = 7%). Dates are the property's local calendar dates
// (YYYY-MM-DD); a "night" is the date you go to sleep.
//
// Order of operations (James, 27 Oct 2026):
//   room nights (season by season, night by night)
//   − promotions
//   + local taxes and mandatory fees the rate EXCLUDES (included ones are shown, not added)
//   + 7% Florida sales tax on everything above            (house rule)
//   = grand total → deposit now, balance by the due date
//
// A contracted rate card is NEVER proof of availability: every quote from
// here carries availability "on_request" until the property confirms.

export type Bp = number; // basis points
export type Minor = number; // integer minor units

export type ChildBand = { minAge: number; maxAge: number; amountMinor: Minor };

export type SeasonalRule = {
  id: string;
  season: string; // "High", "Green", "Festive"…
  roomTypeId: string;
  ratePlanId: string;
  stayStart: string; // inclusive
  stayEnd: string; // inclusive (last night this rate applies)
  bookingStart?: string | null;
  bookingEnd?: string | null;
  baseOccupancy: number; // adults included in amountMinor
  amountMinor: Minor; // per room, per night, for baseOccupancy adults
  extraAdultMinor?: Minor | null;
  childBands?: ChildBand[];
  minNights?: number | null;
  maxNights?: number | null;
  daysOfWeek?: number[] | null; // 0 = Sunday … 6 = Saturday; null = every night
  priority?: number; // higher wins when rules overlap
};

export type Restriction = {
  id: string;
  roomTypeId?: string | null; // null = whole property
  ratePlanId?: string | null;
  start: string; // inclusive
  end: string; // inclusive
  type: "closed" | "min_stay" | "close_to_arrival" | "close_to_departure";
  minimumStay?: number | null;
};

export type Promotion = {
  code: string;
  label: string;
  type: "percent" | "fixed_per_night" | "nth_night_free";
  value: number; // bp for percent, minor for fixed_per_night, N for nth_night_free (stay N pay N-1)
  bookingStart?: string | null;
  bookingEnd?: string | null;
  stayStart?: string | null;
  stayEnd?: string | null;
  minNights?: number | null;
  ratePlanIds?: string[] | null; // null = all plans
  stacking: "exclusive" | "stackable";
  approved: boolean;
};

export type TaxRule = {
  id: string;
  name: string; // "VAT", "Tourism levy", "Conservation fee"…
  kind: "tax" | "fee";
  basis: "percent_of_room" | "per_person_per_night" | "per_room_per_night" | "per_stay";
  percentBp?: Bp | null;
  amountMinor?: Minor | null;
  included: boolean; // already inside the nightly rate?
  minAge?: number | null; // per-person charges: lowest age that pays (null = everyone)
};

export type PaymentTerms = {
  depositPercentBp?: Bp | null; // e.g. 3000 = 30%
  depositFixedMinor?: Minor | null; // per booking
  balanceDueDaysBeforeArrival: number; // 0 = on arrival
};

export type CancellationTier = { daysBeforeArrival: number; penaltyBp: Bp }; // cancel within N days → pay penaltyBp of total

export type RateCard = {
  versionId: string; // e.g. "leeu-estates:2027-V1:rev3"
  propertySlug: string;
  currency: string; // ISO-4217
  status: "draft" | "approved" | "published" | "retired";
  rules: SeasonalRule[];
  restrictions: Restriction[];
  promotions: Promotion[];
  taxes: TaxRule[];
  paymentTerms: PaymentTerms;
  cancellation: { summary: string; tiers: CancellationTier[] };
};

export type Room = { id: string; name: string; maxAdults: number; maxChildren: number; maxOccupancy: number };

export type QuoteRequest = {
  roomTypeId: string;
  ratePlanId: string;
  arrival: string;
  departure: string;
  adults: number;
  childAges: number[];
  bookingDate: string; // today in the property's time zone (see localToday)
  promoCode?: string | null;
};

export type NightLine = {
  date: string;
  ruleId: string;
  season: string;
  baseMinor: Minor;
  extraAdultsMinor: Minor;
  childrenMinor: Minor;
  totalMinor: Minor;
};

export type ChargeLine = { id: string; name: string; kind: "tax" | "fee" | "house_tax"; included: boolean; amountMinor: Minor };
export type DiscountLine = { code: string; label: string; amountMinor: Minor };

export type Quote = {
  ok: true;
  currency: string;
  nights: NightLine[];
  roomSubtotalMinor: Minor;
  discounts: DiscountLine[];
  discountsMinor: Minor;
  charges: ChargeLine[];
  taxesMinor: Minor; // excluded local taxes + fees added
  floridaTaxMinor: Minor;
  grandTotalMinor: Minor;
  depositDueMinor: Minor;
  balanceMinor: Minor;
  balanceDueDate: string | null; // null when everything is due now
  cancellation: { summary: string; deadlines: { from: string; penaltyBp: Bp; penaltyMinor: Minor }[] };
  availability: "on_request"; // contracted cards never confirm inventory
  source: "contracted_card";
  rateCardVersion: string;
  revision: string; // changes whenever any input or card value changes
};

export type QuoteError = { ok: false; code: QuoteErrorCode; message: string; date?: string };
export type QuoteErrorCode =
  | "card_not_published" | "invalid_dates" | "past_arrival" | "occupancy_exceeded" | "child_age_unpriced"
  | "no_rate_for_night" | "booking_window" | "closed" | "min_stay" | "max_stay" | "closed_to_arrival"
  | "closed_to_departure" | "promo_invalid" | "invalid_card";

/** Florida sales tax on everything the house sells (James, 27 Oct 2026). */
export const FL_TAX_BP: Bp = 700;

// ---------- dates (calendar arithmetic in UTC, so no daylight-saving drift)

const DAY = 86_400_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export function isDate(s: unknown): s is string {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  return new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
}
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
export const addDays = (d: string, n: number) => new Date(toMs(d) + n * DAY).toISOString().slice(0, 10);
export const nightsBetween = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / DAY);
const dow = (d: string) => new Date(toMs(d)).getUTCDay();
const within = (d: string, start?: string | null, end?: string | null) => (!start || d >= start) && (!end || d <= end);

/** Today's calendar date in an IANA time zone (e.g. "Africa/Johannesburg"). */
export function localToday(timeZone: string, now: Date = new Date()): string {
  try { new Intl.DateTimeFormat("en-CA", { timeZone }); } catch { timeZone = "UTC"; }
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

// ---------- money helpers (integer, round half up)

export const pct = (amount: Minor, bp: Bp): Minor => Math.floor((amount * bp + 5000) / 10_000);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ---------- revision id: FNV-1a 32-bit over canonical JSON (deterministic, import-free)

export function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o).sort().filter((k) => o[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(",")}}`;
}
export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

// ---------- the engine

const fail = (code: QuoteErrorCode, message: string, date?: string): QuoteError => ({ ok: false, code, message, ...(date ? { date } : {}) });

function pickRule(card: RateCard, req: QuoteRequest, night: string): SeasonalRule | null {
  const candidates = card.rules.filter((r) =>
    r.roomTypeId === req.roomTypeId && r.ratePlanId === req.ratePlanId &&
    within(night, r.stayStart, r.stayEnd) &&
    (!r.daysOfWeek || r.daysOfWeek.length === 0 || r.daysOfWeek.includes(dow(night))));
  if (!candidates.length) return null;
  // Highest priority; then the narrowest date range (most specific); then id for a stable result.
  return [...candidates].sort((a, b) =>
    (b.priority ?? 0) - (a.priority ?? 0) ||
    nightsBetween(a.stayStart, a.stayEnd) - nightsBetween(b.stayStart, b.stayEnd) ||
    a.id.localeCompare(b.id))[0];
}

function childCharge(rule: SeasonalRule, age: number): Minor | null {
  const band = (rule.childBands ?? []).find((b) => age >= b.minAge && age <= b.maxAge);
  return band ? band.amountMinor : null;
}

function promoDiscount(p: Promotion, nights: NightLine[], subtotal: Minor): Minor {
  if (p.type === "percent") return pct(subtotal, p.value);
  if (p.type === "fixed_per_night") return Math.min(subtotal, p.value * nights.length);
  // nth_night_free: stay N, pay N−1 — the cheapest nights in the stay are free.
  const free = Math.floor(nights.length / p.value);
  return sum([...nights].map((n) => n.totalMinor).sort((a, b) => a - b).slice(0, free));
}

export function quote(card: RateCard, room: Room, req: QuoteRequest): Quote | QuoteError {
  // Card and request sanity
  if (card.status !== "published") return fail("card_not_published", "This rate card isn't published yet.");
  if (!/^[A-Z]{3}$/.test(card.currency)) return fail("invalid_card", "Rate card currency is missing.");
  if (!isDate(req.arrival) || !isDate(req.departure) || !isDate(req.bookingDate)) return fail("invalid_dates", "Dates must be real YYYY-MM-DD dates.");
  const n = nightsBetween(req.arrival, req.departure);
  if (n < 1) return fail("invalid_dates", "Departure must be after arrival.");
  if (n > 60) return fail("invalid_dates", "Stays over 60 nights are quoted by the house.");
  if (req.arrival < req.bookingDate) return fail("past_arrival", "Arrival is in the past for this property.");

  // Occupancy
  const adults = Math.floor(req.adults), kids = req.childAges;
  if (adults < 1 || kids.some((a) => !Number.isInteger(a) || a < 0 || a > 17)) return fail("invalid_dates", "Occupancy needs at least one adult and child ages 0–17.");
  if (adults > room.maxAdults || kids.length > room.maxChildren || adults + kids.length > room.maxOccupancy)
    return fail("occupancy_exceeded", `${room.name} sleeps up to ${room.maxOccupancy} (${room.maxAdults} adults).`);

  const nightsList = Array.from({ length: n }, (_, i) => addDays(req.arrival, i));

  // Restrictions (property-wide or for this room/plan)
  const applies = (r: Restriction) => (!r.roomTypeId || r.roomTypeId === req.roomTypeId) && (!r.ratePlanId || r.ratePlanId === req.ratePlanId);
  for (const r of card.restrictions.filter(applies)) {
    if (r.type === "closed") {
      const hit = nightsList.find((d) => within(d, r.start, r.end));
      if (hit) return fail("closed", "Not available on these dates.", hit);
    }
    if (r.type === "close_to_arrival" && within(req.arrival, r.start, r.end)) return fail("closed_to_arrival", "Arrivals aren't accepted on this date.", req.arrival);
    if (r.type === "close_to_departure" && within(req.departure, r.start, r.end)) return fail("closed_to_departure", "Departures aren't accepted on this date.", req.departure);
    if (r.type === "min_stay" && !r.minimumStay) return fail("invalid_card", "A minimum-stay restriction has no minimum.");
    if (r.type === "min_stay" && r.minimumStay && within(req.arrival, r.start, r.end) && n < r.minimumStay)
      return fail("min_stay", `Arrivals on these dates need at least ${r.minimumStay} nights.`, req.arrival);
  }

  // Night by night
  const nights: NightLine[] = [];
  const used: SeasonalRule[] = [];
  for (const d of nightsList) {
    const rule = pickRule(card, req, d);
    if (!rule) return fail("no_rate_for_night", "No contracted rate covers this night.", d);
    if (!within(req.bookingDate, rule.bookingStart, rule.bookingEnd)) return fail("booking_window", `The ${rule.season} rate can't be booked today.`, d);
    const extra = Math.max(0, adults - rule.baseOccupancy);
    if (extra > 0 && rule.extraAdultMinor == null) return fail("occupancy_exceeded", `The ${rule.season} rate covers ${rule.baseOccupancy} adults.`, d);
    let childrenMinor = 0;
    for (const age of kids) {
      const c = childCharge(rule, age);
      if (c == null) return fail("child_age_unpriced", `No child rate for age ${age} on the ${rule.season} rate.`, d);
      childrenMinor += c;
    }
    const extraAdultsMinor = extra * (rule.extraAdultMinor ?? 0);
    nights.push({ date: d, ruleId: rule.id, season: rule.season, baseMinor: rule.amountMinor, extraAdultsMinor, childrenMinor, totalMinor: rule.amountMinor + extraAdultsMinor + childrenMinor });
    used.push(rule);
  }

  // Length-of-stay rules: the strictest rule touched by the stay applies.
  const minN = Math.max(0, ...used.map((r) => r.minNights ?? 0));
  if (n < minN) return fail("min_stay", `These dates need at least ${minN} nights.`);
  const maxes = used.map((r) => r.maxNights).filter((x): x is number => !!x);
  if (maxes.length && n > Math.min(...maxes)) return fail("max_stay", `These dates allow at most ${Math.min(...maxes)} nights.`);

  const roomSubtotalMinor = sum(nights.map((x) => x.totalMinor));

  // Promotions: approved, in window, eligible. Best single exclusive offer vs
  // all stackable offers together — the traveler gets whichever saves more.
  const sane = (p: Promotion) =>
    (p.type === "percent" && Number.isInteger(p.value) && p.value > 0 && p.value <= 9000) ||
    (p.type === "fixed_per_night" && Number.isInteger(p.value) && p.value > 0) ||
    (p.type === "nth_night_free" && Number.isInteger(p.value) && p.value >= 2 && p.value <= 30);
  const eligible = card.promotions.filter((p) =>
    p.approved && sane(p) && within(req.bookingDate, p.bookingStart, p.bookingEnd) &&
    nightsList.every((d) => within(d, p.stayStart, p.stayEnd)) &&
    (!p.minNights || n >= p.minNights) && (!p.ratePlanIds?.length || p.ratePlanIds.includes(req.ratePlanId)));
  if (req.promoCode && !eligible.some((p) => p.code === req.promoCode)) return fail("promo_invalid", "That offer doesn't apply to these dates.");
  // Entering a code only checks it's valid: the traveler always gets the best
  // eligible combination, so typing a code can never raise the price.
  const pool = eligible;
  const exclusive = pool.filter((p) => p.stacking === "exclusive").map((p) => [{ code: p.code, label: p.label, amountMinor: promoDiscount(p, nights, roomSubtotalMinor) }]);
  const stackable = pool.filter((p) => p.stacking === "stackable").map((p) => ({ code: p.code, label: p.label, amountMinor: promoDiscount(p, nights, roomSubtotalMinor) }));
  const options: DiscountLine[][] = [...exclusive, stackable].filter((o) => o.length);
  let discounts: DiscountLine[] = options.sort((a, b) => sum(b.map((x) => x.amountMinor)) - sum(a.map((x) => x.amountMinor)))[0] ?? [];
  // Never discount below zero.
  let left = roomSubtotalMinor;
  discounts = discounts.map((d) => { const a = Math.min(d.amountMinor, left); left -= a; return { ...d, amountMinor: a }; }).filter((d) => d.amountMinor > 0);
  const discountsMinor = sum(discounts.map((d) => d.amountMinor));
  const netRoomMinor = roomSubtotalMinor - discountsMinor;

  // Local taxes and fees
  const guestsPaying = (t: TaxRule) => adults + kids.filter((a) => t.minAge == null || a >= t.minAge).length;
  const charges: ChargeLine[] = card.taxes.map((t) => {
    let amountMinor = 0;
    if (t.basis === "percent_of_room") {
      // Included percent taxes are backed out of the price for display only.
      amountMinor = t.included ? netRoomMinor - Math.floor((netRoomMinor * 10_000 + Math.floor((10_000 + (t.percentBp ?? 0)) / 2)) / (10_000 + (t.percentBp ?? 0))) : pct(netRoomMinor, t.percentBp ?? 0);
    } else if (t.basis === "per_person_per_night") amountMinor = (t.amountMinor ?? 0) * guestsPaying(t) * n;
    else if (t.basis === "per_room_per_night") amountMinor = (t.amountMinor ?? 0) * n;
    else amountMinor = t.amountMinor ?? 0;
    return { id: t.id, name: t.name, kind: t.kind, included: t.included, amountMinor };
  });
  const taxesMinor = sum(charges.filter((c) => !c.included).map((c) => c.amountMinor));
  const floridaTaxMinor = pct(netRoomMinor + taxesMinor, FL_TAX_BP);
  charges.push({ id: "fl-sales-tax", name: "Florida sales tax (7%)", kind: "house_tax", included: false, amountMinor: floridaTaxMinor });
  const grandTotalMinor = netRoomMinor + taxesMinor + floridaTaxMinor;

  // Payment schedule: if arrival is inside the balance window, everything is due now.
  const t = card.paymentTerms;
  const balanceDue = addDays(req.arrival, -Math.max(0, t.balanceDueDaysBeforeArrival));
  const allNow = balanceDue <= req.bookingDate;
  const deposit = allNow ? grandTotalMinor
    : Math.min(grandTotalMinor, t.depositFixedMinor ?? pct(grandTotalMinor, t.depositPercentBp ?? 10_000));
  const balanceMinor = grandTotalMinor - deposit;

  // Cancellation: penalties from each tier's date onward (latest tier first in time).
  const deadlines = [...card.cancellation.tiers]
    .sort((a, b) => b.daysBeforeArrival - a.daysBeforeArrival)
    .map((tier) => ({ from: addDays(req.arrival, -tier.daysBeforeArrival), penaltyBp: tier.penaltyBp, penaltyMinor: pct(grandTotalMinor, tier.penaltyBp) }));

  const revision = fnv1a(canonical({ card, room, req: { ...req, promoCode: req.promoCode ?? null } }));
  return {
    ok: true, currency: card.currency, nights, roomSubtotalMinor, discounts, discountsMinor, charges, taxesMinor, floridaTaxMinor,
    grandTotalMinor, depositDueMinor: deposit, balanceMinor, balanceDueDate: balanceMinor > 0 ? balanceDue : null,
    cancellation: { summary: card.cancellation.summary, deadlines }, availability: "on_request", source: "contracted_card",
    rateCardVersion: card.versionId, revision: `${card.versionId}#${revision}`,
  };
}

/** Display helper: 123456 minor, "USD" → "US$1,234.56" (zero-decimal currencies handled). */
export function money(minor: Minor, currency: string): string {
  const digits = new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "narrowSymbol" }).format(minor / 10 ** digits).replace(/^\$/, currency === "USD" ? "US$" : "$");
}
