import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/policies/:id { status: "approved" | "rejected", reviewNote? } — house editors only.
// Approving replaces the previously approved policy of the same kind for the same property.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = (await jsonBody(req)) as { status?: unknown; reviewNote?: unknown } | null;
  if (b?.status !== "approved" && b?.status !== "rejected") return invalid({ ok: false, message: "Approve or return only", field: "status" }, requestId);
  const review_note = typeof b.reviewNote === "string" ? b.reviewNote.trim().slice(0, 1000) || null : null;
  const { data, error: e } = await desk.sb.from("partner_policies").update({ status: b.status, review_note }).eq("id", params.id).eq("status", "submitted").select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "Only the house's editors review policies", requestId);
  return ok({ id: params.id, status: b.status }, requestId);
});
