import { withAdvisor } from "@/lib/platform/advisor-api";
import { ok, rpcError } from "@/lib/platform/api";
import { error, jsonBody } from "@/lib/booking-live/api";
import { parseTrainingNote } from "@/lib/platform/advisor-training";

// POST   /api/v1/advisor/training { note? }: the advisor registers for the training program (or changes their note).
// DELETE /api/v1/advisor/training: the advisor withdraws their registration.
// Invited and active advisors alike; the database checks it is the caller's own file.
export const dynamic = "force-dynamic";

export const POST = withAdvisor(async ({ req, a, requestId }) => {
  const parsed = parseTrainingNote(await jsonBody(req));
  if (!parsed.ok) return error("invalid_input", parsed.message, requestId);
  const { data, error: e } = await a.sb.rpc("register_for_advisor_training", { p_note: parsed.note });
  if (e) return rpcError(e, requestId);
  return ok({ registered_at: data }, requestId, 201);
});

export const DELETE = withAdvisor(async ({ a, requestId }) => {
  const { data, error: e } = await a.sb.rpc("withdraw_advisor_training");
  if (e) return rpcError(e, requestId);
  return ok({ withdrawn: data === true }, requestId);
});
