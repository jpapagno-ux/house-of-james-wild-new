import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid, parseDecision } from "@/lib/platform/validate";

// POST /api/v1/desk/revisions/:id — the house decides one proposed change:
// approve | edit_approve (with the value to publish) | reject | ask (with a note).
// public.decide_revision applies only whitelisted fields and refuses stale values.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const p = parseDecision(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { data, error: e } = await desk.sb.rpc("decide_revision", {
    p_revision: params.id, p_action: p.value.action, p_final: p.value.finalValue === null ? null : p.value.finalValue, p_note: p.value.note,
  });
  if (e) return rpcError(e, requestId);
  return ok({ submissionStatus: data }, requestId);
});
