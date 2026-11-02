import { withMember } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid, parseTeamChange } from "@/lib/platform/validate";

// PATCH /api/v1/partner/team/:membershipId — { role, status } change a teammate's role or
// remove their access. The database refuses changes to your own access and to house roles.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const p = parseTeamChange(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { error: e } = await desk.sb.rpc("set_team_member", { p_membership: params.id, p_role: p.value.role, p_status: p.value.status });
  if (e) return rpcError(e, requestId);
  return ok({ id: params.id, ...p.value }, requestId);
});
