import { withAdvisor } from "@/lib/platform/advisor-api";
import { ok, rpcError } from "@/lib/platform/api";
import { error } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/advisor/requests/:id/withdraw: the advisor withdraws a request the house has not closed.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ a, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { error: e } = await a.sb.rpc("withdraw_advisor_request", { p_id: params.id });
  if (e) return rpcError(e, requestId);
  return ok({ withdrawn: true }, requestId);
});
