import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseSubmission } from "@/lib/platform/validate";

// POST /api/v1/partner/submissions — answer a request, or send the house an update
// (a note plus links to documents). Nothing reaches the website from here: the house
// reviews every submission first.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house reviews submissions; it doesn't make them", requestId);
  const p = parseSubmission(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  let propertyId = p.value.propertyId;
  if (p.value.requestId) {
    const { data: rq } = await desk.sb.from("content_requests").select("id, property_id, status, organization_id").eq("id", p.value.requestId).maybeSingle();
    if (!rq || rq.organization_id !== desk.org.id) return error("not_found", "Request not found", requestId);
    if (!["open", "changes_requested"].includes(rq.status)) return error("conflict", "This request has already been answered", requestId);
    propertyId = rq.property_id;
  }
  const { data, error: e } = await desk.sb.from("submissions").insert({
    organization_id: desk.org.id, property_id: propertyId, request_id: p.value.requestId,
    kind: p.value.requestId ? "request_reply" : p.value.documents.length ? "document" : "other",
    title: p.value.title, partner_note: p.value.note, documents: p.value.documents, status: "submitted",
  }).select("id, reference").single();
  if (e) return dbError(e, requestId);
  return ok(data, requestId, 201);
});
