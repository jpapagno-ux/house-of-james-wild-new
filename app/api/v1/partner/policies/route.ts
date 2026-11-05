import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parsePolicy } from "@/lib/platform/commercial";

// POST /api/v1/partner/policies — submit a cancellation or refund policy, as text or a document (D-26).
// It goes to the house for approval; nothing reaches guests or advisors until it is approved.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  const p = parsePolicy(((await jsonBody(req)) ?? {}) as Record<string, unknown>);
  if (!p.ok) return invalid(p, requestId);
  const { data, error: e } = await desk.sb.from("partner_policies")
    .insert({ ...p.value, organization_id: desk.org.id, submitted_by: desk.user.id }).select("id").single();
  if (e) return dbError(e, requestId);
  return ok({ id: data.id }, requestId);
});
