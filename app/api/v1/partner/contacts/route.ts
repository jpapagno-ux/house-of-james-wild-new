import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseContact } from "@/lib/platform/validate";

// POST /api/v1/partner/contacts — partner admins, contributors and the house add a contact directly.
// Administrative data: no approval step, every change audited in the database.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const p = parseContact(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { entities, ...fields } = p.value;
  const { data, error: e } = await desk.sb.from("contacts").insert({ ...fields, organization_id: desk.org.id, status: "active" }).select("id").single();
  if (e) return dbError(e, requestId);
  if (entities.length) {
    const { error: e2 } = await desk.sb.from("contact_entities").insert(entities.map((property_id) => ({ contact_id: data.id, property_id })));
    if (e2) return dbError(e2, requestId);
  }
  return ok({ id: data.id }, requestId, 201);
});
