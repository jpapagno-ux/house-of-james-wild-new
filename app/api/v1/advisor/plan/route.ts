import { withAdvisor } from "@/lib/platform/advisor-api";
import { ok, rpcError } from "@/lib/platform/api";

// POST /api/v1/advisor/plan: the advisor acknowledges their compensation plan; the database keeps a
// snapshot of the plan as it stood.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ a, requestId }) => {
  const { data, error: e } = await a.sb.rpc("acknowledge_advisor_plan");
  if (e) return rpcError(e, requestId);
  return ok({ id: data }, requestId, 201);
});
