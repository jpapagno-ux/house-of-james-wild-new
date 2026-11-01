// Input validation for the Partner Desk API. Pure functions, no imports, so plain
// Node can test them. Unknown fields are rejected, never ignored; nothing is coerced.

export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; message: string; field?: string };
export type Result<T> = Ok<T> | Err;

const fail = (message: string, field?: string): Err => ({ ok: false, message, field });
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^@\s]{1,64}@[^@\s]{1,190}\.[^@\s]{2,24}$/;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
export const isEmail = (v: unknown): v is string => typeof v === "string" && EMAIL.test(v.trim());
/** Canonical entity identity (D-01), e.g. STY-2026-000128. */
export const isLedgerId = (v: unknown): v is string => typeof v === "string" && /^[A-Z]{3}-[0-9]{4}-[0-9]{6}$/.test(v);

function only(body: Record<string, unknown>, keys: string[]): Err | null {
  const extra = Object.keys(body).filter((k) => !keys.includes(k));
  return extra.length ? fail(`Unexpected field: ${extra[0]}`, extra[0]) : null;
}
/** Trimmed, single-spaced text; "" when absent. Multi-line text keeps its line breaks. */
function text(v: unknown, max: number, multiline = false): string {
  if (typeof v !== "string") return "";
  const t = multiline ? v.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : v.trim().replace(/\s+/g, " ");
  return t.slice(0, max);
}
const opt = (v: unknown, max: number, multiline = false) => text(v, max, multiline) || null;

/** Same-site Partner Desk / house desk paths only (no open redirects). */
export function safePartnerNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/partner";
  return /^\/(partner|desk)(\/[A-Za-z0-9_\-/]*)?(\?[\w=&%-]*)?$/.test(next) ? next : "/partner";
}

// ===== Contacts
export const CONTACT_ROLES = ["owner", "general_manager", "sales_director", "reservations", "marketing", "pr", "trade_sales", "groups", "media", "sustainability", "conservation", "finance", "commission", "emergency"] as const;
export const CONTACT_ROLE_LABEL: Record<string, string> = {
  owner: "Owner", general_manager: "General Manager", sales_director: "Sales Director", reservations: "Reservations", marketing: "Marketing", pr: "PR",
  trade_sales: "Trade Sales", groups: "Groups", media: "Media", sustainability: "Sustainability", conservation: "Conservation", finance: "Finance",
  commission: "Commission", emergency: "Emergency / On-ground",
};
export const COMMS = ["email", "phone", "whatsapp", "video"] as const;
export type ContactInput = {
  first_name: string | null; last_name: string | null; title: string | null; email: string | null; mobile: string | null; whatsapp: string | null;
  country: string | null; timezone: string | null; territory: string | null; languages: string[]; roles: string[];
  preferred_communication: string | null; newsletter_opt_in: boolean; trade_opt_in: boolean; notes: string | null; entities: string[];
};
const CONTACT_KEYS = ["firstName", "lastName", "title", "email", "mobile", "whatsapp", "country", "timezone", "territory", "languages", "roles", "preferredCommunication", "newsletterOptIn", "tradeOptIn", "notes", "entities"];

export function parseContact(body: unknown): Result<ContactInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, CONTACT_KEYS); if (bad) return bad;
  const first_name = opt(body.firstName, 80), last_name = opt(body.lastName, 80), title = opt(body.title, 120);
  if (!first_name && !last_name && !title) return fail("Add a name or a title", "firstName");
  const email = opt(body.email, 254);
  if (email && !EMAIL.test(email)) return fail("That email doesn't look right", "email");
  const country = opt(body.country, 10)?.toUpperCase() ?? null;
  if (country && !/^[A-Z]{2}$/.test(country)) return fail("Use the two-letter country code, e.g. ZA", "country");
  const phone = (k: string) => { const v = opt(body[k], 40); return v && !/^[+0-9 ()\-.]{4,40}$/.test(v) ? undefined : v; };
  const mobile = phone("mobile"), whatsapp = phone("whatsapp");
  if (mobile === undefined) return fail("Use digits, spaces and + only", "mobile");
  if (whatsapp === undefined) return fail("Use digits, spaces and + only", "whatsapp");
  const list = (v: unknown, max: number) => (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean).slice(0, max);
  const roles = list(body.roles, 14);
  if (roles.some((r) => !(CONTACT_ROLES as readonly string[]).includes(r))) return fail("Unknown contact role", "roles");
  const languages = list(body.languages, 10).map((l) => l.slice(0, 40));
  const pc = opt(body.preferredCommunication, 10);
  if (pc && !(COMMS as readonly string[]).includes(pc)) return fail("Choose email, phone, WhatsApp or video", "preferredCommunication");
  const entities = list(body.entities, 50);
  if (entities.some((e) => !UUID.test(e))) return fail("Unknown property", "entities");
  for (const k of ["newsletterOptIn", "tradeOptIn"]) if (body[k] !== undefined && typeof body[k] !== "boolean") return fail("Must be true or false", k);
  return { ok: true, value: {
    first_name, last_name, title, email, mobile, whatsapp, country, timezone: opt(body.timezone, 64), territory: opt(body.territory, 120),
    languages, roles: [...new Set(roles)], preferred_communication: pc, newsletter_opt_in: body.newsletterOptIn === true, trade_opt_in: body.tradeOptIn === true,
    notes: opt(body.notes, 2000, true), entities: [...new Set(entities)],
  } };
}

// ===== Company details (direct edit, partner admin)
export type CompanyInput = { website: string | null; phone: string | null; general_email: string | null; address: string | null; preferred_communication: string | null; media_kit_url: string | null };
export function parseCompany(body: unknown): Result<CompanyInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["website", "phone", "generalEmail", "address", "preferredCommunication", "mediaKitUrl"]); if (bad) return bad;
  const url = (k: string, max: number) => { const v = opt(body[k], max); return v && !/^https:\/\/[^\s]+\.[^\s]+$/.test(v) ? undefined : v; };
  const website = url("website", 200), media_kit_url = url("mediaKitUrl", 400);
  if (website === undefined) return fail("Use a full https:// address", "website");
  if (media_kit_url === undefined) return fail("Use a full https:// address", "mediaKitUrl");
  const general_email = opt(body.generalEmail, 254);
  if (general_email && !EMAIL.test(general_email)) return fail("That email doesn't look right", "generalEmail");
  const phone = opt(body.phone, 40);
  if (phone && !/^[+0-9 ()\-.]{4,40}$/.test(phone)) return fail("Use digits, spaces and + only", "phone");
  const pc = opt(body.preferredCommunication, 10);
  if (pc && !(COMMS as readonly string[]).includes(pc)) return fail("Choose email, phone, WhatsApp or video", "preferredCommunication");
  return { ok: true, value: { website, phone, general_email, address: opt(body.address, 400, true), preferred_communication: pc, media_kit_url } };
}

// ===== Submissions (a reply to a request, or a general note with documents)
export type DocumentRef = { name: string; url: string };
export type SubmissionInput = { requestId: string | null; propertyId: string | null; title: string; note: string | null; documents: DocumentRef[] };
export function parseSubmission(body: unknown): Result<SubmissionInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["requestId", "propertyId", "title", "note", "documents"]); if (bad) return bad;
  const requestId = body.requestId == null ? null : body.requestId, propertyId = body.propertyId == null ? null : body.propertyId;
  if (requestId !== null && !isUuid(requestId)) return fail("Unknown request", "requestId");
  if (propertyId !== null && !isUuid(propertyId)) return fail("Unknown property", "propertyId");
  const title = text(body.title, 160);
  if (!title) return fail("Give your update a short title", "title");
  const note = opt(body.note, 4000, true);
  const docs = Array.isArray(body.documents) ? body.documents : [];
  if (docs.length > 20) return fail("Up to 20 links per update", "documents");
  const documents: DocumentRef[] = [];
  for (const d of docs) {
    if (!isObj(d)) return fail("Each document needs a name and a link", "documents");
    const name = text(d.name, 120), url = text(d.url, 600);
    if (!name || !/^https:\/\/[^\s]+\.[^\s]+$/.test(url)) return fail("Each document needs a name and a full https:// link", "documents");
    documents.push({ name, url });
  }
  if (!note && documents.length === 0) return fail("Add a note or at least one document link", "note");
  return { ok: true, value: { requestId: requestId as string | null, propertyId: propertyId as string | null, title, note, documents } };
}

// ===== Proposed field changes (a revision) — the desk sends the entity's own fields only
export const PROPERTY_FIELDS = ["name", "category", "country", "region", "timezone"] as const;
export type RevisionInput = { propertyId: string; field: string; value: string; note: string | null };
export function parseRevision(body: unknown): Result<RevisionInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["propertyId", "field", "value", "note"]); if (bad) return bad;
  if (!isUuid(body.propertyId)) return fail("Unknown property", "propertyId");
  if (typeof body.field !== "string" || !(PROPERTY_FIELDS as readonly string[]).includes(body.field)) return fail("That field can't be changed here", "field");
  const value = text(body.value, 160);
  if (!value) return fail("Enter the new value", "value");
  return { ok: true, value: { propertyId: body.propertyId, field: body.field, value, note: opt(body.note, 2000, true) } };
}

// ===== Invitations
export type InviteInput = { email: string; role: "partner_admin" | "partner_contributor"; entities: string[] };
export function parseInvite(body: unknown): Result<InviteInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["email", "role", "entities"]); if (bad) return bad;
  const email = text(body.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return fail("That email doesn't look right", "email");
  if (body.role !== "partner_admin" && body.role !== "partner_contributor") return fail("Choose admin or contributor", "role");
  const entities = (Array.isArray(body.entities) ? body.entities : []).filter(isUuid).slice(0, 50);
  return { ok: true, value: { email, role: body.role, entities: [...new Set(entities)] } };
}
export type TeamChange = { role: "partner_admin" | "partner_contributor"; status: "active" | "revoked" };
export function parseTeamChange(body: unknown): Result<TeamChange> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["role", "status"]); if (bad) return bad;
  if (body.role !== "partner_admin" && body.role !== "partner_contributor") return fail("Choose admin or contributor", "role");
  if (body.status !== "active" && body.status !== "revoked") return fail("Bad status", "status");
  return { ok: true, value: { role: body.role, status: body.status } };
}

// ===== Applications (/partner/apply)
export type ApplicationInput = { organization_name: string; website: string | null; contact_name: string; email: string; country: string | null; properties: string | null; message: string | null };
export function parseApplication(body: unknown): Result<ApplicationInput> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["organizationName", "website", "contactName", "email", "country", "properties", "message", "company"]); if (bad) return bad;
  const organization_name = text(body.organizationName, 160), contact_name = text(body.contactName, 120), email = text(body.email, 254).toLowerCase();
  if (!organization_name) return fail("Tell us the company name", "organizationName");
  if (!contact_name) return fail("Tell us your name", "contactName");
  if (!EMAIL.test(email)) return fail("That email doesn't look right", "email");
  const website = opt(body.website, 200);
  if (website && !/^https?:\/\/[^\s]+\.[^\s]+$/.test(website)) return fail("Use a full web address", "website");
  return { ok: true, value: { organization_name, website, contact_name, email, country: opt(body.country, 80), properties: opt(body.properties, 1000, true), message: opt(body.message, 4000, true) } };
}

// ===== House decisions
export type Decision = { action: "approve" | "edit_approve" | "reject" | "ask"; finalValue: string | null; note: string | null };
export function parseDecision(body: unknown): Result<Decision> {
  if (!isObj(body)) return fail("Body must be a JSON object");
  const bad = only(body, ["action", "finalValue", "note"]); if (bad) return bad;
  const a = body.action;
  if (a !== "approve" && a !== "edit_approve" && a !== "reject" && a !== "ask") return fail("Choose approve, edit + approve, reject or ask partner", "action");
  const finalValue = a === "edit_approve" ? text(body.finalValue, 4000, true) : null;
  if (a === "edit_approve" && !finalValue) return fail("Enter the value to publish", "finalValue");
  const note = opt(body.note, 2000, true);
  if ((a === "ask" || a === "reject") && !note) return fail("Tell the partner why", "note");
  return { ok: true, value: { action: a, finalValue, note } };
}
