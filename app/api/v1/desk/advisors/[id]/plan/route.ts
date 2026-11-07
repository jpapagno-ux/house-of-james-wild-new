import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/advisors/:id/plan { tier?, from?, feeDollars?, feePeriod, terms }: the house sets an
// advisor's plan. A new tier is dated and applies from that date on (Section 6.4 of the agreement).
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const tier = b.tier === "tier_1" || b.tier === "tier_2" || b.tier === "tier_3" ? b.tier : null;
  const from = typeof b.from === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.from) ? b.from : null;
  const period = b.feePeriod === "month" || b.feePeriod === "year" ? b.feePeriod : "none";
  const dollars = typeof b.feeDollars === "string" || typeof b.feeDollars === "number" ? Number(b.feeDollars) : 0;
  if (!Number.isFinite(dollars) || dollars < 0 || dollars > 100000) return invalid({ ok: false, message: "Enter the fee in dollars", field: "feeDollars" }, requestId);
  const terms = typeof b.terms === "string" ? b.terms.trim().slice(0, 600) : "";
  const { error: e } = await desk.sb.rpc("set_advisor_plan", {
    p_advisor: params.id, p_tier: tier, p_from: from, p_fee_minor: period === "none" ? null : Math.round(dollars * 100), p_fee_period: period, p_terms: terms,
  });
  if (e) return rpcError(e, requestId);
  return ok({ saved: true }, requestId);
});
