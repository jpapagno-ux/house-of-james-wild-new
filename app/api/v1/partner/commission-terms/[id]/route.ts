import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/commission-terms/:id { status?, contractDocumentId? } — confirm or retire a term,
// or link it to the signed contract it comes from. House finance only
// (enforced by the database); terms are never edited in place, a new rate is a new term with a new date.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const body = (await jsonBody(req)) as { status?: unknown; contractDocumentId?: unknown } | null;
  const change: { status?: string; contract_document_id?: string | null } = {};
  if (body?.status !== undefined) {
    if (body.status !== "confirmed" && body.status !== "retired" && body.status !== "to_confirm") return invalid({ ok: false, message: "Confirm or retire only", field: "status" }, requestId);
    change.status = body.status;
  }
  if (body?.contractDocumentId !== undefined) {
    if (body.contractDocumentId !== null && !isUuid(body.contractDocumentId)) return invalid({ ok: false, message: "Choose a contract", field: "contractDocumentId" }, requestId);
    change.contract_document_id = body.contractDocumentId as string | null;
  }
  if (!Object.keys(change).length) return invalid({ ok: false, message: "Nothing to change", field: "status" }, requestId);
  const { data, error: e } = await desk.sb.from("commission_terms").update(change).eq("id", params.id).select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change these terms", requestId);
  return ok({ id: params.id, ...change }, requestId);
});
