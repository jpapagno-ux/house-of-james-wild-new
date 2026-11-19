import { withMember } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { SETUP_STEPS } from "@/lib/platform/setup";

// POST /api/v1/partner/setup { org, step?, skip?, finish? }: a partner admin skips (or un-skips) a set-up step, or
// says set-up is finished. The database checks the role.
export const dynamic = "force-dynamic";

export const POST = withMember(async ({ req, desk, requestId }) => {
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const org = typeof b.org === "string" && isUuid(b.org) ? b.org : null;
  if (!org) return error("not_found", "Not found", requestId);
  const step = typeof b.step === "string" ? b.step : null;
  if (step && !SETUP_STEPS.some((s) => s.key === step)) return invalid({ ok: false, message: "Unknown step", field: "step" }, requestId);
  const { error: e } = await desk.sb.rpc("partner_setup_mark", { p_org: org, p_step: step, p_skip: b.skip !== false, p_finish: b.finish === true });
  if (e) return rpcError(e, requestId);
  return ok({ ok: true }, requestId);
});
