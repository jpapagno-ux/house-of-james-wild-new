import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/documents/:id { status: "archived" | "active" } — archive or restore.
// Partners archive their own supporting and commercial documents; contracts only by the house.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const body = (await jsonBody(req)) as { status?: unknown } | null;
  const status = body?.status;
  if (status !== "archived" && status !== "active") return invalid({ ok: false, message: "Archive or restore only", field: "status" }, requestId);
  const { data, error: e } = await desk.sb.from("partner_documents").update({ status }).eq("id", params.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change this document", requestId);
  return ok({ id: params.id, status }, requestId);
});
