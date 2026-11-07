import { withHouse } from "@/lib/platform/membership";
import { error, invalid, jsonBody, ok, rpcError } from "@/lib/platform/api";
import { isUuid } from "@/lib/platform/validate";
import { priceMinor } from "@/lib/platform/advisor-requests";

// POST /api/v1/desk/advisor-requests/:id { status, price, currency, holdUntil, validUntil, note }: the house
// moves an advisor's quote request on. The database checks the role (house operations, with the code) and
// which way the status may move.
export const dynamic = "force-dynamic";
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export const POST = withHouse(async ({ req, desk, requestId, params }) => {
  if (!isUuid(params.id)) return error("not_found", "Not found", requestId);
  const b = ((await jsonBody(req)) ?? {}) as Record<string, unknown>;
  const status = String(b.status ?? "");
  if (!["pricing", "held", "confirmed", "declined"].includes(status)) return invalid({ ok: false, message: "Choose what happens next", field: "status" }, requestId);
  const price = b.price === "" || b.price == null ? null : priceMinor(b.price);
  if (b.price !== "" && b.price != null && price === null) return invalid({ ok: false, message: "A price like 18,400 or 18400.50", field: "price" }, requestId);
  const date = (k: string) => (typeof b[k] === "string" && ISO.test(b[k] as string) ? (b[k] as string) : null);
  const currency = typeof b.currency === "string" && /^[A-Z]{3}$/.test(b.currency) ? b.currency : null;
  const note = typeof b.note === "string" ? b.note.trim().slice(0, 1000) : "";
  const { error: e } = await desk.sb.rpc("decide_advisor_request", {
    p_id: params.id, p_status: status, p_price_minor: price, p_currency: currency, p_hold_until: date("holdUntil"), p_valid_until: date("validUntil"), p_note: note || null,
  });
  if (e) return rpcError(e, requestId);
  return ok({ status }, requestId);
});
