import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";

// POST /api/v1/desk/commissions/:id { status, on, reference }: house finance moves a commission line on
// (invoiced, received, advisor paid) or cancels it. The database enforces the order.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const status = String(b.status ?? "");
  if (!["invoiced", "received", "advisor_paid", "cancelled"].includes(status)) return invalid({ ok: false, message: "Choose the next step", field: "status" }, requestId);
  const on = typeof b.on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.on) ? b.on : new Date().toISOString().slice(0, 10);
  const reference = typeof b.reference === "string" ? b.reference.trim().slice(0, 120) : "";
  const { error: e } = await desk.sb.rpc("set_commission_status", { p_line: params.id, p_status: status, p_on: on, p_reference: reference || null });
  if (e) return rpcError(e, requestId);
  return ok({ status }, requestId);
});
