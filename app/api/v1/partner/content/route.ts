import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { CONTENT_FIELD, parseContentChanges } from "@/lib/platform/content";

// POST /api/v1/partner/content { propertyId, changes: { field: value }, note } — a partner proposes
// content for one of their properties (Stage 2 §3.1). One submission, one revision per field; the
// database records the true "before", refuses anything outside the whitelist and anyone without edit
// rights on the property. Nothing changes on the site until the house approves and publishes.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house reviews content; it doesn't propose it", requestId);
  const p = parseContentChanges(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { propertyId, changes, note } = p.value;
  const title = changes.length === 1 ? `${CONTENT_FIELD[changes[0].field].label} update` : `Content update (${changes.length} fields)`;
  const { data: sub, error: e } = await desk.sb.from("submissions")
    .insert({ organization_id: desk.org.id, property_id: propertyId, kind: "content", title, partner_note: note, status: "draft" })
    .select("id, reference").single();
  if (e) return dbError(e, requestId);
  const { error: e2 } = await desk.sb.from("revisions").insert(changes.map((c) => ({
    submission_id: sub.id, target_table: "entity_content", target_id: propertyId, field: c.field, proposed_value: c.value, partner_note: note,
  })));
  if (e2) {
    await desk.sb.from("submissions").update({ status: "withdrawn" }).eq("id", sub.id);
    return rpcError(e2, requestId);
  }
  const { error: e3 } = await desk.sb.from("submissions").update({ status: "submitted" }).eq("id", sub.id);
  if (e3) return dbError(e3, requestId);
  return ok(sub, requestId, 201);
});
