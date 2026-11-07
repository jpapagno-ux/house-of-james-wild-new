import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { priceMinor } from "@/lib/platform/advisor-requests";

// POST /api/v1/desk/advisor-requests/:id/commission { base, rate?, note? }: house finance records the
// commission line for a confirmed request. Rate from the terms on file unless overridden with a reason.
export const dynamic = "force-dynamic";

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const base = priceMinor(b.base);
  if (base === null) return invalid({ ok: false, message: "The commissionable amount, like 10,000", field: "base" }, requestId);
  let rateBp: number | null = null;
  if (b.rate !== undefined && b.rate !== "" && b.rate !== null) {
    const r = Number(String(b.rate).replace("%", "").trim());
    if (!Number.isFinite(r) || r < 0 || r > 100) return invalid({ ok: false, message: "A rate between 0 and 100", field: "rate" }, requestId);
    rateBp = Math.round(r * 100);
  }
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) : "";
  const { data, error: e } = await desk.sb.rpc("record_commission_from_request", { p_request: params.id, p_base_minor: base, p_rate_bp: rateBp, p_note: note || null });
  if (e) return rpcError(e, requestId);
  return ok(data, requestId, 201);
});
