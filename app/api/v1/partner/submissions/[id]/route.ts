import { withMember } from "@/lib/platform/membership";
import { dbError, error, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/submissions/:id — { action: "withdraw" } or
// { action: "resubmit", note } after the house has asked a question.
// The database refuses any change once the house has decided.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const body = (await jsonBody(req)) as { action?: unknown; note?: unknown } | undefined;
  const action = body?.action;
  if (action !== "withdraw" && action !== "resubmit") return error("invalid_input", "Choose withdraw or resubmit", requestId);
  const patch: Record<string, unknown> = { status: action === "withdraw" ? "withdrawn" : "submitted" };
  if (action === "resubmit") {
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 4000) : "";
    if (!note) return error("invalid_input", "Add your answer for the house", requestId);
    const { data: cur } = await desk.sb.from("submissions").select("partner_note").eq("id", params.id).maybeSingle();
    patch.partner_note = `${cur?.partner_note ? `${cur.partner_note}\n\n` : ""}Reply, ${new Date().toISOString().slice(0, 10)}: ${note}`.slice(0, 4000);
  }
  const { data, error: e } = await desk.sb.from("submissions").update(patch).eq("id", params.id).select("id, status");
  if (e) return e.code === "42501" ? rpcError(e, requestId) : dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change this update", requestId);
  return ok(data[0], requestId);
});
