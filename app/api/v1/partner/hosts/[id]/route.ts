import { revalidateTag } from "next/cache";
import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/hosts/:id { showOnSite: boolean } — the toggle: switch an approved host's card on
// or off, at once. Or { withdraw: true } to take back a proposal still with the house.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const body = ((await jsonBody(req)) ?? {}) as { showOnSite?: unknown; withdraw?: unknown };
  let change: Record<string, unknown>;
  if (typeof body.showOnSite === "boolean") change = { show_on_site: body.showOnSite };
  else if (body.withdraw === true) change = { status: "retired" };
  else return invalid({ ok: false, message: "Switch the card on or off, or withdraw", field: "showOnSite" }, requestId);
  let q = desk.sb.from("site_hosts").update(change).eq("id", params.id);
  q = "status" in change ? q.eq("status", "proposed") : q.eq("status", "approved");
  const { data, error: e } = await q.select("id, show_on_site, status");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change that host", requestId);
  revalidateTag("site-hosts");
  return ok(data[0], requestId);
});
