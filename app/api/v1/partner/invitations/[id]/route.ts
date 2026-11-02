import { withMember } from "@/lib/platform/membership";
import { dbError, error, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// DELETE /api/v1/partner/invitations/:id — revoke an invitation that hasn't been accepted.
export const dynamic = "force-dynamic";

export const DELETE = withMember(async ({ desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data, error: e } = await desk.sb.from("org_invitations").update({ revoked_at: new Date().toISOString() })
    .eq("id", params.id).is("accepted_at", null).is("revoked_at", null).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("not_found", "That invitation is no longer open", requestId);
  return ok({ id: params.id, revoked: true }, requestId);
});
