import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { ROOM_FIELD, parseRoomChanges } from "@/lib/platform/rooms";

// POST /api/v1/partner/rooms { roomId, changes: { field: value }, note } — a partner proposes room details
// (Stage 2 §3.2). One submission, one revision per field; the database refuses names and occupancy
// (owned by the Airtable rates sync), bad shapes, and anyone without edit rights on the property.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house reviews rooms; it doesn't propose them", requestId);
  const p = parseRoomChanges(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const { roomId, changes, note } = p.value;
  const { data: room } = await desk.sb.from("room_types").select("id, name, property_id").eq("id", roomId).maybeSingle();
  if (!room) return error("not_found", "Room not found", requestId);
  const title = changes.length === 1 ? `${room.name}: ${ROOM_FIELD[changes[0].field].label}` : `${room.name}: ${changes.length} details`;
  const { data: sub, error: e } = await desk.sb.from("submissions")
    .insert({ organization_id: desk.org.id, property_id: room.property_id, kind: "rooms", title: title.slice(0, 160), partner_note: note, status: "draft" })
    .select("id, reference").single();
  if (e) return dbError(e, requestId);
  const { error: e2 } = await desk.sb.from("revisions").insert(changes.map((c) => ({
    submission_id: sub.id, target_table: "room_types", target_id: roomId, field: c.field, proposed_value: c.value, partner_note: note,
  })));
  if (e2) {
    await desk.sb.from("submissions").update({ status: "withdrawn" }).eq("id", sub.id);
    return rpcError(e2, requestId);
  }
  const { error: e3 } = await desk.sb.from("submissions").update({ status: "submitted" }).eq("id", sub.id);
  if (e3) return dbError(e3, requestId);
  return ok(sub, requestId, 201);
});
