import { withTraveler, ok, error, jsonBody, dbError } from "@/lib/booking-live/api";
import { isUuid, parseItem } from "@/lib/booking-live/validate";

// POST /api/v1/me/folios/:id/items — add a stay (by slug) or a note/voyage/etc.
// Owner and editors only; RLS rejects viewers and strangers.
export const dynamic = "force-dynamic";

export const POST = withTraveler("accounts", async ({ req, sb, params, requestId }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const parsed = parseItem(await jsonBody(req));
  if (!parsed.ok) return error(parsed.code, parsed.message, requestId);
  const { slug, ...rest } = parsed.value;
  let property_id: string | null = null;
  if (slug) {
    const { data: prop } = await sb.from("properties").select("id").eq("slug", slug).maybeSingle();
    if (!prop) return error("not_found", "That stay isn't in the Ledger", requestId);
    property_id = prop.id;
  }
  const { data: last } = await sb.from("folio_items").select("sort_order").eq("folio_id", params.id).order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error: e } = await sb
    .from("folio_items")
    .insert({ folio_id: params.id, property_id, ...rest, sort_order: (last?.sort_order ?? -1) + 1 })
    .select("id")
    .single();
  return e ? dbError(e, requestId) : ok(data, requestId, 201);
});
