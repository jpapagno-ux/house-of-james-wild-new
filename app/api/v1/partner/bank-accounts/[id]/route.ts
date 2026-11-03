import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/bank-accounts/:id { status: "verified" | "rejected", reviewNote? } — house admins
// and finance only (the database refuses anyone else). Verifying retires the previous account in that currency.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = (await jsonBody(req)) as { status?: unknown; reviewNote?: unknown } | null;
  if (b?.status !== "verified" && b?.status !== "rejected") return invalid({ ok: false, message: "Verify or return only", field: "status" }, requestId);
  const review_note = typeof b.reviewNote === "string" ? b.reviewNote.trim().slice(0, 500) || null : null;
  const { data, error: e } = await desk.sb.from("partner_bank_accounts").update({ status: b.status, review_note }).eq("id", params.id).eq("status", "pending").select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "Only the house's finance team verifies banking details", requestId);
  return ok({ id: params.id, status: b.status }, requestId);
});
