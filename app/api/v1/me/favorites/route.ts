import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { parseFavorite } from "@/lib/booking-live/validate";

// GET  /api/v1/me/favorites  → the traveler's saved stays, newest first
// POST /api/v1/me/favorites  { property: "<slug>" } → save (idempotent)
export const dynamic = "force-dynamic";

export const GET = withTraveler("accounts", async ({ sb, requestId }) => {
  const { data, error: e } = await sb
    .from("favorites")
    .select("id, created_at, property:properties(slug, name, country, legacy_cms_id)")
    .order("created_at", { ascending: false });
  return e ? dbError(e, requestId) : ok(data, requestId);
});

export const POST = withTraveler("save", async ({ req, sb, user, requestId }) => {
  const parsed = parseFavorite(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const { data: prop } = await sb.from("properties").select("id").eq("slug", parsed.value.slug).maybeSingle();
  if (!prop) return error("not_found", "That stay isn't in the Ledger", requestId);
  const { data, error: e } = await sb
    .from("favorites")
    .upsert({ user_id: user.id, property_id: prop.id }, { onConflict: "user_id,property_id", ignoreDuplicates: true })
    .select("id")
    .maybeSingle();
  if (e) return dbError(e, requestId);
  return ok({ saved: true, id: data?.id ?? null, property: parsed.value.slug }, requestId, 201);
});
