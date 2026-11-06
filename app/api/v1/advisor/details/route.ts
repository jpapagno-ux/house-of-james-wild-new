import { withAdvisor } from "@/lib/platform/advisor-api";
import { dbError, invalid, jsonBody, ok } from "@/lib/platform/api";
import { parseDetails } from "@/lib/platform/advisor-file";

// POST /api/v1/advisor/details: the advisor's details (Schedule B), saved as the advisor.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  const body = await jsonBody(req);
  const p = parseDetails((body ?? {}) as Record<string, unknown>);
  if (!p.ok) return invalid({ ok: false, message: p.message, field: p.field }, requestId);
  const { error: e } = await a.sb.from("advisor_details").upsert({ advisor_id: a.advisor.id, ...p.value }, { onConflict: "advisor_id" });
  if (e) return dbError(e, requestId);
  return ok({ saved: true }, requestId);
});
