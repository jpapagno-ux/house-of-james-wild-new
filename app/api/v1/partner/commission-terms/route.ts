import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { COMMISSION_KEEPER_ROLES, parseTermFields } from "@/lib/platform/commission";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/partner/commission-terms — the house records what a partner pays (D-25). Off since D-31.
// Only house admins, portfolio managers and finance; the database enforces the same rule and
// refuses a brand or property that belongs to another partner. Every change is audited.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "Choose a partner first", requestId);
  const keeper = desk.memberships.some((m) => m.status === "active" && m.organization.type === "internal" && COMMISSION_KEEPER_ROLES.includes(m.role));
  if (!keeper) return error("forbidden", "Only the house keeps commercial terms", requestId);
  // D-31: commission is typed once, in Airtable Partner Brands, and synced here. A new term on the
  // desk would be a second source; it waits behind COMMISSION_DESK_ENTRY=on for an emergency only.
  if (process.env.COMMISSION_DESK_ENTRY !== "on") return error("conflict", "Commission is kept in Airtable (Partner Brands); it reaches the desk on the next rates sync", requestId);
  const body = (await jsonBody(req)) as Record<string, unknown> | null;
  const parsed = parseTermFields(body ?? {});
  if (!parsed.ok) return invalid({ ok: false, message: parsed.message, field: parsed.field }, requestId);
  const v = parsed.value;
  const doc = body?.contractDocumentId;
  const contract_document_id = typeof doc === "string" && isUuid(doc) ? doc : null;
  const { data, error: e } = await desk.sb.from("commission_terms").insert({
    organization_id: desk.org.id,
    brand_id: v.scope === "brand" ? v.scopeId : null,
    property_id: v.scope === "property" ? v.scopeId : null,
    basis: v.basis, rate_bp: v.rateBp, effective_from: v.effectiveFrom, effective_to: v.effectiveTo, status: v.status, note: v.note, contract_document_id,
  }).select("id").single();
  if (e) return dbError(e, requestId);
  return ok({ id: data.id }, requestId);
});
