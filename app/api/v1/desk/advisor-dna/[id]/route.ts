import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { requestRebuild } from "@/lib/platform/rebuild";
import { advisorAlert, noticeEmail } from "@/lib/platform/advisor-alerts";

// POST /api/v1/desk/advisor-dna/:id { status: "approved" | "returned", note }: the house decides an
// advisor's DNA. Approved, it becomes what the website shows (for active advisors) and a rebuild is asked
// for, so destination pages carry it within minutes.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  if (b.status !== "approved" && b.status !== "returned") return invalid({ ok: false, message: "Approve or return", field: "status" }, requestId);
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) : "";
  if (b.status === "returned" && !note) return invalid({ ok: false, message: "Say why it is returned; the advisor sees this", field: "note" }, requestId);
  const { error: e } = await desk.sb.rpc("decide_advisor_dna", { p_proposal: params.id, p_status: b.status, p_note: note || null });
  if (e) return rpcError(e, requestId);
  const { data: pr } = await desk.sb.from("advisor_dna_proposals").select("advisor_id").eq("id", params.id).maybeSingle();
  if (pr) await advisorAlert(await noticeEmail(desk.sb, pr.advisor_id), { kind: "dna_decided", status: b.status }, req, "/advisor/file/dna");
  const rebuild = b.status === "approved" ? await requestRebuild("advisor DNA approved") : "skipped";
  return ok({ decided: b.status, rebuild }, requestId);
});
