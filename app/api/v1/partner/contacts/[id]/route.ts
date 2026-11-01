import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid, parseContact } from "@/lib/platform/validate";

// PATCH /api/v1/partner/contacts/:id — edit (whole record, as the form sends it).
// DELETE /api/v1/partner/contacts/:id — archive (kept for the audit trail).
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const p = parseContact(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { entities, ...fields } = p.value;
  const { data, error: e } = await desk.sb.from("contacts").update({ ...fields, status: "active" }).eq("id", params.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't edit this contact", requestId);
  const { data: cur } = await desk.sb.from("contact_entities").select("property_id").eq("contact_id", params.id);
  const have = new Set((cur ?? []).map((c) => c.property_id as string)), want = new Set(entities);
  const add = entities.filter((x) => !have.has(x)), drop = [...have].filter((x) => !want.has(x));
  if (add.length) { const { error: e2 } = await desk.sb.from("contact_entities").insert(add.map((property_id) => ({ contact_id: params.id, property_id }))); if (e2) return dbError(e2, requestId); }
  if (drop.length) { const { error: e3 } = await desk.sb.from("contact_entities").delete().eq("contact_id", params.id).in("property_id", drop); if (e3) return dbError(e3, requestId); }
  return ok({ id: params.id }, requestId);
});

export const DELETE = withMember(async ({ desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data, error: e } = await desk.sb.from("contacts").update({ status: "archived" }).eq("id", params.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't remove this contact", requestId);
  return ok({ id: params.id, archived: true }, requestId);
});
