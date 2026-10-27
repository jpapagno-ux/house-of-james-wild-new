import { withTraveler, ok, error, dbError } from "@/lib/booking-live/api";
import { isUuid } from "@/lib/booking-live/validate";

// DELETE /api/v1/me/favorites/:id — :id is the favorite id, or a stay slug.
// RLS limits the delete to the caller's own rows; another traveler's id simply
// matches nothing and returns not_found.
export const dynamic = "force-dynamic";

export const DELETE = withTraveler("accounts", async ({ sb, user, params, requestId }) => {
  const key = params.id ?? "";
  let q = sb.from("favorites").delete().eq("user_id", user.id);
  if (isUuid(key)) q = q.eq("id", key);
  else if (/^[a-z0-9-]{2,120}$/.test(key)) {
    const { data: prop } = await sb.from("properties").select("id").eq("slug", key).maybeSingle();
    if (!prop) return error("not_found", "Not found", requestId);
    q = q.eq("property_id", prop.id);
  } else return error("invalid_input", "Expected a favorite id or stay slug", requestId);
  const { data, error: e } = await q.select("id");
  if (e) return dbError(e, requestId);
  return data?.length ? ok({ removed: true }, requestId) : error("not_found", "Not found", requestId);
});
