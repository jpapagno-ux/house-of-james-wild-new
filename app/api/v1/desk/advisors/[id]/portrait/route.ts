import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { requestRebuild } from "@/lib/platform/rebuild";

// POST /api/v1/desk/advisors/:id/portrait { publicId }: once the advisor's accepted portrait is in the house
// Cloudinary library (jwco/advisors/<slug>/portrait), the house records it and the card shows it. Empty clears it.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const id = typeof b.publicId === "string" ? b.publicId.trim().replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]*\/)*?(?=jwco\/)/, "").replace(/\.(jpe?g|png|webp|avif)$/i, "") : "";
  if (id && !/^jwco\/advisors\/[a-z0-9-]+\/portrait(-[a-z0-9]+)?$/.test(id)) return invalid({ ok: false, message: "Use the house library path, like jwco/advisors/anthony-papagno/portrait", field: "publicId" }, requestId);
  const { error: e } = await desk.sb.rpc("set_advisor_portrait", { p_advisor: params.id, p_public_id: id || null });
  if (e) return rpcError(e, requestId);
  return ok({ portrait: id || null, rebuild: await requestRebuild("advisor portrait") }, requestId);
});
