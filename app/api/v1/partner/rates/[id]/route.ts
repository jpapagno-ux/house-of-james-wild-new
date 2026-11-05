import { withMember } from "@/lib/platform/membership";
import { dbError, error, invalid, jsonBody, ok } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// PATCH /api/v1/partner/rates/:id
//   house: { status: "loaded", airtableCard } once it is in the Airtable rates base, or { status: "returned", reviewNote }
//   partner: { status: "withdrawn" } on their own proposal while it is still open
// The database enforces who may do which.
export const dynamic = "force-dynamic";

export const PATCH = withMember(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as { status?: unknown; airtableCard?: unknown; reviewNote?: unknown };
  const status = b.status;
  if (status !== "loaded" && status !== "returned" && status !== "withdrawn") return invalid({ ok: false, message: "Loaded, returned or withdrawn", field: "status" }, requestId);
  const card = typeof b.airtableCard === "string" ? b.airtableCard.trim().slice(0, 120) : "";
  const note = typeof b.reviewNote === "string" ? b.reviewNote.trim().slice(0, 1000) : "";
  if (status === "loaded" && !card) return invalid({ ok: false, message: "Name the Airtable card it went into, e.g. 2027-V1", field: "airtableCard" }, requestId);
  if (status === "returned" && !note) return invalid({ ok: false, message: "Tell the partner why", field: "reviewNote" }, requestId);
  const change: Record<string, unknown> = { status };
  if (status === "loaded") change.airtable_card = card;
  if (status === "returned") change.review_note = note;
  const { data, error: e } = await desk.sb.from("rate_proposals").update(change).eq("id", params.id).eq("status", "submitted").select("id");
  if (e) return dbError(e, requestId);
  if (!data?.length) return error("forbidden", "You can't change this one", requestId);
  return ok({ id: params.id, status }, requestId);
});
