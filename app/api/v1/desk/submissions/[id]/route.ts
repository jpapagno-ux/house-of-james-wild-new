import { withHouse } from "@/lib/platform/membership";
import { error, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/submissions/:id — { action: approve | reject | ask | in_review, note }
// for an update that carries no field changes (a reply, a document). Field changes are
// decided one by one first (/api/v1/desk/revisions/:id).
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = (await jsonBody(req)) as { action?: unknown; note?: unknown } | undefined;
  const action = b?.action;
  if (action !== "approve" && action !== "reject" && action !== "ask" && action !== "in_review") return error("invalid_input", "Choose approve, reject, ask or in review", requestId);
  const note = typeof b?.note === "string" ? b.note.trim().slice(0, 4000) || null : null;
  if ((action === "ask" || action === "reject") && !note) return error("invalid_input", "Tell the partner why", requestId);
  const { data, error: e } = await desk.sb.rpc("decide_submission", { p_submission: params.id, p_action: action, p_note: note });
  if (e) return rpcError(e, requestId);
  return ok({ status: data }, requestId);
});
