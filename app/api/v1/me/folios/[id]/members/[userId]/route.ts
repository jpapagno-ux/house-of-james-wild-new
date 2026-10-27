import { withTraveler, ok, error, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";

// DELETE /api/v1/me/folios/:id/members/:userId — the owner revokes a member.
// Access ends on the member's next request (RLS checks access_status).
export const dynamic = "force-dynamic";

export const DELETE = withTraveler("share", async ({ sb, params, requestId }) => {
  if (!isUuid(params.id) || !isUuid(params.userId)) return error("not_found", "Not found", requestId);
  const { data, error: e } = await sb
    .from("folio_members")
    .update({ access_status: "revoked" })
    .eq("folio_id", params.id)
    .eq("user_id", params.userId)
    .select("user_id");
  if (e) return dbError(e, requestId);
  return data?.length ? ok({ revoked: true }, requestId) : error("not_found", "Not found", requestId);
});
