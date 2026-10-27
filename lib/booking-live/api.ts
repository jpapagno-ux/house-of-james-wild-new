import "server-only";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { FLAGS, type FlagName } from "./flags";
import { currentUser } from "./supabase/server";
import { ERROR_CODES, type ErrorCode } from "./validate";

// Shared plumbing for /api/v1: correlation IDs, stable error envelopes, a
// small per-instance rate limit, flag gating and the signed-in check.
// Responses are never cached (private data).

const HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export const newRequestId = () => crypto.randomUUID();

export function ok(body: unknown, requestId: string, status = 200) {
  return NextResponse.json({ data: body, requestId }, { status, headers: { ...HEADERS, "X-Request-Id": requestId } });
}

export function error(code: ErrorCode, message: string, requestId: string) {
  return NextResponse.json({ error: { code, message }, requestId }, { status: ERROR_CODES[code], headers: { ...HEADERS, "X-Request-Id": requestId } });
}

// Per-instance token bucket: 60 writes a minute per IP. A first line only;
// Vercel Firewall rate rules sit in front of this at launch (Phase 5).
const buckets = new Map<string, { n: number; at: number }>();
export function rateLimited(req: Request, limit = 60): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now(), b = buckets.get(ip);
  if (!b || now - b.at > 60_000) { buckets.set(ip, { n: 1, at: now }); return false; }
  b.n += 1;
  if (buckets.size > 5000) buckets.clear();
  return b.n > limit;
}

type Handler = (ctx: { req: Request; user: User; sb: Awaited<ReturnType<typeof currentUser>>["sb"]; requestId: string; params: Record<string, string> }) => Promise<Response>;

/** Wraps a route: flag on? rate limit (writes)? signed in? then the handler. */
export function withTraveler(flag: FlagName, handler: Handler) {
  return async (req: Request, route: { params: Promise<Record<string, string>> }) => {
    const requestId = newRequestId();
    if (!FLAGS[flag]) return error("feature_off", "Not found", requestId);
    if (req.method !== "GET" && rateLimited(req)) return error("rate_limited", "Too many requests, try again in a minute", requestId);
    try {
      const { sb, user } = await currentUser();
      if (!user) return error("sign_in_required", "Sign in to continue", requestId);
      const params = (await route?.params) ?? {};
      return await handler({ req, user, sb, requestId, params });
    } catch (e) {
      console.error(JSON.stringify({ requestId, route: new URL(req.url).pathname, error: e instanceof Error ? e.message : String(e) }));
      return error("server_error", "Something went wrong; the house has been notified", requestId);
    }
  };
}

/** Reads a JSON body, returning undefined (→ invalid_input) when it isn't JSON. */
export async function jsonBody(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { return undefined; }
}

/** Maps Postgres / PostgREST errors to stable codes without leaking detail. */
export function dbError(e: { code?: string; message?: string } | null, requestId: string) {
  if (!e) return error("server_error", "Unknown database error", requestId);
  if (e.code === "23505") return error("conflict", "Already saved", requestId);
  if (e.code === "42501" || e.code === "PGRST301") return error("forbidden", "You don't have access to that", requestId);
  if (e.code === "23503" || e.code === "PGRST116") return error("not_found", "Not found", requestId);
  if (e.code === "23514" || e.code === "22P02") return error("invalid_input", "That value isn't allowed", requestId);
  console.error(JSON.stringify({ requestId, db: e.code, message: e.message }));
  return error("server_error", "Something went wrong; the house has been notified", requestId);
}
