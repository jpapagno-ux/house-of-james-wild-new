// Rates & offers from partners (Stage 2 §3.3, D-08). Pure: shared by the page, the API and tests.
// What partners send is a proposal; the house loads it into the Airtable rates base and the
// certified sync prices the website. Field names follow the Airtable tables (Seasonal Rates,
// Promotions) so loading is copying, not interpreting.

export type SeasonRow = { roomId: string; season: string; stayStart: string; stayEnd: string; nightly: number; minNights: number | null; basis: "per_room" | "per_person" };
export type SeasonalPayload = { rows: SeasonRow[] };
export const OFFER_TYPES = { percent: "Percent off", fixed_night: "Amount off per night", stay_pay: "Stay N, pay N-1", added_value: "Added value (no price change)" } as const;
export type OfferType = keyof typeof OFFER_TYPES;
export type OfferPayload = { label: string; type: OfferType; value: number | null; bookStart: string | null; bookEnd: string | null; stayStart: string; stayEnd: string; minNights: number | null; rooms: string[]; terms: string | null };

type Fail = { ok: false; message: string; field: string };
const fail = (message: string, field: string): Fail => ({ ok: false, message, field });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const s = (v: unknown) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
const num = (v: unknown) => { const t = s(v).replace(/[, ]/g, ""); if (!t) return null; const n = Number(t); return Number.isFinite(n) ? n : NaN; };

export function parseSeasonal(raw: unknown, roomIds: string[]): { ok: true; value: SeasonalPayload; validFrom: string; validTo: string } | Fail {
  const rows = Array.isArray((raw as { rows?: unknown })?.rows) ? ((raw as { rows: unknown[] }).rows) : [];
  const out: SeasonRow[] = [];
  for (const [i, r0] of rows.entries()) {
    const r = (r0 ?? {}) as Record<string, unknown>;
    const empty = !s(r.season) && !s(r.nightly) && !s(r.stayStart);
    if (empty) continue;
    const where = `Line ${i + 1}`;
    if (!UUID.test(s(r.roomId)) || !roomIds.includes(s(r.roomId))) return fail(`${where}: choose the room`, "rows");
    const season = s(r.season).slice(0, 60);
    if (!season) return fail(`${where}: name the season, e.g. High or Festive`, "rows");
    const a = s(r.stayStart), b = s(r.stayEnd);
    if (!DATE.test(a) || !DATE.test(b) || b < a) return fail(`${where}: stay dates, the last night after the first`, "rows");
    const nightly = num(r.nightly);
    if (nightly === null || Number.isNaN(nightly) || nightly <= 0 || nightly > 1_000_000) return fail(`${where}: the nightly rate as a number`, "rows");
    const mn = num(r.minNights);
    if (Number.isNaN(mn) || (mn !== null && (mn < 1 || mn > 60 || !Number.isInteger(mn)))) return fail(`${where}: minimum nights as a whole number`, "rows");
    out.push({ roomId: s(r.roomId), season, stayStart: a, stayEnd: b, nightly: Math.round(nightly * 100) / 100, minNights: mn, basis: s(r.basis) === "per_person" ? "per_person" : "per_room" });
  }
  if (!out.length) return fail("Add at least one rate", "rows");
  if (out.length > 200) return fail("Up to 200 lines at a time; send the rest as a rate sheet", "rows");
  const validFrom = out.map((r) => r.stayStart).sort()[0], validTo = out.map((r) => r.stayEnd).sort().at(-1)!;
  return { ok: true, value: { rows: out }, validFrom, validTo };
}

export function parseOffer(raw: unknown, roomIds: string[]): { ok: true; value: OfferPayload } | Fail {
  const r = (raw ?? {}) as Record<string, unknown>;
  const label = s(r.label).slice(0, 120);
  if (label.length < 3) return fail("Name the offer as guests will read it, e.g. Stay 4, pay 3", "label");
  if (/[–—]/.test(label)) return fail("Please use a comma instead of a long dash", "label");
  const type = s(r.type) as OfferType;
  if (!(type in OFFER_TYPES)) return fail("Choose the kind of offer", "type");
  const value = num(r.value);
  if (type !== "added_value") {
    if (value === null || Number.isNaN(value) || value <= 0) return fail("Enter the offer's value", "value");
    if (type === "percent" && value > 90) return fail("A percentage up to 90", "value");
    if (type === "stay_pay" && (!Number.isInteger(value) || value < 2 || value > 30)) return fail("Stay how many nights (pay one fewer)", "value");
  }
  const d = (k: string) => (s(r[k]) ? s(r[k]) : null);
  const bookStart = d("bookStart"), bookEnd = d("bookEnd"), stayStart = d("stayStart"), stayEnd = d("stayEnd");
  for (const [k, v] of [["bookStart", bookStart], ["bookEnd", bookEnd], ["stayStart", stayStart], ["stayEnd", stayEnd]] as const) if (v && !DATE.test(v)) return fail("Use a date", k);
  if (!stayStart || !stayEnd || stayEnd < stayStart) return fail("Stay dates, the end after the start", "stayStart");
  if (bookStart && bookEnd && bookEnd < bookStart) return fail("Booking dates, the end after the start", "bookStart");
  const mn = num(r.minNights);
  if (Number.isNaN(mn) || (mn !== null && (mn < 1 || mn > 60))) return fail("Minimum nights as a whole number", "minNights");
  const rooms = (Array.isArray(r.rooms) ? r.rooms.map(String) : []).filter((x) => roomIds.includes(x));
  return { ok: true, value: { label, type, value: type === "added_value" ? null : value, bookStart, bookEnd, stayStart, stayEnd, minNights: mn, rooms, terms: s(r.terms).slice(0, 1000) || null } };
}

/** Rate cards that run out soon, or a year with no card: what the desk warns about. */
export function cardAlerts(cards: { version_label: string; effective_from: string; effective_to: string }[], today: string): { level: "missing" | "expiring" | "ok"; text: string } {
  const year = Number(today.slice(0, 4));
  const live = cards.filter((c) => c.effective_to >= today).sort((a, b) => (a.effective_to < b.effective_to ? 1 : -1));
  if (!live.length) return { level: "missing", text: "No rates on file for the coming season" };
  const last = live[0].effective_to;
  const days = Math.round((Date.parse(last) - Date.parse(today)) / 86400000);
  if (days <= 120) return { level: "expiring", text: `Rates run out ${last}; send the ${Number(last.slice(0, 4)) + 1} rates` };
  if (!cards.some((c) => c.effective_to >= `${year + 1}-06-30`) && today >= `${year}-07-01`) return { level: "expiring", text: `${year + 1} rates missing` };
  return { level: "ok", text: `Rates on file until ${last}` };
}
