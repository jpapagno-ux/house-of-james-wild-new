import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseOffer, parseSeasonal } from "@/lib/platform/rate-proposals";
import { CURRENCIES } from "@/lib/platform/commercial";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/partner/rates { propertyId, kind: rate_sheet | seasonal | offer, documentId?, currency?, rows? | offer?, note? }
// A partner sends rates or an offer (D-08). It is a proposal: the house loads it into the Airtable
// rates base and the certified sync prices the website. The database checks the property and the
// document belong to this partner and that the sender may act for the property.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house loads rates in Airtable directly", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const propertyId = typeof b.propertyId === "string" && isUuid(b.propertyId) ? b.propertyId : null;
  if (!propertyId) return invalid({ ok: false, message: "Choose a property", field: "propertyId" }, requestId);
  const kind = b.kind;
  const currency = typeof b.currency === "string" && CURRENCIES.some((c) => c.code === b.currency) ? b.currency : null;
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 2000) || null : null;
  const { data: rooms } = await desk.sb.from("room_types").select("id").eq("property_id", propertyId).eq("active", true);
  const roomIds = (rooms ?? []).map((r) => r.id as string);
  let row: Record<string, unknown>;
  if (kind === "rate_sheet") {
    if (typeof b.documentId !== "string" || !isUuid(b.documentId)) return invalid({ ok: false, message: "Choose the rate sheet from your documents", field: "documentId" }, requestId);
    const vf = typeof b.validFrom === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.validFrom) ? b.validFrom : null;
    const vt = typeof b.validTo === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.validTo) ? b.validTo : null;
    row = { kind, document_id: b.documentId, currency, valid_from: vf, valid_to: vt, payload: {} };
  } else if (kind === "seasonal") {
    if (!currency) return invalid({ ok: false, message: "Choose the currency of these rates", field: "currency" }, requestId);
    const p = parseSeasonal(b, roomIds);
    if (!p.ok) return invalid(p, requestId);
    row = { kind, currency, valid_from: p.validFrom, valid_to: p.validTo, payload: p.value };
  } else if (kind === "offer") {
    const p = parseOffer(b.offer, roomIds);
    if (!p.ok) return invalid(p, requestId);
    row = { kind, currency, valid_from: p.value.stayStart, valid_to: p.value.stayEnd, payload: p.value };
  } else return invalid({ ok: false, message: "Rate sheet, seasonal rates or an offer", field: "kind" }, requestId);
  const { data, error: e } = await desk.sb.from("rate_proposals")
    .insert({ ...row, organization_id: desk.org.id, property_id: propertyId, note, submitted_by: desk.user.id }).select("id").single();
  if (e) return dbError(e, requestId);
  return ok({ id: data.id }, requestId, 201);
});
