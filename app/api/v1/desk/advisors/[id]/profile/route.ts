import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { requestRebuild } from "@/lib/platform/rebuild";

// POST /api/v1/desk/advisors/:id/profile { visible: boolean, message?: string }: the house shows a profile (approving
// the advisor's request) or hides it, with an optional note the advisor sees on their desk.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  if (typeof b.visible !== "boolean") return invalid({ ok: false, message: "Show or hide?", field: "visible" }, requestId);
  const message = typeof b.message === "string" ? b.message.slice(0, 500) : null;
  const { error: e } = await desk.sb.rpc("house_set_advisor_profile", { p_advisor: params.id, p_visible: b.visible, p_message: message });
  if (e) return rpcError(e, requestId);
  return ok({ visible: b.visible, rebuild: await requestRebuild("house changed an advisor profile") }, requestId);
});
