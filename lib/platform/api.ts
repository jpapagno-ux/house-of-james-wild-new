import "server-only";
import { NextResponse } from "next/server";
import { dbError, error, jsonBody, ok } from "@/lib/booking-live/api";
import type { Err } from "./validate";

export { dbError, error, jsonBody, ok };

const HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

/** 400 with the field that failed, so the form can point at it. */
export function invalid(e: Err, requestId: string) {
  return NextResponse.json({ error: { code: "invalid_input", message: e.message, field: e.field }, requestId }, { status: 400, headers: { ...HEADERS, "X-Request-Id": requestId } });
}

/** Maps a Postgres error raised by our own functions (with a house-written message) to a stable code. */
export function rpcError(e: { code?: string; message?: string } | null, requestId: string) {
  if (!e) return error("server_error", "Unknown error", requestId);
  const msg = e.message ?? "";
  if (e.code === "42501") return error("forbidden", msg || "You don't have access to that", requestId);
  if (e.code === "P0002") return error("not_found", msg || "Not found", requestId);
  if (e.code === "23514") return error("invalid_input", msg || "That isn't allowed", requestId);
  if (e.code === "40001") return error("conflict", msg, requestId);
  return dbError(e, requestId);
}
