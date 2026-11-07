import "server-only";
import { ADVISOR_DESK } from "./flags";
import { error, newRequestId, rateLimited } from "@/lib/booking-live/api";
import { loadAdvisor, type AdvisorContext } from "./advisor";

// API wrapper for the Advisor Desk: same-origin writes, a rate limit, a signed-in advisor (invited or
// active) with the authenticator code. The database rules still decide every read and write.
type Handler = (ctx: { req: Request; a: AdvisorContext; requestId: string; params: Record<string, string> }) => Promise<Response>;

export function withAdvisor(handler: Handler) {
  return async (req: Request, route: { params: Promise<Record<string, string>> }) => {
    const requestId = newRequestId();
    if (!ADVISOR_DESK) return error("feature_off", "Not found", requestId);
    if (req.method !== "GET" && rateLimited(req, 40)) return error("rate_limited", "Too many requests, try again in a minute", requestId);
    if (req.method !== "GET") {
      const origin = req.headers.get("origin");
      if (origin && new URL(origin).host !== new URL(req.url).host) return error("forbidden", "Cross-site request refused", requestId);
    }
    try {
      const a = await loadAdvisor();
      if (!a) return error("sign_in_required", "Sign in to continue", requestId);
      if (a.mfa !== "ok") return error("forbidden", "Enter the code from your authenticator app first", requestId);
      if (a.advisor.status !== "invited" && a.advisor.status !== "active") return error("forbidden", "This advisor desk is paused", requestId);
      const params = (await route?.params) ?? {};
      return await handler({ req, a, requestId, params });
    } catch (e) {
      console.error(JSON.stringify({ requestId, route: new URL(req.url).pathname, error: e instanceof Error ? e.message : String(e) }));
      return error("server_error", "Something went wrong; the house has been notified", requestId);
    }
  };
}
