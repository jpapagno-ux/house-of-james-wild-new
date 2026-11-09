import { withHouse } from "@/lib/platform/membership";
import { error, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// DELETE /api/v1/desk/advisor-invitations/:id: the house withdraws an invitation still open.
export const dynamic = "force-dynamic";

export const DELETE = withHouse(async ({ desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { error: e } = await desk.sb.rpc("revoke_advisor_invitation", { p_invitation: params.id });
  if (e) return rpcError(e, requestId);
  return ok({ revoked: true }, requestId);
});
