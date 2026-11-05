import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseRoomRequest, roomRequestNote } from "@/lib/platform/rooms";

// POST /api/v1/partner/rooms/request — a new room, or a change to a room's name or occupancy (D-08).
// The Airtable rates sync owns those, so this files a request (a submission the house reads in its
// review queue) for the house to load into Airtable; the sync then brings it to the site.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  if (!desk.org) return error("not_found", "No organization in view", requestId);
  if (!desk.membership) return error("forbidden", "The house loads rooms in Airtable directly", requestId);
  const p = parseRoomRequest(await jsonBody(req));
  if (!p.ok) return invalid(p, requestId);
  const r = p.value;
  let current: string | undefined;
  if (r.kind === "change") {
    const { data: room } = await desk.sb.from("room_types").select("name, property_id").eq("id", r.roomId!).maybeSingle();
    if (!room || room.property_id !== r.propertyId) return error("not_found", "Room not found", requestId);
    current = room.name as string;
  }
  const { data, error: e } = await desk.sb.from("submissions").insert({
    organization_id: desk.org.id, property_id: r.propertyId, kind: "rooms",
    title: (r.kind === "new" ? `New room: ${r.name}` : `Room change: ${current} → ${r.name}`).slice(0, 160),
    partner_note: roomRequestNote(r, current), status: "submitted",
  }).select("id, reference").single();
  if (e) return dbError(e, requestId);
  return ok(data, requestId, 201);
});
