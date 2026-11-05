import { revalidateTag } from "next/cache";
import { withMember } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/hosts/:id { action: "approve" | "decline", note? } — the house decides a proposed host.
// Approving replaces the page's previous host and keeps the partner's on/off choice (public.decide_host).
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as { action?: unknown; note?: unknown };
  if (b.action !== "approve" && b.action !== "decline") return invalid({ ok: false, message: "Approve or decline", field: "action" }, requestId);
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) || null : null;
  const { data, error: e } = await desk.sb.rpc("decide_host", { p_host: params.id, p_action: b.action, p_note: note });
  if (e) return rpcError(e, requestId);
  revalidateTag("site-hosts");
  return ok({ id: params.id, status: (data as { status?: string } | null)?.status ?? null }, requestId);
}, { house: true });
