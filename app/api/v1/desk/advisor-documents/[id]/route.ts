import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/advisor-documents/:id { status: "accepted" | "returned", note }: the house decides
// an advisor's document. A returned document needs a reason the advisor will see.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  if (b.status !== "accepted" && b.status !== "returned") return invalid({ ok: false, message: "Accept or return", field: "status" }, requestId);
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) : "";
  if (b.status === "returned" && !note) return invalid({ ok: false, message: "Say why it is returned; the advisor sees this", field: "note" }, requestId);
  const { error: e } = await desk.sb.rpc("decide_advisor_document", { p_document: params.id, p_status: b.status, p_note: note || null });
  if (e) return rpcError(e, requestId);
  return ok({ decided: b.status }, requestId);
});
