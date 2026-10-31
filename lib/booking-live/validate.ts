// Input validation for the Booking Live API. Pure functions, no imports, so
// plain Node can test them. Every API body passes through one of these before
// it reaches the database; anything unexpected is rejected, never coerced.

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; code: ErrorCode; message: string };
export type Result<T> = Ok<T> | Err;

// Stable error codes (spec §8). Clients switch on `code`, never on wording.
export const ERROR_CODES = {
  invalid_input: 400,
  sign_in_required: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  invite_invalid: 410,
  rate_limited: 429,
  feature_off: 404,
  server_error: 500,
} as const;
export type ErrorCode = keyof typeof ERROR_CODES;

const fail = (code: ErrorCode, message: string): Err => ({ ok: false, code, message });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9-]{2,120}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL = /^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,24}$/;

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export function isValidDate(v: unknown): v is string {
  if (typeof v !== "string" || !DATE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

function only(body: Record<string, unknown>, keys: string[]): Err | null {
  const extra = Object.keys(body).filter((k) => !keys.includes(k));
  return extra.length ? fail("invalid_input", `Unexpected field: ${extra[0]}`) : null;
}

/** POST /api/v1/me/favorites — { property: "<slug>" } */
export function parseFavorite(body: unknown): Result<{ slug: string }> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["property"]); if (bad) return bad;
  const slug = typeof body.property === "string" ? body.property.toLowerCase() : "";
  return SLUG.test(slug) ? { ok: true, value: { slug } } : fail("invalid_input", "property must be a stay slug");
}

export type FolioInput = { title: string; destination_summary: string | null; start_date: string | null; end_date: string | null; ledger_id: string | null; advisor_adv: string | null; advisor_slug: string | null; source: string | null };

/** POST /api/v1/me/folios — { title, destinationSummary?, startDate?, endDate? } */
export function parseFolio(body: unknown): Result<FolioInput> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["title", "destinationSummary", "startDate", "endDate", "ledgerId", "advisorAdv", "advisorSlug", "source"]); if (bad) return bad;
  const title = text(body.title, 120);
  if (!title) return fail("invalid_input", "A Folio needs a title");
  const start = body.startDate ?? null, end = body.endDate ?? null;
  if (start !== null && !isValidDate(start)) return fail("invalid_input", "startDate must be YYYY-MM-DD");
  if (end !== null && !isValidDate(end)) return fail("invalid_input", "endDate must be YYYY-MM-DD");
  if (start && end && (end as string) < (start as string)) return fail("invalid_input", "endDate is before startDate");
  // Stage 4: the FOL number and the advisor, when Iggi (or an advisor) opened it.
  const ledgerId = typeof body.ledgerId === "string" ? body.ledgerId.toUpperCase() : null;
  if (ledgerId !== null && !/^FOL-\d{4}-\d{6}$/.test(ledgerId)) return fail("invalid_input", "ledgerId must be a FOL number");
  const advisorAdv = typeof body.advisorAdv === "string" ? body.advisorAdv.toUpperCase() : null;
  if (advisorAdv !== null && !/^ADV-\d{4}-\d{6}$/.test(advisorAdv)) return fail("invalid_input", "advisorAdv must be an ADV number");
  const advisorSlug = typeof body.advisorSlug === "string" ? body.advisorSlug.toLowerCase() : null;
  if (advisorSlug !== null && !SLUG.test(advisorSlug)) return fail("invalid_input", "advisorSlug must be a slug");
  const source = typeof body.source === "string" ? body.source : null;
  if (source !== null && !["traveler", "iggi", "advisor"].includes(source)) return fail("invalid_input", "source must be traveler, iggi or advisor");
  return { ok: true, value: { title, destination_summary: text(body.destinationSummary, 400) || null, start_date: start as string | null, end_date: end as string | null, ledger_id: ledgerId, advisor_adv: advisorAdv, advisor_slug: advisorSlug, source } };
}

export type ItemInput = { slug: string | null; external_item_type: string | null; notes: string | null; arrival_date: string | null; departure_date: string | null };
const ITEM_TYPES = ["voyage", "safari", "experience", "route", "note"];

/** POST /api/v1/me/folios/:id/items — { property?: slug, type?: note|voyage…, notes?, arrival?, departure? } */
export function parseItem(body: unknown): Result<ItemInput> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["property", "type", "notes", "arrival", "departure"]); if (bad) return bad;
  const slug = typeof body.property === "string" ? body.property.toLowerCase() : null;
  if (slug !== null && !SLUG.test(slug)) return fail("invalid_input", "property must be a stay slug");
  const type = typeof body.type === "string" ? body.type : null;
  if (type !== null && !ITEM_TYPES.includes(type)) return fail("invalid_input", `type must be one of ${ITEM_TYPES.join(", ")}`);
  if (!slug && !type) return fail("invalid_input", "Add a stay or an item type");
  const arrival = body.arrival ?? null, departure = body.departure ?? null;
  if (arrival !== null && !isValidDate(arrival)) return fail("invalid_input", "arrival must be YYYY-MM-DD");
  if (departure !== null && !isValidDate(departure)) return fail("invalid_input", "departure must be YYYY-MM-DD");
  if (arrival && departure && (departure as string) <= (arrival as string)) return fail("invalid_input", "departure must be after arrival");
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 2000) || null : null;
  return { ok: true, value: { slug, external_item_type: type, notes, arrival_date: arrival as string | null, departure_date: departure as string | null } };
}

/** POST /api/v1/me/folios/:id/invitations — { email, role: "editor"|"viewer" } */
export function parseInvite(body: unknown): Result<{ email: string; role: "editor" | "viewer" }> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["email", "role"]); if (bad) return bad;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) return fail("invalid_input", "A valid email is needed");
  const role = body.role === "editor" || body.role === "viewer" ? body.role : null;
  return role ? { ok: true, value: { email, role } } : fail("invalid_input", "role must be editor or viewer");
}

const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "CAD", "AUD", "BWP", "KES", "CRC"];

/** PATCH /api/v1/me/profile — names, phone, currency, timezone only. */
export function parseProfile(body: unknown): Result<Record<string, string | null>> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["firstName", "lastName", "phone", "preferredCurrency", "timezone"]); if (bad) return bad;
  const out: Record<string, string | null> = {};
  if ("firstName" in body) out.first_name = text(body.firstName, 80) || null;
  if ("lastName" in body) out.last_name = text(body.lastName, 80) || null;
  if ("phone" in body) {
    const p = text(body.phone, 40);
    if (p && !/^[+()\d\s.-]{6,40}$/.test(p)) return fail("invalid_input", "phone has unexpected characters");
    out.phone = p || null;
  }
  if ("preferredCurrency" in body) {
    if (typeof body.preferredCurrency !== "string" || !CURRENCIES.includes(body.preferredCurrency)) return fail("invalid_input", `preferredCurrency must be one of ${CURRENCIES.join(", ")}`);
    out.preferred_currency = body.preferredCurrency;
  }
  if ("timezone" in body) {
    if (typeof body.timezone !== "string" || !/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(body.timezone)) return fail("invalid_input", "timezone must be an IANA zone");
    out.timezone = body.timezone;
  }
  return Object.keys(out).length ? { ok: true, value: out } : fail("invalid_input", "Nothing to update");
}

/** Only same-site return paths after sign-in; anything else goes to /account. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/account";
  return /^\/(account|stays)(\/[a-z0-9\-/]*)?(\?[\w=&%-]*)?$/i.test(next) ? next : "/account";
}

export type SearchInput = { slug: string; arrival: string; departure: string; adults: number; childAges: number[]; promoCode: string | null; room: string | null; plan: string | null };

/** POST /api/v1/availability/search and /api/v1/quotes — dates and occupancy are required before any price. */
export function parseSearch(body: unknown, needRoom = false): Result<SearchInput> {
  if (!isObj(body)) return fail("invalid_input", "Body must be a JSON object");
  const bad = only(body, ["property", "arrival", "departure", "adults", "childAges", "promoCode", "room", "plan"]); if (bad) return bad;
  const slug = typeof body.property === "string" ? body.property.toLowerCase() : "";
  if (!SLUG.test(slug)) return fail("invalid_input", "property must be a stay slug");
  if (!isValidDate(body.arrival) || !isValidDate(body.departure)) return fail("invalid_input", "Choose arrival and departure dates");
  if ((body.departure as string) <= (body.arrival as string)) return fail("invalid_input", "Departure must be after arrival");
  const adults = typeof body.adults === "number" && Number.isInteger(body.adults) ? body.adults : NaN;
  if (!(adults >= 1 && adults <= 12)) return fail("invalid_input", "Adults must be 1 to 12");
  const kids = body.childAges ?? [];
  if (!Array.isArray(kids) || kids.length > 8 || kids.some((a) => !Number.isInteger(a) || (a as number) < 0 || (a as number) > 17)) return fail("invalid_input", "Child ages must be 0 to 17");
  const promo = body.promoCode == null || body.promoCode === "" ? null : typeof body.promoCode === "string" && /^[A-Z0-9-]{2,30}$/i.test(body.promoCode) ? body.promoCode.toUpperCase() : undefined;
  if (promo === undefined) return fail("invalid_input", "That offer code isn't valid");
  const code = (v: unknown) => (typeof v === "string" && /^[a-z0-9-]{1,60}$/.test(v) ? v : null);
  const room = code(body.room), plan = code(body.plan);
  if (needRoom && (!room || !plan)) return fail("invalid_input", "Choose a room and rate");
  return { ok: true, value: { slug, arrival: body.arrival as string, departure: body.departure as string, adults, childAges: kids as number[], promoCode: promo, room, plan } };
}
