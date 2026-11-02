import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { FIELD_LABEL } from "@/lib/platform/labels";
import { parseRevision } from "@/lib/platform/validate";

// POST /api/v1/partner/revisions — propose a change to one of an entity's own fields
// (e.g. its name). Creates a submission holding one revision; the database records the
// true current value and refuses any field outside its whitelist. Nothing changes on
// the website until the house approves.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house reviews changes; it doesn't propose them", requestId);
  const p = parseRevision(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { propertyId, field, value, note } = p.value;
  const { data: sub, error: e } = await desk.sb.from("submissions").insert({
    organization_id: desk.org.id, property_id: propertyId, kind: "content", title: `${FIELD_LABEL[field] ?? field} change`, partner_note: note, status: "draft",
  }).select("id, reference").single();
  if (e) return dbError(e, requestId);
  const { error: e2 } = await desk.sb.from("revisions").insert({ submission_id: sub.id, target_table: "properties", target_id: propertyId, field, proposed_value: value, partner_note: note });
  if (e2) {
    await desk.sb.from("submissions").update({ status: "withdrawn" }).eq("id", sub.id);
    return rpcError(e2, requestId);
  }
  const { error: e3 } = await desk.sb.from("submissions").update({ status: "submitted" }).eq("id", sub.id);
  if (e3) return dbError(e3, requestId);
  return ok(sub, requestId, 201);
});
