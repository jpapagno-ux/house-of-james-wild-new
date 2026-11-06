import { withAdvisor } from "@/lib/platform/advisor-api";
import { invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/advisor/agreement { agreementId, typedName, consent: true }: signs the current agreement.
// The database checks the version is current, the details are on file, the typed name matches the
// legal name, and records the version, a fingerprint of the exact text, the time and the code.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  if (b.consent !== true) return invalid({ ok: false, message: "Tick the box to confirm you have read and agree to the agreement", field: "consent" }, requestId);
  if (!isUuid(b.agreementId)) return invalid({ ok: false, message: "Reload the page and try again", field: "agreementId" }, requestId);
  const typed = typeof b.typedName === "string" ? b.typedName.slice(0, 160) : "";
  if (typed.trim().length < 2) return invalid({ ok: false, message: "Type your full legal name", field: "typedName" }, requestId);
  const { data, error: e } = await a.sb.rpc("sign_advisor_agreement", { p_agreement: b.agreementId, p_typed_name: typed, p_user_agent: req.headers.get("user-agent")?.slice(0, 400) ?? null });
  if (e) return rpcError(e, requestId);
  return ok({ id: data }, requestId, 201);
});
