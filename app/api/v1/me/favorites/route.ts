import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { parseFavorite } from "@/lib/booking-live/validate";

// GET  /api/v1/me/favorites  → everything the traveler has saved, newest first
// POST /api/v1/me/favorites  { property: "<slug>" } → save a stay (idempotent)
// POST /api/v1/me/favorites  { item: { path, title } } → save a ship, voyage, safari or route page (idempotent)
export const dynamic = "force-dynamic";

export const GET = withTraveler("accounts", async ({ sb, requestId }) => {
  const { data, error: e } = await sb
    .from("favorites")
    .select("id, created_at, item_type, item_path, item_title, property:properties(slug, name, country, legacy_cms_id)")
    .order("created_at", { ascending: false });
  return e ? dbError(e, requestId) : ok(data, requestId);
});

export const POST = withTraveler("save", async ({ req, sb, user, requestId }) => {
  const parsed = parseFavorite(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  if ("item" in parsed.value) {
    const { type, path, title } = parsed.value.item;
    const { data: had } = await sb.from("favorites").select("id").eq("user_id", user.id).eq("item_path", path).maybeSingle();
    if (had) return ok({ saved: true, id: had.id, item: path }, requestId, 200);
    const { data: made, error: ie } = await sb.from("favorites").insert({ user_id: user.id, item_type: type, item_path: path, item_title: title }).select("id").maybeSingle();
    // 23505: saved in another tab a moment ago; that is still saved.
    if (ie && ie.code !== "23505") return dbError(ie, requestId);
    return ok({ saved: true, id: made?.id ?? null, item: path }, requestId, 201);
  }
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
