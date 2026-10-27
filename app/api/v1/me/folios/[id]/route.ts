import { withTraveler, ok, error, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";

// DELETE /api/v1/me/folios/:id — owner only (RLS). Deletion is audited.
export const dynamic = "force-dynamic";

export const DELETE = withTraveler("accounts", async ({ sb, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const { data, error: e } = await sb.from("folios").delete().eq("id", params.id).select("id");
  if (e) return dbError(e, requestId);
  return data?.length ? ok({ removed: true }, requestId) : error("not_found", "Not found", requestId);
});
