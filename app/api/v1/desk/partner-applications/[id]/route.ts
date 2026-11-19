import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/desk/partner-applications/:id { status: "reviewing" | "declined" | "new", note? }: the house files an
// application. Inviting is its own route (partners/invite), which marks it invited.
export const dynamic = "force-dynamic";

export const PATCH = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const status = b.status;
  if (status !== "reviewing" && status !== "declined" && status !== "new") return invalid({ ok: false, message: "Choose reviewing or declined", field: "status" }, requestId);
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) || null : null;
  const { data, error: e } = await desk.sb.from("partner_applications")
    .update({ status, house_note: note, decided_at: status === "new" ? null : new Date().toISOString() })
    .eq("id", params.id).select("id").maybeSingle();
  if (e) return rpcError(e, requestId);
  if (!data) return error("not_found", "Not found", requestId);
  return ok({ id: data.id, status }, requestId);
});
