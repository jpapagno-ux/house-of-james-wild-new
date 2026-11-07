import { withAdvisor } from "@/lib/platform/advisor-api";
import { invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { parseDna } from "@/lib/platform/advisor-dna";

// POST /api/v1/advisor/dna: the advisor sends their Advisor DNA for the house to approve. A newer send
// replaces one still waiting. Nothing reaches the website until the house approves it.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  const p = parseDna(((await jsonBody(req)) ?? {}) as Record<string, unknown>);
  if (!p.ok) return invalid({ ok: false, message: p.message, field: p.field }, requestId);
  const { data, error: e } = await a.sb.rpc("submit_advisor_dna", { p_dna: p.value });
  if (e) return rpcError(e, requestId);
  return ok({ proposal: data }, requestId);
});
