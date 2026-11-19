import { withHouse } from "@/lib/platform/membership";
import { ok } from "@/lib/platform/api";
import { error, jsonBody } from "@/lib/booking-live/api";
import { ADVISOR_DESK } from "@/lib/platform/flags";
import { EQ, isRecordId, parseStatusChange, statusFields } from "@/lib/platform/enquiry-inbox";
import { assignableAdvisors, loadEnquiry, patchEnquiry } from "@/lib/platform/enquiry-inbox-data";

// PATCH /api/v1/desk/enquiries/:id, James Wild & Co editors only:
//   { advisorSlug }                    reassign the enquiry to an active advisor (no email is sent)
//   { status, closedReason?, note? }   set its status
export const dynamic = "force-dynamic";

export const PATCH = withHouse(async ({ req, requestId, params }) => {
  if (!ADVISOR_DESK || !isRecordId(params.id)) return error("not_found", "Not found", requestId);
  const body = await jsonBody(req);
  const e = await loadEnquiry(params.id);
  if (!e) return error("not_found", "Not found", requestId);
  if (typeof body === "object" && body !== null && "advisorSlug" in body) {
    const b = body as Record<string, unknown>;
    if (Object.keys(b).length !== 1 || typeof b.advisorSlug !== "string") return error("invalid_input", "Choose an advisor", requestId);
    const to = (await assignableAdvisors()).find((x) => x.slug === b.advisorSlug);
    if (!to) return error("invalid_input", "That advisor is not active on the desk", requestId);
    if (!(await patchEnquiry(e.recordId, { [EQ.advisor]: [to.recordId] }))) return error("server_error", "The enquiry could not be reassigned. Try again.", requestId);
    return ok({ advisor: to.slug }, requestId);
  }
  const parsed = parseStatusChange(body);
  if (!parsed.ok) return error("invalid_input", parsed.message, requestId);
  if (!(await patchEnquiry(e.recordId, statusFields(parsed.value, new Date().toISOString())))) return error("server_error", "The status could not be saved. Try again.", requestId);
  return ok({ status: parsed.value.status }, requestId);
});
