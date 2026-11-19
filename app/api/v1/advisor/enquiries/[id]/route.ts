import { withAdvisor } from "@/lib/platform/advisor-api";
import { ok } from "@/lib/platform/api";
import { error, jsonBody } from "@/lib/booking-live/api";
import { canSee, isRecordId, parseStatusChange, statusFields } from "@/lib/platform/enquiry-inbox";
import { advisorRecordId, loadEnquiry, patchEnquiry } from "@/lib/platform/enquiry-inbox-data";

// PATCH /api/v1/advisor/enquiries/:id { status, closedReason?, note? }: an active advisor sets the status of
// an enquiry addressed to them. The enquiry is re-read and the link to the advisor checked on every call.
export const dynamic = "force-dynamic";

export const PATCH = withAdvisor(async ({ req, a, requestId, params }) => {
  if (a.advisor.status !== "active" || !isRecordId(params.id)) return error("not_found", "Not found", requestId);
  const parsed = parseStatusChange(await jsonBody(req));
  if (!parsed.ok) return error("invalid_input", parsed.message, requestId);
  const [e, mine] = await Promise.all([loadEnquiry(params.id), advisorRecordId(a.advisor.slug)]);
  if (!e || !canSee(e, mine)) return error("not_found", "Not found", requestId);
  if (!(await patchEnquiry(e.recordId, statusFields(parsed.value, new Date().toISOString())))) return error("server_error", "The status could not be saved. Try again.", requestId);
  return ok({ status: parsed.value.status }, requestId);
});
