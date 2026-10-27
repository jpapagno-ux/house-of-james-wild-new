import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { parseFolio } from "@/lib/booking-live/validate";

// GET  /api/v1/me/folios → Folios the traveler owns or was invited to
// POST /api/v1/me/folios { title, destinationSummary?, startDate?, endDate? }
export const dynamic = "force-dynamic";

export const GET = withTraveler("accounts", async ({ sb, user, requestId }) => {
  const { data, error: e } = await sb
    .from("folios")
    .select("id, title, destination_summary, start_date, end_date, status, owner_user_id, updated_at, folio_items(count)")
    .order("updated_at", { ascending: false });
  if (e) return dbError(e, requestId);
  return ok((data ?? []).map((f) => ({ ...f, shared: f.owner_user_id !== user.id })), requestId);
});

export const POST = withTraveler("accounts", async ({ req, sb, user, requestId }) => {
  const parsed = parseFolio(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const { data, error: e } = await sb.from("folios").insert({ ...parsed.value, owner_user_id: user.id }).select("id, title").single();
  return e ? dbError(e, requestId) : ok(data, requestId, 201);
});
