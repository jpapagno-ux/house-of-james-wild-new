import { withHouse } from "@/lib/platform/membership";
import { error, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/advisors/:id/activate: the house activates a complete file (activate_advisor checks
// every part, and that the agreement is not the attorney's draft unless the advisor is the house's own).
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { error: e } = await desk.sb.rpc("activate_advisor", { p_advisor: params.id });
  if (e) return rpcError(e.message?.startsWith("The file is not complete") ? { ...e, message: "The file is not complete yet: every part filed and both required documents accepted" } : e, requestId);
  return ok({ active: true }, requestId);
});
