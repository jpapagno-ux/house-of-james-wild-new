import { withAdvisor } from "@/lib/platform/advisor-api";
import { invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { requestRebuild } from "@/lib/platform/rebuild";
import { houseAlert } from "@/lib/platform/advisor-alerts";

// POST /api/v1/advisor/profile { visible?: boolean, awayUntil?: "YYYY-MM-DD" | null } (James, 18 Nov 2026).
// Off takes the profile off the site at the next rebuild (asked for now); on is a request the house approves.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  if ("awayUntil" in b) {
    const v = b.awayUntil;
    if (v !== null && (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v))) return invalid({ ok: false, message: "Choose a date", field: "awayUntil" }, requestId);
    const { data, error: e } = await a.sb.rpc("set_advisor_away", { p_until: v });
    if (e) return rpcError(e, requestId);
    out.awayUntil = data;
  }
  if (typeof b.visible === "boolean") {
    const { data, error: e } = await a.sb.rpc("set_advisor_profile_visible", { p_visible: b.visible });
    if (e) return rpcError(e, requestId);
    out.profile = data;
    if (data === "requested") await houseAlert({ kind: "profile_requested", advisor: a.advisor.display_name }, req, `/desk/advisors/${a.advisor.id}`);
  }
  if (out.profile === "hidden" || "awayUntil" in out) out.rebuild = await requestRebuild("advisor profile changed");
  return ok(out, requestId);
});
