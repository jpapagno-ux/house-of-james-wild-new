import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid, parseDecision } from "@/lib/platform/validate";
import { CONTENT_FIELD, normaliseValue } from "@/lib/platform/content";
import { ROOM_FIELD, normaliseRoomValue } from "@/lib/platform/rooms";

// POST /api/v1/desk/revisions/:id — the house decides one proposed change:
// approve | edit_approve (with the value to publish) | reject | ask (with a note).
// public.decide_revision applies only whitelisted fields and refuses stale values.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const p = parseDecision(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  // Edit + approve on a content field: lists are typed one per line, so they become arrays here.
  let final: unknown = p.value.finalValue;
  if (final !== null) {
    const { data: rev } = await desk.sb.from("revisions").select("target_table, field").eq("id", params.id).maybeSingle();
    if (rev?.target_table === "entity_content" && CONTENT_FIELD[rev.field]) {
      const n = normaliseValue(rev.field, final);
      if (!n.ok) return invalid({ ok: false, message: n.message, field: "finalValue" }, requestId);
      final = n.value;
    } else if (rev?.target_table === "room_types" && ROOM_FIELD[rev.field]) {
      const n = normaliseRoomValue(rev.field, final);
      if (!n.ok) return invalid({ ok: false, message: n.message, field: "finalValue" }, requestId);
      final = n.value;
    }
  }
  const { data, error: e } = await desk.sb.rpc("decide_revision", {
    p_revision: params.id, p_action: p.value.action, p_final: final, p_note: p.value.note,
  });
  if (e) return rpcError(e, requestId);
  return ok({ submissionStatus: data }, requestId);
});
